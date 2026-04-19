/**
 * Logger Service
 * Centralized logging with appropriate levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    // In production, could send to external logging service
    if (this.isDevelopment) {
      this.logToDevelopment(entry);
    } else {
      this.logToProduction(entry);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    this.log('error', message, context, error);
  }

  private logToDevelopment(entry: LogEntry): void {
    const { level, message, context, error } = entry;
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
      reset: '\x1b[0m',
    };

    const color = colors[level];
    console.log(
      `${color}[${level.toUpperCase()}]${colors.reset} ${message}`,
      context ? context : '',
      error ? error : ''
    );
  }

  private logToProduction(entry: LogEntry): void {
    // In production, typically send to a logging service
    // For now, just log to console in JSON format
    console.log(JSON.stringify(entry));
  }
}

export const logger = new LoggerService();
