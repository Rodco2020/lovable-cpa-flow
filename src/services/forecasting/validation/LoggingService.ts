
/**
 * Logging Service
 * 
 * Comprehensive logging and monitoring system for the Demand Matrix with
 * revenue calculations. Provides structured logging, performance monitoring,
 * and debugging capabilities.
 */

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: 'demand' | 'revenue' | 'validation' | 'performance' | 'user' | 'system';
  operation: string;
  component: string;
  message: string;
  data?: Record<string, any>;
  duration?: number;
  userId?: string;
  sessionId?: string;
}

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: number;
  dataSize?: number;
  success: boolean;
  errors?: string[];
}

export class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private sessionId: string;
  private maxLogs = 1000;
  private activeTimers = new Map<string, number>();

  private constructor() {
    this.sessionId = this.generateSessionId();
    console.log(`📋 [LOGGING] Service initialized with session ID: ${this.sessionId}`);
  }

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Log debug information
   */
  public debug(
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.addLog('debug', 'system', operation, component, message, data);
  }

  /**
   * Log general information
   */
  public info(
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.addLog('info', 'system', operation, component, message, data);
  }

  /**
   * Log warnings
   */
  public warn(
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.addLog('warn', 'system', operation, component, message, data);
  }

  /**
   * Log errors
   */
  public error(
    operation: string,
    component: string,
    message: string,
    error?: Error,
    data?: Record<string, any>
  ): void {
    const errorData = {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };
    
    this.addLog('error', 'system', operation, component, message, errorData);
  }

  /**
   * Log critical issues
   */
  public critical(
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.addLog('critical', 'system', operation, component, message, data);
  }

  /**
   * Log revenue-specific operations
   */
  public revenue(
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.addLog('info', 'revenue', operation, component, message, data);
  }

  /**
   * Log demand calculation operations
   */
  public demand(
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.addLog('info', 'demand', operation, component, message, data);
  }

  /**
   * Log validation operations
   */
  public validation(
    level: 'info' | 'warn' | 'error',
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.addLog(level, 'validation', operation, component, message, data);
  }

  /**
   * Log user actions
   */
  public userAction(
    operation: string,
    component: string,
    message: string,
    userId?: string,
    data?: Record<string, any>
  ): void {
    this.addLog('info', 'user', operation, component, message, { ...data, userId });
  }

  /**
   * Start performance timer
   */
  public startTimer(operation: string): string {
    const timerId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeTimers.set(timerId, performance.now());
    
    console.time(`⏱️ [PERF] ${operation}`);
    
    return timerId;
  }

  /**
   * End performance timer and log results
   */
  public endTimer(
    timerId: string,
    operation: string,
    component: string,
    success: boolean = true,
    data?: Record<string, any>
  ): number {
    const startTime = this.activeTimers.get(timerId);
    if (!startTime) {
      console.warn(`Timer ${timerId} not found`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.activeTimers.delete(timerId);
    console.timeEnd(`⏱️ [PERF] ${operation}`);

    // Log performance metric
    const metric: PerformanceMetric = {
      operation,
      startTime,
      endTime,
      duration,
      success,
      memoryUsage: this.getMemoryUsage(),
      dataSize: data?.dataSize
    };

    this.performanceMetrics.push(metric);

    // Log performance info
    this.addLog('info', 'performance', operation, component, 
      `Operation completed in ${duration.toFixed(2)}ms`, 
      { ...data, duration, success }
    );

    return duration;
  }

  /**
   * Log performance milestone
   */
  public performanceMilestone(
    operation: string,
    component: string,
    milestone: string,
    data?: Record<string, any>
  ): void {
    this.addLog('debug', 'performance', operation, component, 
      `Milestone: ${milestone}`, data
    );
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  /**
   * Add log entry
   */
  private addLog(
    level: LogEntry['level'],
    category: LogEntry['category'],
    operation: string,
    component: string,
    message: string,
    data?: Record<string, any>
  ): void {
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      operation,
      component,
      message,
      data,
      sessionId: this.sessionId
    };

    this.logs.push(logEntry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with proper formatting
    this.outputToConsole(logEntry);
  }

  /**
   * Output log entry to console with formatting
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] ${entry.category.toUpperCase()}`;
    const message = `${prefix} ${entry.component}.${entry.operation}: ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(`🔍 ${message}`, entry.data);
        break;
      case 'info':
        console.info(`ℹ️ ${message}`, entry.data);
        break;
      case 'warn':
        console.warn(`⚠️ ${message}`, entry.data);
        break;
      case 'error':
        console.error(`❌ ${message}`, entry.data);
        break;
      case 'critical':
        console.error(`🚨 ${message}`, entry.data);
        break;
    }
  }

  /**
   * Get recent logs
   */
  public getRecentLogs(
    limit: number =100,
    level?: LogEntry['level'],
    category?: LogEntry['category']
  ): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    return filteredLogs.slice(-limit);
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.performanceMetrics.filter(metric => metric.operation === operation);
    }
    return this.performanceMetrics;
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    slowestOperations: Array<{ operation: string; duration: number }>;
    memoryTrends: Array<{ timestamp: Date; usage: number }>;
  } {
    const metrics = this.performanceMetrics;
    const totalOperations = metrics.length;
    const successfulOperations = metrics.filter(m => m.success).length;
    const averageDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalOperations;
    
    const slowestOperations = metrics
      .filter(m => m.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10)
      .map(m => ({ operation: m.operation, duration: m.duration || 0 }));

    const memoryTrends = this.logs
      .filter(log => log.category === 'performance' && log.data?.memoryUsage)
      .slice(-20)
      .map(log => ({
        timestamp: log.timestamp,
        usage: log.data!.memoryUsage
      }));

    return {
      totalOperations,
      averageDuration,
      successRate: totalOperations > 0 ? (successfulOperations / totalOperations) * 100 : 0,
      slowestOperations,
      memoryTrends
    };
  }

  /**
   * Clear logs and metrics
   */
  public clearLogs(): void {
    this.logs = [];
    this.performanceMetrics = [];
    this.activeTimers.clear();
    console.log('🧹 [LOGGING] All logs and metrics cleared');
  }

  /**
   * Export logs for debugging
   */
  public exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      logs: this.logs,
      performanceMetrics: this.performanceMetrics,
      summary: this.getPerformanceSummary()
    }, null, 2);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get system information for debugging
   */
  public getSystemInfo(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      totalLogs: this.logs.length,
      performanceMetrics: this.performanceMetrics.length,
      memoryUsage: this.getMemoryUsage(),
      activeTimers: this.activeTimers.size
    };
  }
}

// Export singleton instance
export const loggingService = LoggingService.getInstance();
