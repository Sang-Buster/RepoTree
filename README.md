<div align="center">
   <a href="https://github.com/Sang-Buster/RepoTree">
      <img src="https://github.com/user-attachments/assets/aafd1c1c-15d7-4611-b64e-86863fae3e97" width=20% alt="logo">     
   </a>   
   <h1>RepoTree</h1>
   <h5>A VS Code extension that generates a visual tree representation of directories and files.</h5>
</div>

---

<div align="center">
   <h2>✨ Features</h2>
   <video src="https://github.com/user-attachments/assets/619ed9c9-5a87-4792-bb7f-6aace213a7fa" alt="demo" controls></video>
</div>

- Generate directory tree visualization with a single click
- Customizable file/folder exclusion
- Toggle file/folder icons
- Works with any project type
- Works across all platforms (Windows, macOS, Linux)
- Add comments to files and folders in the tree
- Customize comment symbols
- Support for .gitignore file exclusions
- Smart pattern matching with glob syntax
- Respect VS Code's built-in exclude settings
- Comprehensive default exclusion patterns
- Adjustable comment spacing for readability

### Extension Settings

| Setting Name                               | Display Name                                 | Default Value | Description                                                                                                                          |
| ------------------------------------------ | -------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `RepoTree.exclude`                         | RepoTree: Exclude                            | See below\*   | Configure glob patterns for excluding files and folders from the generated file tree                                                 |
| `RepoTree.respectWorkspaceExcludeSettings` | RepoTree: Respect Workspace Exclude Settings | `false`       | When enabled, files and folders excluded by VS Code's built-in files.exclude setting will also be excluded from the generated tree   |
| `RepoTree.respectGitignore`                | RepoTree: Respect .gitignore                 | `false`       | When enabled, files and folders listed in the .gitignore file will be excluded from the generated tree                               |
| `RepoTree.addComments`                     | RepoTree: Add Comments                       | `false`       | When enabled, comments will be added to the right of each file/folder in the generated tree                                          |
| `RepoTree.commentSymbol`                   | RepoTree: Comment Symbol                     | `//`          | Symbol to use for comments in the generated tree                                                                                     |
| `RepoTree.commentDistance`                 | RepoTree: Comment Distance                   | `4`           | The minimum distance between the file/folder name and the comment                                                                    |
| `RepoTree.treeDistance`                    | RepoTree: Tree Distance                      | `1`           | Controls the spacing between tree branches. Higher values make the tree look more spread out, lower values make it more consolidated |

\*Default exclude patterns include common files and directories like `.git`, `node_modules`, `__pycache__`, `.ruff_cache`, `.pytest_cache`, `dist`, `build`, etc.

<div align="center">
   <h2>📥 Installation</h2>
</div>

### From [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Sang-Buster.RepoTree)

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X on macOS`)
3. Search for `Sang-Buster.RepoTree`
4. Click `Install`

### From VSIX file

1. Download the `.vsix` file from the [releases](https://github.com/Sang-Buster/RepoTree/releases) page
2. Open VS Code
3. Go to Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
4. Search for `Extensions: Install from VSIX...`
5. Select the downloaded `.vsix` file

<div align="center">
   <h2>🚀 Usage</h2>
</div>

1. Open a folder in VS Code
2. Right-click on any folder in the Explorer view
3. Select `RepoTree: Generate to Tree` from the context menu
4. A new tab will open with the tree visualization
5. (Optional) Click the `icon off/on` button to toggle file icons

<div align="center">
   <h2>🔍 Excluding Files and Folders</h2>
</div>

RepoTree supports excluding files and folders from the generated tree:

<div align="center">
   <img src="https://github.com/user-attachments/assets/8220c829-82a1-4e0c-8c7b-3db0dabedeb7" alt="screenshot">      
</div>

1. **Using VSCode's built-in `files.exclude` settings:**

   - The extension can also respect VSCode's `files.exclude` settings
   - Any files or folders hidden in VSCode's Explorer will also be hidden in the generated tree
   - You can toggle this behavior in Settings by searching for `RepoTree: Respect Workspace Exclude Settings`
   - Uncheck the box to ignore VSCode's built-in exclusion settings

2. **Using `.gitignore` files:**

   - The extension can also respect `.gitignore` files
   - You can toggle this behavior in Settings by searching for `RepoTree: Respect .gitignore`
   - Uncheck the box to ignore `.gitignore` files

3. **Custom exclusion patterns:**
   - The extension comes with a comprehensive set of default excludes for common files and folders
   - You can customize these patterns by going to Settings and searching for `RepoTree: Exclude`
   - Add, delete, or edit patterns by toggling them on/off:
     ```json
     "RepoTree.exclude": {
        "**/.git": true,
        "**/__pycache__": true,
        "**/.ruff_cache": true,
        "**/.pytest_cache": true,
        "**/node_modules": true,
        "**/dist": true,
        "**/build": true,
        "**/out": true,
        "**/.vscode": true,
        "**/.idea": true,
        "**/.DS_Store": true,
        "**/Thumbs.db": true,
        "**/coverage": true,
        "**/logs": true,
        "**/*.log": true,
        "**/.env": true,
        "**/.venv": true,
        "**/bower_components": true,
        "**/jspm_packages": true,
        "**/.cache": true,
        "**/target": true,
        "**/bin": true,
        "**/obj": true
     }
     ```

The exclusion patterns support glob syntax:

- `*` to match zero or more characters in a path segment
- `?` to match one character in a path segment
- `**` to match any number of path segments, including none
- `{}` to group conditions (e.g., `{**/*.html,**/*.txt}`)

<div align="center">
   <h2>👨‍💻 Development</h2>
</div>

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.0.0 or higher)
- [Visual Studio Code](https://code.visualstudio.com/)

### Setup

1. Clone the repository:

   ```
   git clone https://github.com/Sang-Buster/RepoTree.git
   cd RepoTree
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Open in VS Code:
   ```
   code .
   ```

