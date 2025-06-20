
/**
 * Phase 6: System Health Monitor
 * 
 * Automated monitoring and alerting for system health
 */

import { DemandMatrixValidator, ValidationResult } from '@/services/validation/demandMatrixValidator';
import { DemandMatrixData, DemandFilters } from '@/types/demand';

export interface HealthMonitoringConfig {
  monitoringInterval: number; // in milliseconds
  performanceThresholds: PerformanceThresholds;
  alertingEnabled: boolean;
  autoRecoveryEnabled: boolean;
}

export interface PerformanceThresholds {
  maxProcessingTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  minSuccessRate: number; // percentage
  maxErrorRate: number; // percentage
}

export interface HealthAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  message: string;
  metrics?: any;
  autoRecoveryAttempted?: boolean;
}

export interface SystemHealthMetrics {
  uptime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  currentMemoryUsage: number;
  recentAlerts: HealthAlert[];
  systemStatus: 'healthy' | 'warning' | 'critical';
}

export class SystemHealthMonitor {
  private static instance: SystemHealthMonitor;
  private config: HealthMonitoringConfig;
  private metrics: SystemHealthMetrics;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: Array<(alert: HealthAlert) => void> = [];

  private constructor() {
    this.config = {
      monitoringInterval: 30000, // 30 seconds
      performanceThresholds: {
        maxProcessingTime: 2000, // 2 seconds
        maxMemoryUsage: 50, // 50 MB
        minSuccessRate: 95, // 95%
        maxErrorRate: 5 // 5%
      },
      alertingEnabled: true,
      autoRecoveryEnabled: true
    };

    this.metrics = {
      uptime: Date.now(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      currentMemoryUsage: 0,
      recentAlerts: [],
      systemStatus: 'healthy'
    };
  }

  static getInstance(): SystemHealthMonitor {
    if (!SystemHealthMonitor.instance) {
      SystemHealthMonitor.instance = new SystemHealthMonitor();
    }
    return SystemHealthMonitor.instance;
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(): void {
    console.log('🔍 [HEALTH MONITOR] Starting system health monitoring');
    
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.monitoringInterval);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ [HEALTH MONITOR] Health monitoring stopped');
    }
  }

  /**
   * Record a system operation for monitoring
   */
  recordOperation(
    operationType: string,
    duration: number,
    success: boolean,
    metadata?: any
  ): void {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + duration) / 
      this.metrics.totalRequests;

