'use strict';

/**
 * Convert a glob pattern to a regular expression
 * @param pattern The glob pattern to convert
 * @returns A RegExp object that matches the same patterns
 */
export function convertGlobToRegExp(pattern: string): RegExp {
	// Escape special characters except * and ?
	let regexPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');

	// Handle common glob patterns first
	if (pattern.includes('/**')) {
		// Patterns with directory globstar like **/.vscode-test/** or src/**
		const parts = pattern.split('/**');
		const prefix = parts[0];

		if (prefix === '**') {
			// Pattern like **/** matches everything
			return new RegExp('.*');
		} else if (prefix.startsWith('**/')) {
			// Pattern like **/.vscode-test/** matches directory at any level and all contents
			const dirName = prefix.substring(3);
			return new RegExp(`(^|.*/)(${escapeRegExp(dirName)})(/.*|$)`);
		} else {
			// Pattern like src/** matches contents within a specific directory
			return new RegExp(`^${escapeRegExp(prefix)}(/.*|$)`);
		}
	} else if (pattern.startsWith('**/')) {
		// Pattern like **/.vscode-test matches directory at any level
		const patternName = pattern.substring(3);
		return new RegExp(`(^|.*/)(${escapeRegExp(patternName)})(/.*|$)`);
	} else if (pattern.endsWith('/')) {
		// Pattern like .vscode-test/ matches directory at root level
		const dirName = pattern.slice(0, -1);
		return new RegExp(`^${escapeRegExp(dirName)}(/.*|$)`);
	}

	// For other patterns, process ** and * separately
	regexPattern = regexPattern.replace(/\*\*/g, '__GLOBSTAR__');
	regexPattern = regexPattern.replace(/\*/g, '[^/]*');
	regexPattern = regexPattern.replace(/\?/g, '[^/]');
	regexPattern = regexPattern.replace(/__GLOBSTAR__/g, '.*');

	// Default case - match exactly where specified
	if (pattern.startsWith('/')) {
		// Absolute path pattern
		regexPattern = '^' + regexPattern;
	} else {
		// Relative path pattern
		regexPattern = '(^|.*/)' + regexPattern + '(/.*|$)';
	}

	return new RegExp(regexPattern);
}

/**
 * Escape regexp special characters in a string
 * @param string String to escape
 * @returns Escaped string safe for RegExp
 */
function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
