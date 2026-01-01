# Changelog

All notable changes to the "Log Highlighter" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2024-12-30

### Added

- Initial release of Log Highlighter
- **Console Statement Highlighting**
  - Highlight `console.log` (blue)
  - Highlight `console.warn` (yellow)
  - Highlight `console.error` (red)
  - Highlight `console.info` (cyan)
  - Highlight `console.debug` (magenta)
- **Multi-line Support**
  - Correctly parses multi-line console statements
  - Handles nested parentheses
  - Supports template literals
- **Framework Presets**
  - NestJS Logger preset
  - Winston preset
  - Pino preset
  - Bunyan preset
  - Log4js preset
- **Custom Patterns**
  - Add custom logger patterns via settings
  - Configure custom highlight colors (hex)
- **One-Click Actions**
  - Remove all highlighted statements from code
  - Clear highlights without removing code
- **Editor Integration**
  - Toolbar button in editor title bar
  - Quick pick dropdown menu
  - Works in JS, TS, JSX, TSX, Vue, Svelte files

### Technical

- Built with TypeScript
- Bundled with esbuild
- Minimal dependencies
