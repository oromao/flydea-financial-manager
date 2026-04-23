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
  // Always structured JSON in production for better observability
  if (!isDev) {
    return JSON.stringify({
      service: 'flydea-financial-manager',
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  // Development: readable format
  const ctx = context
    ? ' | ' + Object.entries(context)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' | ')
    : '';
  return `[FlyDea ${level}] ${message}${ctx}`;
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
  // High-level tracing helper
  track(event: string, metadata: Record<string, unknown>) {
    console.log(formatMessage('TRACK', event, metadata));
  }
};

