'use strict';

import * as fs from 'fs';
import * as path from 'path';
import { shouldExclude } from './utils/exclude-patterns';

/**
 * Generates a tree representation of the directory structure
 * @param targetPath The directory path to generate tree from
 * @param depth Current depth level in the tree
 * @param rootPath The root directory path
 * @returns HTML string with the directory tree
 */
export function generateTree(targetPath: string, depth: number, rootPath: string): string {
	let treeText = '';
	if (!fs.existsSync(targetPath)) {
		return '';
	}

	// Format string for tree text with proper indentation
	const formatLine = (depth: number, pipe: string, name: string): string => {
		return ' ' + Array(depth + 1).join('┃ ') + pipe + name + '<br>';
	};

	// Order by directory > file
	const entries = fs.readdirSync(targetPath);
	const directories: string[] = [];
	const files: string[] = [];

	// Separate directories and files while applying exclusion rules
	entries.forEach((entry) => {
		const fullPath = path.join(targetPath, entry);

		// Skip files/folders that match exclude patterns
		if (shouldExclude(fullPath, rootPath)) {
			console.log(`Excluded: ${fullPath}`);
			return;
		}

		if (fs.statSync(fullPath).isDirectory()) {
			directories.push(entry);
		} else {
			files.push(entry);
		}
	});

	// Combine directories followed by files
	const sortedEntries = [...directories, ...files];

	// Generate tree for each entry
	sortedEntries.forEach((entry, index) => {
		const fullPath = path.join(targetPath, entry);
		const isLast = index === sortedEntries.length - 1;
		const pipe = isLast ? '┗ ' : '┣ ';

		if (fs.statSync(fullPath).isDirectory()) {
			treeText += formatLine(depth, pipe, '<span class="t-icon" name="icons">📂</span>' + entry);
			treeText += generateTree(fullPath, depth + 1, rootPath);
		} else {
			treeText += formatLine(depth, pipe, '<span class="t-icon" name="icons">📄</span>' + entry);
		}
	});

	return treeText;
}
