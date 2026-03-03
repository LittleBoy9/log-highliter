import * as vscode from 'vscode';
import {
  ConsoleMethod,
  ConsoleStatement,
  CustomStatement,
  CustomPattern,
  CONSOLE_METHODS,
} from './types.js';

export function parseConsoleStatements(
  document: vscode.TextDocument,
  filterMethods?: ConsoleMethod[]
): ConsoleStatement[] {
  const text = document.getText();
  const statements: ConsoleStatement[] = [];
  const methodsToFind = filterMethods || CONSOLE_METHODS;

  for (const method of methodsToFind) {
    const pattern = new RegExp(`console\\.${method}\\s*\\(`, 'g');
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const startOffset = match.index;
      const openParenOffset = match.index + match[0].length - 1;

      const endOffset = findMatchingCloseParen(text, openParenOffset);
      if (endOffset === -1) {
        continue;
      }

      const startPos = document.positionAt(startOffset);
      const endPos = document.positionAt(endOffset + 1);
      const range = new vscode.Range(startPos, endPos);
      const fullText = text.substring(startOffset, endOffset + 1);

      statements.push({
        method,
        range,
        fullText,
      });
    }
  }

  statements.sort((a, b) => a.range.start.compareTo(b.range.start));

  return statements;
}

function findMatchingCloseParen(text: string, openParenOffset: number): number {
  let depth = 1;
  let i = openParenOffset + 1;
  let inString: string | null = null;
  let inTemplateLiteral = false;
  let templateBraceDepth = 0;

  while (i < text.length && depth > 0) {
    const char = text[i];

    if (inTemplateLiteral) {
      if (char === '\\') {
        i += 2;
        continue;
      }
      if (char === '`') {
        inTemplateLiteral = false;
      } else if (char === '$' && text[i + 1] === '{') {
        templateBraceDepth++;
        i += 2;
        continue;
      } else if (char === '}' && templateBraceDepth > 0) {
        templateBraceDepth--;
      }
      i++;
      continue;
    }

    if (inString) {
      if (char === '\\') {
        i += 2;
        continue;
      }
      if (char === inString) {
        inString = null;
      }
      i++;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = char;
      i++;
      continue;
    }

    if (char === '`') {
      inTemplateLiteral = true;
      i++;
      continue;
    }

    if (char === '/' && text[i + 1] === '/') {
      const newlineIndex = text.indexOf('\n', i);
      if (newlineIndex === -1) {
        break;
      }
      i = newlineIndex + 1;
      continue;
    }

    if (char === '/' && text[i + 1] === '*') {
      const endCommentIndex = text.indexOf('*/', i + 2);
      if (endCommentIndex === -1) {
        break;
      }
      i = endCommentIndex + 2;
      continue;
    }

    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }

    i++;
  }

  return -1;
}

export function getFullLineRanges(
  document: vscode.TextDocument,
  statements: { range: vscode.Range }[]
): vscode.Range[] {
  const ranges: vscode.Range[] = [];

  for (const statement of statements) {
    const startLine = statement.range.start.line;
    const endLine = statement.range.end.line;

    const fullLineStart = new vscode.Position(startLine, 0);
    const fullLineEnd = document.lineAt(endLine).range.end;

    ranges.push(new vscode.Range(fullLineStart, fullLineEnd));
  }

  return mergeOverlappingRanges(ranges);
}

function mergeOverlappingRanges(ranges: vscode.Range[]): vscode.Range[] {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort((a, b) => a.start.compareTo(b.start));
  const merged: vscode.Range[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start.line <= last.end.line + 1) {
      merged[merged.length - 1] = new vscode.Range(
        last.start,
        current.end.isAfter(last.end) ? current.end : last.end
      );
    } else {
      merged.push(current);
    }
  }

  return merged;
}

export function parseCustomStatements(
  document: vscode.TextDocument,
  patterns: CustomPattern[]
): CustomStatement[] {
  const text = document.getText();
  const statements: CustomStatement[] = [];

  for (const customPattern of patterns) {
    const escapedPattern = escapeRegex(customPattern.pattern);
    const regex = new RegExp(`${escapedPattern}\\s*\\(`, 'g');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const startOffset = match.index;
      const openParenOffset = match.index + match[0].length - 1;

      const endOffset = findMatchingCloseParen(text, openParenOffset);
      if (endOffset === -1) {
        continue;
      }

      const startPos = document.positionAt(startOffset);
      const endPos = document.positionAt(endOffset + 1);
      const range = new vscode.Range(startPos, endPos);
      const fullText = text.substring(startOffset, endOffset + 1);

      statements.push({
        patternId: customPattern.pattern,
        name: customPattern.name,
        color: customPattern.color,
        range,
        fullText,
      });
    }
  }

  statements.sort((a, b) => a.range.start.compareTo(b.range.start));
  return statements;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
