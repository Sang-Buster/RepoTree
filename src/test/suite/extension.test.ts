import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { generateTree } from '../../tree-generator';

/**
 * Helper function to recursively remove a directory
 */
function rimraf(dirPath: string): void {
	if (fs.existsSync(dirPath)) {
		fs.readdirSync(dirPath).forEach((entry) => {
			const entryPath = path.join(dirPath, entry);
			if (fs.statSync(entryPath).isDirectory()) {
				rimraf(entryPath);
			} else {
				fs.unlinkSync(entryPath);
			}
		});
		fs.rmdirSync(dirPath);
	}
}

suite('RepoTree Tests', () => {
	vscode.window.showInformationMessage('Starting RepoTree tests');

	let testDir: string;

	setup(() => {
		// Create a clean test directory before each test
		testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'file-tree-test-'));
	});

	teardown(() => {
		// Clean up test directory and all its contents
		if (fs.existsSync(testDir)) {
			rimraf(testDir);
		}
	});

	test('Simple directory - should include single file', () => {
		// Create a test file
		const testFile = path.join(testDir, 'test.txt');
		fs.writeFileSync(testFile, 'Test content');

		// Generate tree for the test directory
		const result = generateTree(testDir, 0, testDir);

		// Verify the output
		assert.ok(result.includes('test.txt'), 'Tree should include the test file');
		assert.ok(
			result.includes('<span class="t-icon" name="icons">📄</span>'),
			'Tree should include file icon'
		);
	});

	test('Nested directory structure - should display hierarchy', () => {
		// Create a nested directory structure
		const nestedDir = path.join(testDir, 'nested');
		fs.mkdirSync(nestedDir);

		const nestedFile = path.join(nestedDir, 'nested-file.txt');
		fs.writeFileSync(nestedFile, 'Nested content');

		// Generate tree for the test directory
		const result = generateTree(testDir, 0, testDir);

		// Verify the output
		assert.ok(result.includes('nested'), 'Tree should include the nested directory');
		assert.ok(result.includes('nested-file.txt'), 'Tree should include the nested file');
		assert.ok(
			result.includes('<span class="t-icon" name="icons">📂</span>'),
			'Tree should include folder icon'
		);
	});
});
