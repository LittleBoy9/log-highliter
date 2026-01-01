import * as vscode from 'vscode';
import {
  ConsoleMethod,
  ConsoleStatement,
  CustomStatement,
  CONSOLE_METHODS,
  DECORATION_CONFIGS,
} from './types.js';

export class DecorationManager {
  private decorationTypes: Map<ConsoleMethod, vscode.TextEditorDecorationType>;
  private activeDecorations: Map<ConsoleMethod, vscode.Range[]>;
  private currentStatements: ConsoleStatement[] = [];

  private customDecorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
  private customActiveDecorations: Map<string, vscode.Range[]> = new Map();
  private currentCustomStatements: CustomStatement[] = [];

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
    this.clearCustomDecorations(editor);
  }

  getCurrentStatements(): ConsoleStatement[] {
    return this.currentStatements;
  }

  getCurrentCustomStatements(): CustomStatement[] {
    return this.currentCustomStatements;
  }

  hasActiveDecorations(): boolean {
    for (const ranges of this.activeDecorations.values()) {
      if (ranges.length > 0) {
        return true;
      }
    }
    for (const ranges of this.customActiveDecorations.values()) {
      if (ranges.length > 0) {
        return true;
      }
    }
    return false;
  }

  applyCustomDecorations(
    editor: vscode.TextEditor,
    statements: CustomStatement[]
  ): void {
    this.clearCustomDecorations(editor);
    this.currentCustomStatements = statements;

    const groupedByColor = new Map<string, CustomStatement[]>();
    for (const statement of statements) {
      const key = statement.color;
      if (!groupedByColor.has(key)) {
        groupedByColor.set(key, []);
      }
      groupedByColor.get(key)!.push(statement);
    }

    for (const [color, stmts] of groupedByColor) {
      let decorationType = this.customDecorationTypes.get(color);
      if (!decorationType) {
        decorationType = vscode.window.createTextEditorDecorationType({
          backgroundColor: this.hexToRgba(color, 0.2),
          borderWidth: '0 0 0 3px',
          borderStyle: 'solid',
          borderColor: color,
          overviewRulerColor: color,
          overviewRulerLane: vscode.OverviewRulerLane.Right,
          isWholeLine: true,
        });
        this.customDecorationTypes.set(color, decorationType);
      }

      const ranges = stmts.map((s) =>
        this.getFullLineRange(editor.document, s.range)
      );
      this.customActiveDecorations.set(color, ranges);
      editor.setDecorations(decorationType, ranges);
    }
  }

  clearCustomDecorations(editor: vscode.TextEditor): void {
    for (const [color, decorationType] of this.customDecorationTypes) {
      editor.setDecorations(decorationType, []);
      this.customActiveDecorations.set(color, []);
    }
    this.currentCustomStatements = [];
  }

  private hexToRgba(hex: string, alpha: number): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return `rgba(128, 128, 128, ${alpha})`;
    }
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

    for (const decorationType of this.customDecorationTypes.values()) {
      decorationType.dispose();
    }
    this.customDecorationTypes.clear();
    this.customActiveDecorations.clear();
  }
}