    // Check for performance issues
    this.checkPerformanceThresholds(operationType, duration, success, metadata);
  }

  /**
   * Monitor a validation operation
   */
  async monitorValidation(
    demandData: DemandMatrixData,
    filters: DemandFilters
  ): Promise<ValidationResult> {
    const startTime = performance.now();
    let validationResult: ValidationResult;
    let success = false;

    try {
      validationResult = await DemandMatrixValidator.validateSystem(
        demandData,
        filters,
        startTime
      );
      
      success = validationResult.isValid;
      return validationResult;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Create fallback validation result
      validationResult = {
        isValid: false,
        errors: [{
          code: 'VALIDATION_SYSTEM_ERROR',
          message: errorMessage,
          severity: 'critical',
          component: 'ValidationSystem'
        }],
        warnings: [],
        performanceMetrics: {
          processingTime: performance.now() - startTime,
          memoryUsage: 0,
          dataPointsProcessed: 0,
          filteringEfficiency: 0
        },
        systemHealth: {
          filteringModeSupport: false,
          dataIntegrity: false,
          exportFunctionality: false,
          uiResponsiveness: false,
          errorHandling: false
        }
      };
      
      return validationResult;
      
    } finally {
      const duration = performance.now() - startTime;
      this.recordOperation('validation', duration, success, {
        dataPointCount: demandData.dataPoints?.length || 0,
        filtersApplied: Object.keys(filters).length
      });
    }
  }

  /**
   * Add alert callback
   */
  onAlert(callback: (alert: HealthAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get current system metrics
   */
  getMetrics(): SystemHealthMetrics {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.uptime
    };
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(newConfig: Partial<HealthMonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ [HEALTH MONITOR] Configuration updated:', this.config);
  }

  private async performHealthCheck(): Promise<void> {
    console.log('💓 [HEALTH MONITOR] Performing periodic health check');

    // Update memory usage
    this.updateMemoryUsage();

    // Check system status
    this.updateSystemStatus();

    // Clean up old alerts
    this.cleanupOldAlerts();

    // Check for auto-recovery needs
    if (this.config.autoRecoveryEnabled && this.metrics.systemStatus === 'critical') {
      await this.attemptAutoRecovery();
    }
  }

  private checkPerformanceThresholds(
    operationType: string,
    duration: number,
    success: boolean,
    metadata?: any
  ): void {
    const thresholds = this.config.performanceThresholds;

    // Check processing time
    if (duration > thresholds.maxProcessingTime) {
      this.createAlert({
        severity: 'medium',
        component: 'Performance',
        message: `${operationType} operation exceeded time threshold: ${Math.round(duration)}ms > ${thresholds.maxProcessingTime}ms`,
        metrics: { duration, threshold: thresholds.maxProcessingTime, metadata }
      });
    }

    // Check success rate
    const successRate = (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
    if (successRate < thresholds.minSuccessRate && this.metrics.totalRequests > 10) {
      this.createAlert({
        severity: 'high',
        component: 'Reliability',
        message: `Success rate below threshold: ${successRate.toFixed(1)}% < ${thresholds.minSuccessRate}%`,
        metrics: { successRate, threshold: thresholds.minSuccessRate }
      });
    }

    // Check error rate
    const errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
    if (errorRate > thresholds.maxErrorRate && this.metrics.totalRequests > 10) {
      this.createAlert({
        severity: 'high',
        component: 'Reliability',
        message: `Error rate exceeded threshold: ${errorRate.toFixed(1)}% > ${thresholds.maxErrorRate}%`,
        metrics: { errorRate, threshold: thresholds.maxErrorRate }
      });
    }
  }

  private updateMemoryUsage(): void {
    // Estimate current memory usage
    if (typeof window !== 'undefined' && (window as any).performance?.memory) {
      const memory = (window as any).performance.memory;
      this.metrics.currentMemoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024));
    } else {
      // Fallback estimation
      this.metrics.currentMemoryUsage = Math.round(Math.random() * 20 + 10); // Mock value
    }

    // Check memory threshold
    if (this.metrics.currentMemoryUsage > this.config.performanceThresholds.maxMemoryUsage) {
      this.createAlert({
        severity: 'medium',
        component: 'Memory',
        message: `Memory usage exceeded threshold: ${this.metrics.currentMemoryUsage}MB > ${this.config.performanceThresholds.maxMemoryUsage}MB`,
        metrics: { currentUsage: this.metrics.currentMemoryUsage, threshold: this.config.performanceThresholds.maxMemoryUsage }
      });
    }
  }

  private updateSystemStatus(): void {
    const criticalAlerts = this.metrics.recentAlerts.filter(a => a.severity === 'critical').length;
    const highAlerts = this.metrics.recentAlerts.filter(a => a.severity === 'high').length;
    const mediumAlerts = this.metrics.recentAlerts.filter(a => a.severity === 'medium').length;

    if (criticalAlerts > 0) {
      this.metrics.systemStatus = 'critical';
    } else if (highAlerts > 2 || mediumAlerts > 5) {
      this.metrics.systemStatus = 'warning';
    } else {
      this.metrics.systemStatus = 'healthy';
    }
  }

  private createAlert(alertData: Omit<HealthAlert, 'id' | 'timestamp'>): void {
    const alert: HealthAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alertData
    };

    this.metrics.recentAlerts.push(alert);
    
    console.warn(`🚨 [HEALTH MONITOR] ${alert.severity.toUpperCase()} ALERT: ${alert.message}`);

    // Trigger alert callbacks
    if (this.config.alertingEnabled) {
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in alert callback:', error);
        }
      });
    }
  }

  private cleanupOldAlerts(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.metrics.recentAlerts = this.metrics.recentAlerts.filter(
      alert => alert.timestamp > oneHourAgo
    );
  }

  private async attemptAutoRecovery(): Promise<void> {
    console.log('🔧 [HEALTH MONITOR] Attempting auto-recovery for critical system status');

    try {
      // Reset metrics if they seem stuck
      if (this.metrics.failedRequests > this.metrics.successfulRequests * 2) {
        console.log('🔄 [HEALTH MONITOR] Resetting failure metrics for auto-recovery');
        this.metrics.failedRequests = Math.floor(this.metrics.failedRequests / 2);
        this.metrics.successfulRequests = Math.floor(this.metrics.successfulRequests / 2);
      }

      // Clear old alerts
      this.metrics.recentAlerts = this.metrics.recentAlerts.filter(
        alert => alert.severity !== 'medium' && alert.severity !== 'low'
      );

      this.createAlert({
        severity: 'low',
        component: 'AutoRecovery',
        message: 'Auto-recovery procedures executed',
        autoRecoveryAttempted: true
      });

    } catch (error) {
      console.error('❌ [HEALTH MONITOR] Auto-recovery failed:', error);
      
      this.createAlert({
        severity: 'critical',
        component: 'AutoRecovery',
        message: `Auto-recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        autoRecoveryAttempted: true
      });
    }
  }
}

// Export singleton instance
export const systemHealthMonitor = SystemHealthMonitor.getInstance();
