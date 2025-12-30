import * as vscode from 'vscode';
import { ConsoleMethod, CONSOLE_METHODS } from './types.js';
import { parseConsoleStatements, getFullLineRanges } from './consoleParser.js';
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

  return commands;
}

async function showQuickPick(decorationManager: DecorationManager): Promise<void> {
  const hasHighlights = decorationManager.hasActiveDecorations();

  const items: vscode.QuickPickItem[] = [
    {
      label: '$(eye) Highlight All',
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
  ];

  if (hasHighlights) {
    items.push(
      { kind: vscode.QuickPickItemKind.Separator, label: 'Actions' },
      {
        label: '$(trash) Remove All Highlighted',
        description: 'Delete all highlighted console statements from code',
      },
      {
        label: '$(close) Clear Highlights',
        description: 'Remove highlights without deleting code',
      }
    );
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select console statements to highlight',
    title: 'Log Highlighter',
  });

  if (!selected) {
    return;
  }

  const label = selected.label;

  if (label.includes('Highlight All')) {
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
  } else if (label.includes('Remove All')) {
    removeAllHighlighted(decorationManager);
  } else if (label.includes('Clear Highlights')) {
    clearHighlights(decorationManager);
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
