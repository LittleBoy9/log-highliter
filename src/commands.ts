import * as vscode from 'vscode';
import {
  ConsoleMethod,
  CONSOLE_METHODS,
  CustomPattern,
  PresetName,
  FRAMEWORK_PRESETS,
  CustomStatement,
} from './types.js';
import {
  parseConsoleStatements,
  getFullLineRanges,
  parseCustomStatements,
} from './consoleParser.js';
import { DecorationManager } from './decorator.js';

export function createCommands(decorationManager: DecorationManager): vscode.Disposable[] {
  const commands: vscode.Disposable[] = [];

  commands.push(
    vscode.commands.registerCommand('log-highlighter.showMenu', () => {
      showQuickPick(decorationManager);
    })
  );

  commands.push(
    vscode.commands.registerCommand('log-highlighter.highlightAll', () => {
      highlightConsole(decorationManager);
    })
  );

  for (const method of CONSOLE_METHODS) {
    const commandName = `log-highlighter.highlight${capitalize(method)}`;
    commands.push(
      vscode.commands.registerCommand(commandName, () => {
        highlightConsole(decorationManager, [method]);
      })
    );
  }

  commands.push(
    vscode.commands.registerCommand('log-highlighter.removeAll', () => {
      removeAllHighlighted(decorationManager);
    })
  );

  commands.push(
    vscode.commands.registerCommand('log-highlighter.clearHighlights', () => {
      clearHighlights(decorationManager);
    })
  );

  commands.push(
    vscode.commands.registerCommand('log-highlighter.managePresets', () => {
      managePresets();
    })
  );

  commands.push(
    vscode.commands.registerCommand('log-highlighter.highlightCustom', () => {
      highlightCustomPatterns(decorationManager);
    })
  );

  return commands;
}

