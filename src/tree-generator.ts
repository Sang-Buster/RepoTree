'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { shouldExclude } from './utils/exclude-patterns';

// Keep track of max line length for comment alignment
let maxLineLength = 0;

/**
 * Calculates the max line length including indentation for proper comment alignment
 * @param targetPath The directory path to analyze
 * @param depth Current depth level in the tree
 * @param rootPath The root directory path
 * @returns The maximum line length found
 */
function calculateMaxLineLength(targetPath: string, depth: number, rootPath: string): number {
	let maxLength = 0;
	if (!fs.existsSync(targetPath)) {
		return maxLength;
	}

	const config = vscode.workspace.getConfiguration();
	const treeDistance = Math.max(1, config.get('RepoTree.treeDistance', 1));

	// Calculate the base indentation length considering tree distance
	// Each depth level: '┃' + spacing, plus the branch symbol (┣ or ┗)
	const indentLength = depth * (1 + treeDistance) + (1 + treeDistance);

	// Read directory entries
	const entries = fs.readdirSync(targetPath);
	const directories: string[] = [];
	const files: string[] = [];

	// Separate directories and files while applying exclusion rules
	entries.forEach((entry) => {
		const fullPath = path.join(targetPath, entry);

		// Skip files/folders that match exclude patterns
		if (shouldExclude(fullPath, rootPath)) {
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

	// Calculate max line length for each entry
	sortedEntries.forEach((entry) => {
		const fullPath = path.join(targetPath, entry);
		const entryLength = indentLength + entry.length;
		maxLength = Math.max(maxLength, entryLength);

		if (fs.statSync(fullPath).isDirectory()) {
			const childMaxLength = calculateMaxLineLength(fullPath, depth + 1, rootPath);
			maxLength = Math.max(maxLength, childMaxLength);
		}
	});

	return maxLength;
}

/**
 * Generates a tree representation of the directory structure
 * @param targetPath The directory path to generate tree from
 * @param depth Current depth level in the tree
 * @param rootPath The root directory path
 * @returns HTML string with the directory tree
 */
export function generateTree(targetPath: string, depth: number, rootPath: string): string {
	// Calculate max line length at the beginning to ensure consistent alignment
	if (depth === 0) {
		maxLineLength = calculateMaxLineLength(targetPath, depth, rootPath);
	}

	let treeText = '';
	if (!fs.existsSync(targetPath)) {
		return '';
	}

	const config = vscode.workspace.getConfiguration();
	const addComments = config.get('RepoTree.addComments', false);
	const commentSymbol = config.get('RepoTree.commentSymbol', '//');
	const commentDistance = Math.max(4, config.get('RepoTree.commentDistance', 4));
	const treeDistance = Math.max(1, config.get('RepoTree.treeDistance', 1));

	// Format string for tree text with proper indentation
	const formatLine = (depth: number, pipe: string, name: string, isDir: boolean): string => {
		const nameWithIcon = isDir
			? '<span class="t-icon" name="icons">📂</span>' + name
			: '<span class="t-icon" name="icons">📄</span>' + name;

		// Apply tree distance setting to control branch spacing
		const pipeSpacing = ' '.repeat(treeDistance);
		const linePrefix = pipeSpacing + Array(depth + 1).join('┃' + pipeSpacing) + pipe;
		const baseLine = linePrefix + nameWithIcon;

		if (addComments) {
			// Calculate the current line length without HTML tags
			const cleanPrefix = pipeSpacing + ('┃' + pipeSpacing).repeat(depth) + pipe;
			const currentLineLength = cleanPrefix.length + name.length;

			// Calculate padding based on the max line length plus the comment distance
			const paddingLength = maxLineLength + commentDistance - currentLineLength;
			const padding = ' '.repeat(Math.max(1, paddingLength));

			const comment = `<span class="comment">${padding}${commentSymbol} ${isDir ? 'Directory' : 'File'}</span>`;
			return baseLine + comment + '<br>';
		} else {
			return baseLine + '<br>';
		}
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
		const isDir = fs.statSync(fullPath).isDirectory();

		treeText += formatLine(depth, pipe, entry, isDir);

		if (isDir) {
			treeText += generateTree(fullPath, depth + 1, rootPath);
		}
	});

	return treeText;
}
