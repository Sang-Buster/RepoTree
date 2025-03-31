# Change Log of Release Notes

## 0.1.0 (2025-03-31)

### Added

- Added custom exclude patterns from gitignore file
- Added comment support for generated tree
- Added button to appending generated tree to readme file

### Changed

- None

### Fixed

- Enhance .gitignore pattern handling in `loadGitignorePatterns` and `isExcludedByGitignore` functions. 
- Improve regex conversion in `convertGlobToRegExp` for better directory matching and support for patterns with trailing slashes and globstars.

---

## 0.0.1 (2025-03-29)

### Added

- Initial release of RepoTree.
- Visual tree representation of directories and files.
- Customizable file/folder exclusion in settings.
- Context menu command "Generate to Tree".
- Command Palette command "Generate to Tree".

### Changed

- None

### Fixed

- None
