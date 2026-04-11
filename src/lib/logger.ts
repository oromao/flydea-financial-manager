/**
 * Simple structured logger for API routes.
 *
 * Usage:
 *   logger.error('Export failed', { userId, period, error: e.message });
 *   logger.warn('No transactions found', { userId, period });
 *   logger.info('Export completed', { userId, period, count: transactions.length });
 *
 * Output format (development):
 *   [FlyDea ERROR] Export failed | userId: xxx | period: 0
 *
 * Output format (production / Vercel):
 *   JSON object for log aggregation services
 */

const isDev = process.env.NODE_ENV === 'development';

function formatMessage(
  level: string,
  message: string,
  context?: Record<string, unknown>
): string {
  if (isDev) {
    const ctx = context
      ? ' | ' + Object.entries(context)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | ')
      : '';
    return `[FlyDea ${level}] ${message}${ctx}`;
  }
  // Production: structured JSON for log aggregation
  return JSON.stringify({
    service: 'flydea-financial-manager',
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log(formatMessage('INFO', message, context));
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatMessage('WARN', message, context));
  },
  error(message: string, context?: Record<string, unknown>) {
    console.error(formatMessage('ERROR', message, context));
  },
};
