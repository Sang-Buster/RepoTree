'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
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
			'fileTree',
			'File Tree',
			{ viewColumn: vscode.ViewColumn.Active },
			{ enableScripts: true }
		);

		// Set the HTML content with the generated tree
		treePanel.webview.html = OutputTemplate.HTML.replace('--REP--', treeRoot + treeContent);
	});

	// Add command to extension context
	context.subscriptions.push(disposable);
}

/**
 * Deactivates the extension
 */
export function deactivate() {
	// Nothing to do here
}
