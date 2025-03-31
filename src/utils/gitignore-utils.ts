'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { convertGlobToRegExp } from './glob-utils';

// Cache for parsed .gitignore patterns
let gitignorePatterns: RegExp[] = [];
let gitignoreLoaded = false;
let rootPath = '';

/**
 * Loads and parses .gitignore file from the given root directory
 * @param dirPath Root directory path where .gitignore is located
 * @returns Array of RegExp patterns from .gitignore
 */
export function loadGitignorePatterns(dirPath: string): RegExp[] {
	// Only reload if the root path has changed
	if (dirPath === rootPath && gitignoreLoaded) {
		return gitignorePatterns;
	}

	rootPath = dirPath;
	gitignorePatterns = [];
	gitignoreLoaded = false;

	const gitignorePath = path.join(dirPath, '.gitignore');

	if (!fs.existsSync(gitignorePath)) {
		return gitignorePatterns;
	}

	try {
		const content = fs.readFileSync(gitignorePath, 'utf8');
		const lines = content
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#'));

		gitignorePatterns = lines
			.map((pattern) => {
				// Skip empty lines and comments
				if (!pattern || pattern.startsWith('#')) {
					return null;
				}

				// Handle negated patterns (we ignore them for now)
				if (pattern.startsWith('!')) {
					return null;
				}

				// Normalize pattern for regex conversion
				let normalizedPattern = pattern;

				// Handle directory-specific patterns ending with /
				if (pattern.endsWith('/')) {
					// For directories, we need to match:
					// 1. The directory itself (with or without trailing slash)
					// 2. All contents inside that directory
					const dirName = pattern.slice(0, -1); // Remove trailing slash

					// Match the directory itself
					const dirRegex = new RegExp(`^${escapeRegExp(dirName)}/?$`);
					gitignorePatterns.push(dirRegex);

					// Match all contents within the directory
					normalizedPattern = pattern + '**';
				}

				// Convert specific patterns to glob format
				if (!pattern.includes('*') && !pattern.includes('?')) {
					// Simple file/dir name should match anywhere in path
					normalizedPattern = '**/' + normalizedPattern;

					// Also match if it's at the root level
					const rootLevelRegex = new RegExp(`^${escapeRegExp(pattern)}$`);
					gitignorePatterns.push(rootLevelRegex);

					// Match directory with this name anywhere in the path
					const dirRegex = new RegExp(`(^|/)${escapeRegExp(pattern)}/`);
					gitignorePatterns.push(dirRegex);
				}

				try {
					// Special handling for **/ patterns that didn't convert correctly
					if (pattern.startsWith('**/')) {
						// Match the pattern at any level in the directory structure
						const patternWithoutGlob = pattern.substring(3);
						const flexibleRegex = new RegExp(`(^|/)${escapeRegExp(patternWithoutGlob)}(/|$)`);
						gitignorePatterns.push(flexibleRegex);
					}

					// Still convert and add the standard regex pattern
					return convertGlobToRegExp(normalizedPattern);
				} catch (err) {
					console.error(`Error converting pattern: ${pattern}`, err);
					// Fallback to simpler pattern matching
					return new RegExp(escapeRegExp(pattern));
				}
			})
			.filter((pattern) => pattern !== null) as RegExp[];

		gitignoreLoaded = true;
	} catch (error) {
		console.error('Error reading .gitignore:', error);
	}

	return gitignorePatterns;
}

/**
 * Escapes special characters in a string for use in a regular expression
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a path should be excluded based on .gitignore patterns
 * @param filePath Path to check against .gitignore patterns
 * @param rootDir Root directory containing .gitignore
 * @returns True if the path should be excluded
 */
export function isExcludedByGitignore(filePath: string, rootDir: string): boolean {
	const patterns = loadGitignorePatterns(rootDir);
	if (patterns.length === 0) {
		return false;
	}

	// Get the path relative to the root directory
	const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

	// Direct string matching for .gitignore patterns before regex matching
	const gitignorePath = path.join(rootDir, '.gitignore');
	if (fs.existsSync(gitignorePath)) {
		const content = fs.readFileSync(gitignorePath, 'utf8');
		const lines = content
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith('#'));

		// Check direct pattern matches before regex
		for (const line of lines) {
			// Skip negated patterns
			if (line.startsWith('!')) {
				continue;
			}

			// Handle directory patterns ending with /
			if (line.endsWith('/')) {
				const dirPattern = line.slice(0, -1); // Remove trailing slash

				// Root level directory match
				if (
					relativePath === dirPattern ||
					relativePath.startsWith(dirPattern + '/') ||
					relativePath.startsWith(dirPattern + '\\')
				) {
					return true;
				}
			}
			// Handle patterns with trailing /**
			else if (line.endsWith('/**')) {
				const dirPath = line.slice(0, -3); // Remove trailing /**

				if (dirPath.startsWith('**/')) {
					// Pattern like **/.vscode-test/**
					const dirName = dirPath.substring(3);

					// Check if the directory appears in the path
					if (
						relativePath === dirName ||
						relativePath.startsWith(dirName + '/') ||
						relativePath.includes('/' + dirName + '/')
					) {
						return true;
					}
				} else {
					// Pattern like src/** - only match specific directory
					if (relativePath === dirPath || relativePath.startsWith(dirPath + '/')) {
						return true;
					}
				}
			}
			// Handle patterns starting with **/
			else if (line.startsWith('**/')) {
				const patternWithoutGlob = line.substring(3); // Remove **/ prefix

				// Check all possible path variations for directory matching at any level
				if (
					relativePath === patternWithoutGlob ||
					relativePath.endsWith('/' + patternWithoutGlob) ||
					relativePath.includes('/' + patternWithoutGlob + '/') ||
					// For Windows paths
					relativePath.endsWith('\\' + patternWithoutGlob) ||
					relativePath.includes('\\' + patternWithoutGlob + '\\')
				) {
					return true;
				}
			}
			// Handle exact file matches
			else if (relativePath === line) {
				return true;
			}
		}
	}

	// Add trailing slash for directories to ensure proper directory matching
	const isDirectory = fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
	const relativePathWithTrailingSlash =
		isDirectory && !relativePath.endsWith('/') ? relativePath + '/' : relativePath;

	// Also check against the basename for simple filename patterns
	const basename = path.basename(filePath);

	// Check each pattern
	for (const pattern of patterns) {
		// Test against the full relative path
		if (pattern.test(relativePath) || pattern.test(relativePathWithTrailingSlash)) {
			return true;
		}

		// For simple filename patterns, also check just the basename
		if (pattern.test(basename)) {
			return true;
		}
	}

	return false;
}
