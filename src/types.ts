import * as vscode from 'vscode';

export type ConsoleMethod = 'log' | 'warn' | 'error' | 'info' | 'debug';

export const CONSOLE_METHODS: ConsoleMethod[] = ['log', 'warn', 'error', 'info', 'debug'];

export type PresetName = 'nestjs' | 'winston' | 'pino' | 'bunyan' | 'log4js';

export interface CustomPattern {
  name: string;
  pattern: string;
  color: string;
}

export interface PresetPattern {
  name: string;
  patterns: string[];
  color: string;
}

export const FRAMEWORK_PRESETS: Record<PresetName, PresetPattern> = {
  nestjs: {
    name: 'NestJS Logger',
    patterns: [
      'this.logger.log',
      'this.logger.error',
      'this.logger.warn',
      'this.logger.debug',
      'this.logger.verbose',
      'Logger.log',
      'Logger.error',
      'Logger.warn',
      'Logger.debug',
      'Logger.verbose',
    ],
    color: '#e0234e',
  },
  winston: {
    name: 'Winston',
    patterns: [
      'logger.info',
      'logger.error',
      'logger.warn',
      'logger.debug',
      'logger.verbose',
      'logger.silly',
    ],
    color: '#22c55e',
  },
  pino: {
    name: 'Pino',
    patterns: [
      'logger.info',
      'logger.error',
      'logger.warn',
      'logger.debug',
      'logger.trace',
      'logger.fatal',
    ],
    color: '#10b981',
  },
  bunyan: {
    name: 'Bunyan',
    patterns: [
      'log.info',
      'log.error',
      'log.warn',
      'log.debug',
      'log.trace',
      'log.fatal',
    ],
    color: '#f59e0b',
  },
  log4js: {
    name: 'Log4js',
    patterns: [
      'logger.info',
      'logger.error',
      'logger.warn',
      'logger.debug',
      'logger.trace',
      'logger.fatal',
    ],
    color: '#8b5cf6',
  },
};

export interface ConsoleStatement {
  method: ConsoleMethod;
  range: vscode.Range;
  fullText: string;
}

export interface CustomStatement {
  patternId: string;
  name: string;
  color: string;
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
