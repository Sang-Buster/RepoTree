'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { generateTree } from './tree-generator';
import { OutputTemplate } from './views/output-template';

/**
 * Activates the extension
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
	// Register the command to generate a file tree
	let disposable = vscode.commands.registerCommand('extension.generateTree', async (el) => {
		let rootPath: string;

		// Check if the command was executed from context menu (with a path) or from command palette
		if (!el || !el.fsPath) {
			// If invoked from command palette, ask user to select a folder
			const folders = await vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				openLabel: 'Select Folder',
			});

			if (!folders || folders.length === 0) {
				vscode.window.showErrorMessage('Please select a folder to generate tree');
				return;
			}

			rootPath = folders[0].fsPath;
		} else {
			rootPath = el.fsPath;
		}

		// Generate the tree representation
		const treeRoot =
			'<bold><span class="t-icon" name="icons">📦</span>' + path.basename(rootPath) + '</bold><br>';
		const treeContent = generateTree(rootPath, 0, rootPath);

		// Create webview panel to display the tree
		const treePanel = vscode.window.createWebviewPanel(
			'RepoTree',
			'Repo Tree',
			{ viewColumn: vscode.ViewColumn.Active },
			{ enableScripts: true }
		);

		// Set the HTML content with the generated tree
		treePanel.webview.html = OutputTemplate.HTML.replace('--REP--', treeRoot + treeContent);

		// Handle messages from the webview
		treePanel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'appendToReadme':
						await appendToReadmeFile(rootPath, treeRoot + treeContent, message.includeIcons);
						break;
				}
			},
			undefined,
			context.subscriptions
		);
	});

	// Add command to extension context
	context.subscriptions.push(disposable);
}

/**
 * Appends the generated tree to the README file
 * @param rootPath The root directory path
 * @param treeContent The generated tree content
 * @param includeIcons Whether to include icons in the content
 */
async function appendToReadmeFile(
	rootPath: string,
	treeContent: string,
	includeIcons: boolean
): Promise<void> {
	// Find the README file
	const readmeFiles = [
		'README.md',
		'README.txt',
		'README.mdx',
		'README',
		'readme.md',
		'readme.txt',
		'readme.mdx',
		'readme',
	];
	let readmePath = '';

	// Log the icon state for debugging
	console.log('Append to README - Include icons:', includeIcons);
	console.log('Tree content sample:', treeContent.substring(0, 200));

	for (const file of readmeFiles) {
		const filePath = path.join(rootPath, file);
		if (fs.existsSync(filePath)) {
			readmePath = filePath;
			break;
		}
	}

	// If README doesn't exist, create README.md
	if (!readmePath) {
		readmePath = path.join(rootPath, 'README.md');
	}

	// Format the tree content
	let formattedTree = treeContent;

	// Process icons
	let iconsProcessed = false;
	if (includeIcons) {
		// Keep icons but convert them to plain text
		const before = formattedTree;
		formattedTree = formattedTree
			.replace(/<span class="t-icon" name="icons"[^>]*>📦<\/span>/g, '📦')
			.replace(/<span class="t-icon" name="icons"[^>]*>📂<\/span>/g, '📂')
			.replace(/<span class="t-icon" name="icons"[^>]*>📄<\/span>/g, '📄');

		// Check if any replacements were made
		iconsProcessed = before !== formattedTree;
		console.log('Icons processed:', iconsProcessed);
	} else {
		// Remove icons completely
		formattedTree = formattedTree.replace(
			/<span class="t-icon" name="icons"[^>]*>.*?<\/span>/g,
			''
		);
	}

	// Remove remaining HTML tags and convert to plain text (for both cases)
	formattedTree = formattedTree
		.replace(/<br>/g, '\n')
		.replace(/<bold>/g, '')
		.replace(/<\/bold>/g, '')
		.replace(/<span class="comment">(.*?)<\/span>/g, '$1')
		.replace(/<span.*?>(.*?)<\/span>/g, '$1');

	// Prepare content to append
	const contentToAppend = `\n\n\`\`\`\n${formattedTree}\`\`\`\n`;

	try {
		// Create file if it doesn't exist
		if (!fs.existsSync(readmePath)) {
			fs.writeFileSync(readmePath, '# Project Tree\n');
		}

		// Append content
		fs.appendFileSync(readmePath, contentToAppend);

		const iconStatus = includeIcons ? 'with icons' : 'without icons';
		vscode.window.showInformationMessage(
			`Tree appended to ${path.basename(readmePath)} ${iconStatus}`
		);

		// Open the README file
		const doc = await vscode.workspace.openTextDocument(readmePath);
		await vscode.window.showTextDocument(doc);
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to append tree to README: ${error}`);
	}
}

/**
 * Deactivates the extension
 */
export function deactivate() {
	// Nothing to do here
}
