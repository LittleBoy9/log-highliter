# Log Highlighter

A VS Code extension to highlight, manage, and remove console statements and custom logger patterns in your code.

![VS Code Version](https://img.shields.io/badge/VS%20Code-1.85%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Highlight Console Statements** - Instantly highlight `console.log`, `console.warn`, `console.error`, `console.info`, and `console.debug` with distinct colors
- **Custom Logger Support** - Add your own patterns for custom loggers (NestJS, Winston, Pino, etc.)
- **Framework Presets** - Built-in presets for popular logging frameworks
- **Multi-line Support** - Correctly handles multi-line console statements with nested parentheses
- **One-Click Removal** - Remove all highlighted statements from your code with a single click
- **Editor Toolbar Button** - Quick access from the editor title bar

## Installation

### From Source

```bash
git clone https://github.com/yourusername/log-highlighter.git
cd log-highlighter
npm install
npm run build
vsce package
code --install-extension log-highlighter-0.0.1.vsix
```

## Usage

### Quick Start

1. Open any JavaScript/TypeScript file
2. Click the **filter icon** in the editor title bar (top right)
3. Select what you want to highlight from the dropdown menu

### Menu Options

| Option | Description |
|--------|-------------|
| **Highlight All Console** | Highlights all console.log/warn/error/info/debug |
| **console.log** | Highlight only console.log statements |
| **console.warn** | Highlight only console.warn statements |
| **console.error** | Highlight only console.error statements |
| **console.info** | Highlight only console.info statements |
| **console.debug** | Highlight only console.debug statements |
| **Highlight All Custom** | Highlight all enabled presets and custom patterns |
| **Manage Presets** | Enable/disable framework presets |
| **Remove Highlighted** | Delete highlighted statements from code |
| **Clear Highlights** | Remove highlights without deleting code |

## Color Scheme

### Console Methods

| Method | Color |
|--------|-------|
| `console.log` | Blue |
| `console.warn` | Yellow |
| `console.error` | Red |
| `console.info` | Cyan |
| `console.debug` | Magenta |

### Framework Presets

| Framework | Color | Patterns |
|-----------|-------|----------|
| NestJS Logger | Red (#e0234e) | `this.logger.log`, `Logger.log`, etc. |
| Winston | Green (#22c55e) | `logger.info`, `logger.error`, etc. |
| Pino | Teal (#10b981) | `logger.info`, `logger.trace`, etc. |
| Bunyan | Orange (#f59e0b) | `log.info`, `log.error`, etc. |
| Log4js | Purple (#8b5cf6) | `logger.info`, `logger.debug`, etc. |

## Configuration

### Enable Framework Presets

1. Click the filter icon in editor title bar
2. Select "Manage Presets"
3. Click on a preset to enable/disable it

Or add to your `settings.json`:

```json
{
  "logHighlighter.enabledPresets": ["nestjs", "winston"]
}
```

### Add Custom Patterns

Add custom patterns in your `settings.json`:

```json
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
- `name` - Display name shown in the menu
- `pattern` - Text to match (e.g., `myLogger.info`, `customLog`)
- `color` - Hex color for highlighting (e.g., `#ff6b6b`)

## Supported File Types

- JavaScript (`.js`, `.mjs`, `.cjs`)
- TypeScript (`.ts`, `.mts`, `.cts`)
- React (`.jsx`, `.tsx`)
- Vue (`.vue`)
- Svelte (`.svelte`)

## Commands

All commands are available via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

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

## Edge Cases Handled

The extension correctly handles:

- **Multi-line statements**
  ```javascript
  console.log(
    "Hello",
    { data: value },
    someFunction()
  );
  ```

- **Nested parentheses**
  ```javascript
  console.log(calculate(a, b), process(x, y));
  ```

- **Template literals**
  ```javascript
  console.log(`Value: ${getValue()}`);
  ```

- **Multiple statements on one line**
  ```javascript
  console.log(a); console.warn(b);
  ```

- **Chained method calls**
  ```javascript
  console.log(obj.method().property);
  ```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Package
vsce package
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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Changelog

### 0.0.1

- Initial release
- Console statement highlighting (log, warn, error, info, debug)
- Multi-line statement support
- Framework presets (NestJS, Winston, Pino, Bunyan, Log4js)
- Custom pattern support
- One-click removal of highlighted statements
