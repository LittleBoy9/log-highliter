import * as vscode from 'vscode';
import { DecorationManager } from './decorator.js';
import { createCommands } from './commands.js';

let decorationManager: DecorationManager | undefined;

export function activate(context: vscode.ExtensionContext): void {
  decorationManager = new DecorationManager();

  const commands = createCommands(decorationManager);
  context.subscriptions.push(...commands);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
      if (editor && decorationManager) {
        decorationManager.restoreDecorations(editor);
      }
    })
  );

  context.subscriptions.push({
    dispose: () => {
      if (decorationManager) {
        decorationManager.dispose();
        decorationManager = undefined;
      }
    },
  });

  console.log('Log Highlighter extension is now active');
}

export function deactivate(): void {
  if (decorationManager) {
    decorationManager.dispose();
    decorationManager = undefined;
  }
}
