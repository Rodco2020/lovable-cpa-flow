
/**
 * Forecasting Logger Service
 * 
 * Provides structured logging for forecasting operations
 */

interface LogContext {
  component?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

class ForecastingLogger {
  private prefix = '[FORECASTING]';

  info(message: string, context?: LogContext) {
    console.log(`${this.prefix} INFO: ${message}`, context || '');
  }

  warn(message: string, context?: LogContext) {
    console.warn(`${this.prefix} WARN: ${message}`, context || '');
  }

  error(message: string, error?: Error, context?: LogContext) {
    console.error(`${this.prefix} ERROR: ${message}`, error || '', context || '');
  }

  debug(message: string, context?: LogContext) {
    console.log(`${this.prefix} DEBUG: ${message}`, context || '');
  }
}

export const logger = new ForecastingLogger();
export default logger;
