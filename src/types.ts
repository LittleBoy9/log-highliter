import * as vscode from 'vscode';

export type ConsoleMethod = 'log' | 'warn' | 'error' | 'info' | 'debug';

export const CONSOLE_METHODS: ConsoleMethod[] = ['log', 'warn', 'error', 'info', 'debug'];

export interface ConsoleStatement {
  method: ConsoleMethod;
  range: vscode.Range;
  fullText: string;
}

export interface DecorationConfig {
  backgroundColor: string;
  borderColor: string;
  overviewRulerColor: string;
}

export const DECORATION_CONFIGS: Record<ConsoleMethod, DecorationConfig> = {
  log: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
    overviewRulerColor: '#3b82f6',
  },
  warn: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderColor: '#eab308',
    overviewRulerColor: '#eab308',
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
    overviewRulerColor: '#ef4444',
  },
  info: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06b6d4',
    overviewRulerColor: '#06b6d4',
  },
  debug: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#a855f7',
    overviewRulerColor: '#a855f7',
  },
};
