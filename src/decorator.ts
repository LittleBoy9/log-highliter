import * as vscode from 'vscode';
import {
  ConsoleMethod,
  ConsoleStatement,
  CONSOLE_METHODS,
  DECORATION_CONFIGS,
} from './types.js';

export class DecorationManager {
  private decorationTypes: Map<ConsoleMethod, vscode.TextEditorDecorationType>;
  private activeDecorations: Map<ConsoleMethod, vscode.Range[]>;
  private currentStatements: ConsoleStatement[] = [];

  constructor() {
    this.decorationTypes = new Map();
    this.activeDecorations = new Map();

    for (const method of CONSOLE_METHODS) {
      const config = DECORATION_CONFIGS[method];
      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: config.backgroundColor,
        borderWidth: '0 0 0 3px',
        borderStyle: 'solid',
        borderColor: config.borderColor,
        overviewRulerColor: config.overviewRulerColor,
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        isWholeLine: true,
      });
      this.decorationTypes.set(method, decorationType);
      this.activeDecorations.set(method, []);
    }
  }

  applyDecorations(
    editor: vscode.TextEditor,
    statements: ConsoleStatement[],
    filterMethods?: ConsoleMethod[]
  ): void {
    this.currentStatements = statements;
    const methodsToShow = filterMethods || CONSOLE_METHODS;

    for (const method of CONSOLE_METHODS) {
      const decorationType = this.decorationTypes.get(method);
      if (!decorationType) {
        continue;
      }

      if (methodsToShow.includes(method)) {
        const ranges = statements
          .filter((s) => s.method === method)
          .map((s) => this.getFullLineRange(editor.document, s.range));

        this.activeDecorations.set(method, ranges);
        editor.setDecorations(decorationType, ranges);
      } else {
        this.activeDecorations.set(method, []);
        editor.setDecorations(decorationType, []);
      }
    }
  }

  clearAllDecorations(editor: vscode.TextEditor): void {
    for (const method of CONSOLE_METHODS) {
      const decorationType = this.decorationTypes.get(method);
      if (decorationType) {
        editor.setDecorations(decorationType, []);
        this.activeDecorations.set(method, []);
      }
    }
    this.currentStatements = [];
  }

  getCurrentStatements(): ConsoleStatement[] {
    return this.currentStatements;
  }

  hasActiveDecorations(): boolean {
    for (const ranges of this.activeDecorations.values()) {
      if (ranges.length > 0) {
        return true;
      }
    }
    return false;
  }

  private getFullLineRange(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.Range {
    const startLine = range.start.line;
    const endLine = range.end.line;

    return new vscode.Range(
      new vscode.Position(startLine, 0),
      document.lineAt(endLine).range.end
    );
  }

  dispose(): void {
    for (const decorationType of this.decorationTypes.values()) {
      decorationType.dispose();
    }
    this.decorationTypes.clear();
    this.activeDecorations.clear();
  }
}
