<p align="center">
  <img src="https://img.shields.io/badge/VS%20Code-Extension-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="VS Code Extension">
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Version-0.0.2-6366f1?style=for-the-badge" alt="Version">
</p>

<h1 align="center">Log Highlighter for VS Code</h1>

<p align="center">
  <strong>Find, highlight, and clean up console statements in seconds.</strong><br>
  Color-coded highlighting for <code>console.log</code>, <code>console.warn</code>, <code>console.error</code>, and more.<br>
  One-click removal. Framework presets. Custom patterns.
</p>

<p align="center">
  <a href="vscode:extension/littleboy.log-highlighter-vscode">Install in VS Code</a> &nbsp;&bull;&nbsp;
  <a href="https://github.com/LittleBoy9/log-highliter/issues">Report Issue</a> &nbsp;&bull;&nbsp;
  <a href="https://github.com/LittleBoy9/log-highliter">GitHub</a>
</p>

---

## Features

| | Feature | Description |
|:-:|---------|-------------|
| 🎨 | **Color-Coded Highlights** | Each console method gets its own distinct color |
| 🗑️ | **One-Click Removal** | Remove all highlighted log statements with a single click |
| 📦 | **Framework Presets** | Built-in support for NestJS, Winston, Pino, Bunyan, Log4js |
| 🔍 | **Smart Parsing** | Handles multi-line statements, nested parens, template literals |
| ⚙️ | **Custom Patterns** | Define your own logger patterns with custom colors |
| 🌐 | **Multi-Language** | JS, TS, JSX, TSX, Vue, and Svelte |

---

## Quick Start

1. Open any JavaScript/TypeScript file
2. Click the **filter icon** in the editor title bar (top right)
3. Select what you want to highlight from the dropdown

---

## Installation

### VS Code Marketplace

```
code --install-extension littleboy.log-highlighter-vscode
```

Or search **"Log Highlighter"** in the VS Code Extensions sidebar.

### From Source

```bash
git clone https://github.com/LittleBoy9/log-highliter.git
cd log-highlighter
npm install
npm run build
vsce package
code --install-extension log-highlighter-*.vsix
```

---

## Color Scheme

### Console Methods

| Method | Color | Preview |
|--------|-------|---------|
| `console.log` | Blue | ![](https://img.shields.io/badge/-console.log-3b82f6?style=flat-square) |
| `console.warn` | Yellow | ![](https://img.shields.io/badge/-console.warn-eab308?style=flat-square) |
| `console.error` | Red | ![](https://img.shields.io/badge/-console.error-ef4444?style=flat-square) |
| `console.info` | Cyan | ![](https://img.shields.io/badge/-console.info-06b6d4?style=flat-square) |
| `console.debug` | Magenta | ![](https://img.shields.io/badge/-console.debug-a855f7?style=flat-square) |

### Framework Presets

| Framework | Color | Example Patterns |
|-----------|-------|------------------|
| **NestJS** | ![](https://img.shields.io/badge/-●-e0234e?style=flat-square) Red | `this.logger.log`, `Logger.error`, `this.logger.verbose` |
| **Winston** | ![](https://img.shields.io/badge/-●-22c55e?style=flat-square) Green | `logger.info`, `logger.error`, `logger.silly` |
| **Pino** | ![](https://img.shields.io/badge/-●-10b981?style=flat-square) Teal | `logger.info`, `logger.trace`, `logger.fatal` |
| **Bunyan** | ![](https://img.shields.io/badge/-●-f59e0b?style=flat-square) Orange | `log.info`, `log.error`, `log.fatal` |
| **Log4js** | ![](https://img.shields.io/badge/-●-8b5cf6?style=flat-square) Purple | `logger.info`, `logger.debug`, `logger.fatal` |

---

## Menu Options

| Option | Description |
|--------|-------------|
| **Highlight All Console** | Highlights all console.log/warn/error/info/debug |
| **console.log / warn / error / info / debug** | Highlight a specific method only |
| **Highlight All Custom** | Highlight all enabled presets and custom patterns |
| **Manage Presets** | Enable/disable framework presets |
| **Remove Highlighted** | Delete highlighted statements from code |
| **Clear Highlights** | Remove highlights without deleting code |

---

## Configuration

### Enable Framework Presets

Add to your `settings.json`:

```jsonc
{
  "logHighlighter.enabledPresets": ["nestjs", "winston", "pino"]
}
```

Or use the menu: **Filter icon → Manage Presets** to toggle them interactively.

### Add Custom Patterns

```jsonc
{
  "logHighlighter.customPatterns": [
    {
      "name": "My Logger",
      "pattern": "myLogger.log",
      "color": "#ff6b6b"
    },
    {
      "name": "Debug Print",
      "pattern": "debugPrint",
      "color": "#4ecdc4"
    }
  ]
}
```

Each custom pattern requires:
- **`name`** — Display name shown in the menu
- **`pattern`** — Text to match (e.g., `myLogger.info`)
- **`color`** — Hex color for highlighting (e.g., `#ff6b6b`)

---

## Supported File Types

| Language | Extensions |
|----------|-----------|
| JavaScript | `.js`, `.mjs`, `.cjs` |
| TypeScript | `.ts`, `.mts`, `.cts` |
| React | `.jsx`, `.tsx` |
| Vue | `.vue` |
| Svelte | `.svelte` |

---

## Commands

All commands available via **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `Log Highlighter: Show Menu` | Open the main menu |
| `Log Highlighter: Highlight All Console Statements` | Highlight all console methods |
| `Log Highlighter: Highlight console.log` | Highlight console.log only |
| `Log Highlighter: Highlight console.warn` | Highlight console.warn only |
| `Log Highlighter: Highlight console.error` | Highlight console.error only |
| `Log Highlighter: Highlight console.info` | Highlight console.info only |
| `Log Highlighter: Highlight console.debug` | Highlight console.debug only |
| `Log Highlighter: Highlight Custom Patterns` | Highlight all custom patterns |
| `Log Highlighter: Manage Framework Presets` | Open preset manager |
| `Log Highlighter: Remove All Highlighted Statements` | Delete highlighted code |
| `Log Highlighter: Clear All Highlights` | Remove highlights only |

---

## Edge Cases Handled

<details>
<summary><strong>Multi-line statements</strong></summary>

```javascript
console.log(
  "Hello",
  { data: value },
  someFunction()
);
```
</details>

<details>
<summary><strong>Nested parentheses</strong></summary>

```javascript
console.log(calculate(a, b), process(x, y));
```
</details>

<details>
<summary><strong>Template literals</strong></summary>

```javascript
console.log(`Value: ${getValue()}`);
```
</details>

<details>
<summary><strong>Multiple statements on one line</strong></summary>

```javascript
console.log(a); console.warn(b);
```
</details>

<details>
<summary><strong>Chained method calls</strong></summary>

```javascript
console.log(obj.method().property);
```
</details>

---

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
npm install       # Install dependencies
npm run build     # Build
npm run watch     # Watch mode
vsce package      # Package as .vsix
```

### Project Structure

```
log-highlighter/
├── src/
│   ├── extension.ts      # Main entry point
│   ├── commands.ts       # Command handlers
│   ├── consoleParser.ts  # Multi-line parser
│   ├── decorator.ts      # Decoration manager
│   └── types.ts          # Type definitions
├── package.json          # Extension manifest
├── tsconfig.json         # TypeScript config
└── esbuild.js            # Build script
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by <a href="https://sounakdas.in"><strong>Sounak Das</strong></a>
</p>
