'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { convertGlobToRegExp } from './glob-utils';
import { isExcludedByGitignore } from './gitignore-utils';

// Tracking global flag for logged patterns
let hasLoggedPatterns = false;

/**
 * Checks if a path should be excluded based on VSCode files.exclude and custom exclude patterns
 * @param filePath The full path to check
 * @param rootPath The root directory path for relative path calculation
 */
export function shouldExclude(filePath: string, rootPath: string): boolean {
	// Skip exclusion for temporary test directories
	if (filePath.startsWith(os.tmpdir()) && filePath.includes('file-tree-test-')) {
		return false;
	}

	const config = vscode.workspace.getConfiguration();

	// Get custom exclude patterns as object with boolean values
	const customExcludePatterns = config.get('RepoTree.exclude', {}) as Record<string, boolean>;

	// Check if we should respect workspace exclusion settings
	const respectWorkspaceExcludes = config.get('RepoTree.respectWorkspaceExcludeSettings', true);

	// Check if we should respect .gitignore settings
	const respectGitignore = config.get('RepoTree.respectGitignore', false);

	// Convert object patterns to array for consistent processing
	const allPatterns: string[] = [];

	// Process RepoTree.exclude patterns
	for (const pattern in customExcludePatterns) {
		if (customExcludePatterns[pattern] === true) {
			allPatterns.push(pattern);
		}
	}

	// Process files.exclude patterns if enabled
	if (respectWorkspaceExcludes) {
		const filesExcludePatterns = config.get('files.exclude', {}) as Record<string, boolean>;
		for (const pattern in filesExcludePatterns) {
			if (filesExcludePatterns[pattern] === true) {
				allPatterns.push(pattern);
			}
		}
	}

	// Check .gitignore if enabled
	if (respectGitignore && isExcludedByGitignore(filePath, rootPath)) {
		return true;
	}

	// Log available patterns for debugging (only once)
	if (!hasLoggedPatterns) {
		console.log('Exclusion patterns:', JSON.stringify(allPatterns, null, 2));
		hasLoggedPatterns = true;
	}

	// Get the basename for direct basename matching
	const basename = path.basename(filePath);

	// Check for node_modules specifically
	if (
		basename === 'node_modules' ||
		filePath.includes('/node_modules/') ||
		filePath.includes('\\node_modules\\')
	) {
		console.log(`Excluded node_modules: ${filePath}`);
		return true;
	}

	// Get relative path for pattern matching
	const relativePath = path.relative(rootPath, filePath).replace(/\\/g, '/');

	// Check each pattern
	for (const pattern of allPatterns) {
		// First check direct basename matches
		if (pattern === basename || pattern === `**/${basename}` || pattern === `**/${basename}/**`) {
			console.log(`Excluded by basename match: ${filePath} (pattern: ${pattern})`);
			return true;
		}

		try {
			// Convert glob pattern to regex
			const patternRegex = convertGlobToRegExp(pattern);

			// Test the pattern against the relative path
			if (patternRegex.test(relativePath)) {
				console.log(`Excluded by pattern: ${filePath} (pattern: ${pattern})`);
				return true;
			}
		} catch (error) {
			console.error(`Error matching pattern ${pattern}:`, error);
		}
	}

	return false;
}