### Development Workflow

1. Make your changes in the `/src` directory
2. Press F5 to run the extension in a new VS Code window
3. Test your changes in the debug instance
4. Use `npm run compile` to build the extension

### Testing the Extension

#### Running in Development Mode

The fastest way to test your changes is by using VS Code's Extension Development Host:

1. Press `F5` or select `Run Extension` from the Run and Debug view
2. This will open a new window with your extension loaded
3. The new window will have `[Extension Development Host]` in the title bar
4. You can make changes to your code and restart the extension host to test them

#### Debugging

1. Set breakpoints in your code
2. Press `F5` to start the extension in debug mode
3. When your breakpoints are hit, you can inspect variables, step through code, etc.

#### Running Tests

There are two ways to run tests:

1. Using the VS Code interface:

   - Go to the Run and Debug view (`Ctrl+Shift+D`)
   - Select `Extension Tests` from the dropdown
   - Press `F5` to run the tests

2. Using the command line:
   - Run `npm run test` to execute all tests
   - Tests will run in a special instance of VS Code

#### Resolving Common Issues

- If you see warnings about `importAttributes` or `importAssertions`, these are from Node.js internals and can be safely ignored
- If tests are failing due to exclude patterns, you may need to adjust the test code to use temporary directories

### Building VSIX

To create a `.vsix` package for distribution:

```
npm install -g @vscode/vsce
vsce package
```

<div align="center">
   <h2>🗂️ Project Structure</h2>
</div>

```
📦RepoTree
 ┣ 📂img                       // Readme assets
 ┃ ┣ 📄demo.mp4                  // Demo video
 ┃ ┣ 📄icon.png                  // Extension icon
 ┃ ┗ 📄screenshot.png            // Screenshot
 ┣ 📂src                       // Source code
 ┃ ┣ 📂test                      // Test files
 ┃ ┃ ┣ 📂suite                      // Test suite
 ┃ ┃ ┃ ┗ 📄extension.test.ts           // Extension test
 ┃ ┃ ┗ 📄runTest.ts                 // Test runner
 ┃ ┣ 📂utils                     // Utility functions
 ┃ ┃ ┣ 📄exclude-patterns.ts        // File exclusion patterns
 ┃ ┃ ┣ 📄gitignore-utils.ts         // Gitignore utils
 ┃ ┃ ┗ 📄glob-utils.ts              // Glob utils
 ┃ ┣ 📂views                     // Views
 ┃ ┃ ┗ 📄output-template.ts         // Output template
 ┃ ┣ 📄extension.ts              // Extension entry point
 ┃ ┗ 📄tree-generator.ts         // Tree generator
 ┣ 📄.prettierrc
 ┣ 📄LICENSE
 ┣ 📄README.md
 ┣ 📄RELEASE_NOTES.md
 ┣ 📄package.json
 ┣ 📄tsconfig.json
 ┗ 📄tslint.json
```