async function showQuickPick(decorationManager: DecorationManager): Promise<void> {
  const hasConsoleStatements = decorationManager.getCurrentStatements().length > 0;
  const hasCustomStatements = decorationManager.getCurrentCustomStatements().length > 0;
  const enabledPresets = getEnabledPresets();
  const customPatternsFromSettings = getCustomPatterns();

  const items: vscode.QuickPickItem[] = [
    {
      label: '$(eye) Highlight All Console',
      description: 'Highlight all console statements',
      detail: 'log, warn, error, info, debug',
    },
    { kind: vscode.QuickPickItemKind.Separator, label: 'By Type' },
    {
      label: '$(circle-filled) console.log',
      description: 'Highlight console.log statements',
    },
    {
      label: '$(warning) console.warn',
      description: 'Highlight console.warn statements',
    },
    {
      label: '$(error) console.error',
      description: 'Highlight console.error statements',
    },
    {
      label: '$(info) console.info',
      description: 'Highlight console.info statements',
    },
    {
      label: '$(bug) console.debug',
      description: 'Highlight console.debug statements',
    },
    { kind: vscode.QuickPickItemKind.Separator, label: 'Custom Loggers' },
  ];

  // Show enabled presets as individual items
  for (const presetName of enabledPresets) {
    const preset = FRAMEWORK_PRESETS[presetName];
    if (preset) {
      items.push({
        label: `$(package) ${preset.name}`,
        description: `Highlight ${preset.patterns.length} patterns`,
        detail: preset.patterns.slice(0, 3).join(', ') + (preset.patterns.length > 3 ? '...' : ''),
      });
    }
  }

  // Show custom patterns from settings
  for (const pattern of customPatternsFromSettings) {
    items.push({
      label: `$(symbol-variable) ${pattern.name}`,
      description: `Highlight "${pattern.pattern}"`,
    });
  }

  items.push(
    {
      label: '$(library) Highlight All Custom',
      description: enabledPresets.length > 0 || customPatternsFromSettings.length > 0
        ? `${getAllCustomPatterns().length} patterns total`
        : 'No patterns configured',
    },
    {
      label: '$(settings-gear) Manage Presets',
      description: 'Enable NestJS, Winston, Pino, etc.',
    }
  );

  // Show actions based on what's currently highlighted
  if (hasConsoleStatements || hasCustomStatements) {
    items.push({ kind: vscode.QuickPickItemKind.Separator, label: 'Actions' });

    if (hasConsoleStatements && hasCustomStatements) {
      items.push({
        label: '$(trash) Remove All Highlighted',
        description: 'Delete all highlighted statements from code',
      });
    } else if (hasConsoleStatements) {
      items.push({
        label: '$(trash) Remove Console Highlighted',
        description: `Delete ${decorationManager.getCurrentStatements().length} console statements`,
      });
    } else if (hasCustomStatements) {
      items.push({
        label: '$(trash) Remove Custom Highlighted',
        description: `Delete ${decorationManager.getCurrentCustomStatements().length} custom statements`,
      });
    }

    items.push({
      label: '$(close) Clear Highlights',
      description: 'Remove highlights without deleting code',
    });
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select console statements to highlight',
    title: 'Log Highlighter',
  });

  if (!selected) {
    return;
  }

  const label = selected.label;

  if (label.includes('Highlight All Console')) {
    highlightConsole(decorationManager);
  } else if (label.includes('console.log')) {
    highlightConsole(decorationManager, ['log']);
  } else if (label.includes('console.warn')) {
    highlightConsole(decorationManager, ['warn']);
  } else if (label.includes('console.error')) {
    highlightConsole(decorationManager, ['error']);
  } else if (label.includes('console.info')) {
    highlightConsole(decorationManager, ['info']);
  } else if (label.includes('console.debug')) {
    highlightConsole(decorationManager, ['debug']);
  } else if (label.includes('Highlight All Custom')) {
    highlightCustomPatterns(decorationManager);
  } else if (label.includes('Manage Presets')) {
    managePresets();
  } else if (label.includes('Remove Custom Highlighted')) {
    removeCustomHighlighted(decorationManager);
  } else if (label.includes('Remove Console Highlighted')) {
    removeAllHighlighted(decorationManager);
  } else if (label.includes('Remove All Highlighted')) {
    removeAllHighlighted(decorationManager);
    removeCustomHighlighted(decorationManager);
  } else if (label.includes('Clear Highlights')) {
    clearHighlights(decorationManager);
  } else {
    // Check if it's a preset selection
    const presetNames = Object.keys(FRAMEWORK_PRESETS) as PresetName[];
    for (const presetName of presetNames) {
      const preset = FRAMEWORK_PRESETS[presetName];
      if (label.includes(preset.name)) {
        highlightPreset(decorationManager, presetName);
        return;
      }
    }

    // Check if it's a custom pattern selection
    for (const pattern of customPatternsFromSettings) {
      if (label.includes(pattern.name)) {
        highlightSinglePattern(decorationManager, pattern);
        return;
      }
    }
  }
}

function highlightConsole(
  decorationManager: DecorationManager,
  filterMethods?: ConsoleMethod[]
): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  const statements = parseConsoleStatements(editor.document, filterMethods);
  decorationManager.applyDecorations(editor, statements, filterMethods);

  const count = statements.length;
  const methodsLabel = filterMethods
    ? filterMethods.map((m) => `console.${m}`).join(', ')
    : 'all console methods';

  if (count === 0) {
    vscode.window.showInformationMessage(`No ${methodsLabel} statements found`);
  } else {
    vscode.window.showInformationMessage(
      `Found ${count} ${methodsLabel} statement${count === 1 ? '' : 's'}`
    );
  }
}

