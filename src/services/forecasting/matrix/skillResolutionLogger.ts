
/**
 * Phase 4: Skill Resolution Logger Service
 * 
 * Provides comprehensive logging and diagnostics for skill resolution processes
 * to aid in troubleshooting and performance monitoring.
 */

export interface SkillResolutionLogEntry {
  timestamp: string;
  operation: string;
  skillName?: string;
  success: boolean;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SkillResolutionDiagnostics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  commonErrors: Record<string, number>;
  recentEntries: SkillResolutionLogEntry[];
  performanceMetrics: {
    cacheHitRate: number;
    averageResolutionTime: number;
    errorRate: number;
  };
}

export class SkillResolutionLogger {
  private static logs: SkillResolutionLogEntry[] = [];
  private static readonly MAX_LOG_ENTRIES = 1000;

  /**
   * Phase 4: Log a skill resolution operation
   */
  static log(entry: Omit<SkillResolutionLogEntry, 'timestamp'>): void {
    const logEntry: SkillResolutionLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);

    // Prevent memory leaks by limiting log size
    if (this.logs.length > this.MAX_LOG_ENTRIES) {
      this.logs = this.logs.slice(-this.MAX_LOG_ENTRIES);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const logLevel = entry.success ? 'log' : 'warn';
      console[logLevel](`🎯 [SKILL RESOLUTION] ${entry.operation}:`, {
        skill: entry.skillName,
        success: entry.success,
        duration: entry.duration ? `${entry.duration}ms` : 'N/A',
        error: entry.error,
        metadata: entry.metadata
      });
    }
  }

  /**
   * Phase 4: Log successful skill resolution
   */
  static logSuccess(operation: string, skillName?: string, duration?: number, metadata?: Record<string, any>): void {
    this.log({
      operation,
      skillName,
      success: true,
      duration,
      metadata
    });
  }

  /**
   * Phase 4: Log failed skill resolution
   */
  static logError(operation: string, error: string, skillName?: string, metadata?: Record<string, any>): void {
    this.log({
      operation,
      skillName,
      success: false,
      error,
      metadata
    });
  }

  /**
   * Phase 4: Log skill resolution timing
   */
  static logTiming(operation: string, startTime: number, skillName?: string, metadata?: Record<string, any>): void {
    const duration = Date.now() - startTime;
    this.logSuccess(operation, skillName, duration, metadata);
  }

  /**
   * Phase 4: Generate comprehensive diagnostics
   */
  static generateDiagnostics(): SkillResolutionDiagnostics {
    const totalOperations = this.logs.length;
    const successfulOperations = this.logs.filter(log => log.success).length;
    const failedOperations = totalOperations - successfulOperations;

    // Calculate average duration for successful operations
    const durationsWithValues = this.logs
      .filter(log => log.success && log.duration !== undefined)
      .map(log => log.duration!);
    
    const averageDuration = durationsWithValues.length > 0
      ? durationsWithValues.reduce((sum, duration) => sum + duration, 0) / durationsWithValues.length
      : 0;

    // Count common errors
    const commonErrors: Record<string, number> = {};
    this.logs
      .filter(log => !log.success && log.error)
      .forEach(log => {
        const error = log.error!;
        commonErrors[error] = (commonErrors[error] || 0) + 1;
      });

    // Get recent entries (last 50)
    const recentEntries = this.logs.slice(-50);

    // Calculate performance metrics
    const cacheHits = this.logs.filter(log => 
      log.success && log.metadata?.source === 'cache'
    ).length;
    const cacheHitRate = totalOperations > 0 ? (cacheHits / totalOperations) * 100 : 0;

    const errorRate = totalOperations > 0 ? (failedOperations / totalOperations) * 100 : 0;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageDuration: Math.round(averageDuration * 100) / 100,
      commonErrors,
      recentEntries,
      performanceMetrics: {
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        averageResolutionTime: Math.round(averageDuration * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100
      }
    };
  }

  /**
   * Phase 4: Clear all logs (useful for testing)
   */
  static clearLogs(): void {
    this.logs = [];
    console.log('🎯 [SKILL RESOLUTION] Log history cleared');
  }

  /**
   * Phase 4: Get filtered logs by criteria
   */
  static getFilteredLogs(filters: {
    operation?: string;
    skillName?: string;
    success?: boolean;
    timeRange?: { start: Date; end: Date };
  }): SkillResolutionLogEntry[] {
    return this.logs.filter(log => {
      if (filters.operation && log.operation !== filters.operation) return false;
      if (filters.skillName && log.skillName !== filters.skillName) return false;
      if (filters.success !== undefined && log.success !== filters.success) return false;
      if (filters.timeRange) {
        const logTime = new Date(log.timestamp);
        if (logTime < filters.timeRange.start || logTime > filters.timeRange.end) return false;
      }
      return true;
    });
  }

  /**
   * Phase 4: Export logs for external analysis
   */
  static exportLogs(): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalEntries: this.logs.length,
      diagnostics: this.generateDiagnostics(),
      logs: this.logs
    }, null, 2);
  }

  /**
   * Phase 4: Get performance summary for user display
   */
  static getPerformanceSummary(): {
    status: 'good' | 'warning' | 'error';
    summary: string;
    details: string[];
  } {
    const diagnostics = this.generateDiagnostics();
    
    if (diagnostics.totalOperations === 0) {
      return {
        status: 'warning',
        summary: 'No skill resolution operations recorded',
        details: ['System may not be processing skills correctly']
      };
    }

    const errorRate = diagnostics.performanceMetrics.errorRate;
    const averageTime = diagnostics.averageResolutionTime;

    let status: 'good' | 'warning' | 'error';
    let summary: string;
    const details: string[] = [];

    if (errorRate < 5 && averageTime < 100) {
      status = 'good';
      summary = 'Skill resolution performing well';
    } else if (errorRate < 15 && averageTime < 500) {
      status = 'warning';
      summary = 'Skill resolution has some issues';
    } else {
      status = 'error';
      summary = 'Skill resolution needs attention';
    }

    details.push(`${diagnostics.successfulOperations}/${diagnostics.totalOperations} operations successful`);
    details.push(`Average resolution time: ${averageTime}ms`);
    details.push(`Cache hit rate: ${diagnostics.performanceMetrics.cacheHitRate}%`);

    if (errorRate > 0) {
      details.push(`Error rate: ${errorRate}%`);
    }

    return { status, summary, details };
  }
}

export default SkillResolutionLogger;
