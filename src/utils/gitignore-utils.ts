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
		console.log('No .gitignore file found at:', gitignorePath);
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
					return convertGlobToRegExp(normalizedPattern);
				} catch (err) {
					console.error(`Error converting pattern: ${pattern}`, err);
					// Fallback to simpler pattern matching
					return new RegExp(escapeRegExp(pattern));
				}
			})
			.filter((pattern) => pattern !== null) as RegExp[];

		gitignoreLoaded = true;
		console.log(`Loaded ${gitignorePatterns.length} patterns from .gitignore`);
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

	// Also check against the basename for simple filename patterns
	const basename = path.basename(filePath);

	// Check each pattern
	for (const pattern of patterns) {
		// Test against the full relative path
		if (pattern.test(relativePath)) {
			console.log(`Excluded by .gitignore pattern: ${filePath} (pattern matched: ${relativePath})`);
			return true;
		}

		// For simple filename patterns, also check just the basename
		if (pattern.test(basename)) {
			console.log(`Excluded by .gitignore basename match: ${filePath} (basename: ${basename})`);
			return true;
		}
	}

	return false;
}