async function removeAllHighlighted(decorationManager: DecorationManager): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  const statements = decorationManager.getCurrentStatements();
  if (statements.length === 0) {
    vscode.window.showInformationMessage('No highlighted statements to remove');
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Are you sure you want to remove ${statements.length} console statement${statements.length === 1 ? '' : 's'}?`,
    { modal: true },
    'Remove All'
  );

  if (confirm !== 'Remove All') {
    return;
  }

  const fullLineRanges = getFullLineRanges(editor.document, statements);

  const sortedRanges = [...fullLineRanges].sort((a, b) =>
    b.start.compareTo(a.start)
  );

  await editor.edit((editBuilder) => {
    for (const range of sortedRanges) {
      const endLine = range.end.line;
      let deleteRange: vscode.Range;

      if (endLine < editor.document.lineCount - 1) {
        deleteRange = new vscode.Range(
          range.start,
          new vscode.Position(endLine + 1, 0)
        );
      } else if (range.start.line > 0) {
        const prevLineEnd = editor.document.lineAt(range.start.line - 1).range.end;
        deleteRange = new vscode.Range(prevLineEnd, range.end);
      } else {
        deleteRange = range;
      }

      editBuilder.delete(deleteRange);
    }
  });

  decorationManager.clearAllDecorations(editor);
  vscode.window.showInformationMessage(
    `Removed ${statements.length} console statement${statements.length === 1 ? '' : 's'}`
  );
}

function clearHighlights(decorationManager: DecorationManager): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  decorationManager.clearAllDecorations(editor);
  vscode.window.showInformationMessage('Highlights cleared');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getConfig() {
  return vscode.workspace.getConfiguration('logHighlighter');
}

function getEnabledPresets(): PresetName[] {
  return getConfig().get<PresetName[]>('enabledPresets', []);
}

function getCustomPatterns(): CustomPattern[] {
  return getConfig().get<CustomPattern[]>('customPatterns', []);
}

function getAllCustomPatterns(): CustomPattern[] {
  const patterns: CustomPattern[] = [];
  const seenPatterns = new Set<string>();

  const enabledPresets = getEnabledPresets();
  for (const presetName of enabledPresets) {
    const preset = FRAMEWORK_PRESETS[presetName];
    if (preset) {
      for (const pattern of preset.patterns) {
        if (!seenPatterns.has(pattern)) {
          seenPatterns.add(pattern);
          patterns.push({
            name: `${preset.name}: ${pattern}`,
            pattern,
            color: preset.color,
          });
        }
      }
    }
  }

  for (const customPattern of getCustomPatterns()) {
    if (!seenPatterns.has(customPattern.pattern)) {
      seenPatterns.add(customPattern.pattern);
      patterns.push(customPattern);
    }
  }

  return patterns;
}

async function managePresets(): Promise<void> {
  const enabledPresets = getEnabledPresets();
  const presetNames = Object.keys(FRAMEWORK_PRESETS) as PresetName[];

  const items: vscode.QuickPickItem[] = presetNames.map((name) => {
    const preset = FRAMEWORK_PRESETS[name];
    const isEnabled = enabledPresets.includes(name);
    return {
      label: `${isEnabled ? '$(check) ' : '$(circle-outline) '}${preset.name}`,
      description: `${preset.patterns.length} patterns`,
      detail: preset.patterns.slice(0, 3).join(', ') + (preset.patterns.length > 3 ? '...' : ''),
      picked: isEnabled,
    };
  });

  items.push(
    { kind: vscode.QuickPickItemKind.Separator, label: '' },
    {
      label: '$(gear) Open Settings',
      description: 'Add custom patterns in settings.json',
    }
  );

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Toggle framework presets (select to enable/disable)',
    title: 'Manage Logger Presets',
  });

  if (!selected) {
    return;
  }

  if (selected.label.includes('Open Settings')) {
    vscode.commands.executeCommand(
      'workbench.action.openSettings',
      'logHighlighter.customPatterns'
    );
    return;
  }

  const presetName = presetNames.find(
    (name) => selected.label.includes(FRAMEWORK_PRESETS[name].name)
  );

  if (presetName) {
    const newPresets = enabledPresets.includes(presetName)
      ? enabledPresets.filter((p) => p !== presetName)
      : [...enabledPresets, presetName];

    await getConfig().update('enabledPresets', newPresets, vscode.ConfigurationTarget.Global);

    const action = enabledPresets.includes(presetName) ? 'disabled' : 'enabled';
    vscode.window.showInformationMessage(
      `${FRAMEWORK_PRESETS[presetName].name} preset ${action}`
    );
  }
}

function highlightPreset(decorationManager: DecorationManager, presetName: PresetName): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  const preset = FRAMEWORK_PRESETS[presetName];
  if (!preset) {
    return;
  }

  const patterns: CustomPattern[] = preset.patterns.map((pattern) => ({
    name: `${preset.name}: ${pattern}`,
    pattern,
    color: preset.color,
  }));

  const statements = parseCustomStatements(editor.document, patterns);
  decorationManager.applyCustomDecorations(editor, statements);

  if (statements.length === 0) {
    vscode.window.showInformationMessage(`No ${preset.name} statements found`);
  } else {
    vscode.window.showInformationMessage(
      `Found ${statements.length} ${preset.name} statement${statements.length === 1 ? '' : 's'}`
    );
  }
}

function highlightSinglePattern(decorationManager: DecorationManager, pattern: CustomPattern): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  const statements = parseCustomStatements(editor.document, [pattern]);
  decorationManager.applyCustomDecorations(editor, statements);

  if (statements.length === 0) {
    vscode.window.showInformationMessage(`No "${pattern.pattern}" statements found`);
  } else {
    vscode.window.showInformationMessage(
      `Found ${statements.length} "${pattern.pattern}" statement${statements.length === 1 ? '' : 's'}`
    );
  }
}

async function highlightCustomPatterns(decorationManager: DecorationManager): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  const patterns = getAllCustomPatterns();
  if (patterns.length === 0) {
    const action = await vscode.window.showWarningMessage(
      'No custom patterns configured. Would you like to enable a preset or add custom patterns?',
      'Manage Presets',
      'Open Settings'
    );

    if (action === 'Manage Presets') {
      managePresets();
    } else if (action === 'Open Settings') {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'logHighlighter.customPatterns'
      );
    }
    return;
  }

  const statements = parseCustomStatements(editor.document, patterns);
  decorationManager.applyCustomDecorations(editor, statements);

  if (statements.length === 0) {
    vscode.window.showInformationMessage('No custom logger statements found');
  } else {
    vscode.window.showInformationMessage(
      `Found ${statements.length} custom logger statement${statements.length === 1 ? '' : 's'}`
    );
  }
}

async function removeCustomHighlighted(decorationManager: DecorationManager): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  const statements = decorationManager.getCurrentCustomStatements();
  if (statements.length === 0) {
    vscode.window.showInformationMessage('No highlighted custom statements to remove');
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Are you sure you want to remove ${statements.length} custom logger statement${statements.length === 1 ? '' : 's'}?`,
    { modal: true },
    'Remove All'
  );

  if (confirm !== 'Remove All') {
    return;
  }

  const fullLineRanges = getFullLineRanges(editor.document, statements);

  const sortedRanges = [...fullLineRanges].sort((a, b) => b.start.compareTo(a.start));

  await editor.edit((editBuilder) => {
    for (const range of sortedRanges) {
      const endLine = range.end.line;
      let deleteRange: vscode.Range;

      if (endLine < editor.document.lineCount - 1) {
        deleteRange = new vscode.Range(
          range.start,
          new vscode.Position(endLine + 1, 0)
        );
      } else if (range.start.line > 0) {
        const prevLineEnd = editor.document.lineAt(range.start.line - 1).range.end;
        deleteRange = new vscode.Range(prevLineEnd, range.end);
      } else {
        deleteRange = range;
      }

      editBuilder.delete(deleteRange);
    }
  });

  decorationManager.clearCustomDecorations(editor);
  vscode.window.showInformationMessage(
    `Removed ${statements.length} custom logger statement${statements.length === 1 ? '' : 's'}`
  );
}
