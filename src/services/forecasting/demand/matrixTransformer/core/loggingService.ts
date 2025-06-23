
/**
 * Logging Service for Matrix Transformation
 * Centralized logging utilities
 */

export class LoggingService {
  /**
   * Log transformation completion with metrics
   */
  static logTransformationComplete(matrixData: any, metrics: any): void {
    console.log(`✅ [MATRIX TRANSFORMER] Transformation completed successfully:`, {
      processingTime: `${metrics.duration.toFixed(2)}ms`,
      finalDataPoints: matrixData.dataPoints.length,
      totalDemand: matrixData.totalDemand,
      totalClients: matrixData.totalClients,
      totalStaff: matrixData.availableStaff?.length || 0,
      revenueCalculationEnabled: !!matrixData.revenueTotals,
      memoryUsage: `${(metrics.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB peak`
    });
  }

  /**
   * Log transformation start
   */
  static logTransformationStart(forecastDataLength: number, tasksLength: number): void {
    console.log(`🔄 [MATRIX TRANSFORMER] Starting transformation:`, {
      forecastDataLength,
      tasksLength
    });
  }

  /**
   * Log performance warning if needed
   */
  static logPerformanceWarning(processingTime: number): void {
    if (processingTime > 2000) {
      console.warn(`⚠️ [MATRIX TRANSFORMER] Processing time exceeded 2s target: ${processingTime.toFixed(2)}ms`);
    }
  }

  /**
   * Log validation warnings
   */
  static logValidationWarnings(validationResult: any): void {
    if (!validationResult.isValid) {
      console.warn('⚠️ [MATRIX TRANSFORM] Data validation issues:', validationResult.issues);
    }
  }
}
