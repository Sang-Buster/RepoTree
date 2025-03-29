'use strict';

/**
 * Convert a glob pattern to a regular expression
 * @param pattern The glob pattern to convert
 * @returns A RegExp object that matches the same patterns
 */
export function convertGlobToRegExp(pattern: string): RegExp {
	// Escape special characters except * and ?
	let regexPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');

	// Convert ** to match any character including path separators
	regexPattern = regexPattern.replace(/\*\*/g, '__GLOBSTAR__');

	// Convert * to match any character except path separators
	regexPattern = regexPattern.replace(/\*/g, '[^/]*');

	// Convert ? to match any single character except path separators
	regexPattern = regexPattern.replace(/\?/g, '[^/]');

	// Replace the globstar placeholder
	regexPattern = regexPattern.replace(/__GLOBSTAR__/g, '.*');

	// Match the pattern more precisely
	if (pattern.startsWith('**/')) {
		// Pattern like "**/node_modules" should match "node_modules" anywhere in the path
		regexPattern = '(^|.*/)' + regexPattern.substring(4);
	} else if (pattern.startsWith('/')) {
		// Absolute path pattern
		regexPattern = '^' + regexPattern;
	} else {
		// Other patterns should match exactly where specified
		regexPattern = '(^|.*/)' + regexPattern;
	}

	return new RegExp(regexPattern);
}
