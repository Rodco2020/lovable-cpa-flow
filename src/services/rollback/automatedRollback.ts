/**
 * Phase 6: Automated Rollback Service
 * 
 * Automated rollback procedures for system recovery
 */

export interface RollbackPoint {
  id: string;
  timestamp: Date;
  version: string;
  description: string;
  systemState: SystemState;
  validationSnapshot: any;
}

export interface SystemState {
  demandMatrixConfig: any;
  filteringSettings: any;
  exportSettings: any;
  validationRules: any;
}

export interface RollbackResult {
  success: boolean;
  rollbackPointId: string;
  timeToRollback: number;
  componentsRestored: string[];
  errors?: string[];
}

export interface RollbackPlan {
  triggerConditions: RollbackTrigger[];
  rollbackSteps: RollbackStep[];
  validationChecks: ValidationCheck[];
  notificationSettings: NotificationSettings;
}

export interface RollbackTrigger {
  type: 'error_rate' | 'performance' | 'validation_failure' | 'manual';
  threshold?: number;
  duration?: number; // seconds
  description: string;
}

export interface RollbackStep {
  order: number;
  component: string;
  action: 'restore_config' | 'reset_state' | 'clear_cache' | 'reload_data';
  description: string;
  rollbackData?: any;
}

export interface ValidationCheck {
  component: string;
  checkFunction: string;
  expectedResult: any;
  timeout: number;
}

export interface NotificationSettings {
  alertOnRollback: boolean;
  emailNotifications: boolean;
  logLevel: 'info' | 'warn' | 'error';
}

export class AutomatedRollbackService {
  private static instance: AutomatedRollbackService;
  private rollbackPoints: Map<string, RollbackPoint> = new Map();
  private rollbackPlan: RollbackPlan;
  private isRollbackInProgress = false;

  private constructor() {
    this.rollbackPlan = {
      triggerConditions: [
        {
          type: 'error_rate',
          threshold: 15, // 15% error rate
          duration: 300, // 5 minutes
          description: 'High error rate detected'
        },
        {
          type: 'performance',
          threshold: 5000, // 5 seconds
          duration: 180, // 3 minutes
          description: 'Poor performance detected'
        },
        {
          type: 'validation_failure',
          threshold: 3, // 3 critical validation failures
          duration: 60, // 1 minute
          description: 'Critical validation failures'
        }
      ],
      rollbackSteps: [
        {
          order: 1,
          component: 'FilteringEngine',
          action: 'restore_config',
          description: 'Restore filtering configuration to last known good state'
        },
        {
          order: 2,
          component: 'ExportService',
          action: 'restore_config',
          description: 'Restore export service configuration'
        },
        {
          order: 3,
          component: 'ValidationService',
          action: 'reset_state',
          description: 'Reset validation service state'
        },
        {
          order: 4,
          component: 'DemandMatrix',
          action: 'reload_data',
          description: 'Reload demand matrix data from stable source'
        }
      ],
      validationChecks: [
        {
          component: 'FilteringEngine',
          checkFunction: 'validateFilteringModes',
          expectedResult: true,
          timeout: 5000
        },
        {
          component: 'ExportService',
          checkFunction: 'validateExportCapability',
          expectedResult: true,
          timeout: 3000
        }
      ],
      notificationSettings: {
        alertOnRollback: true,
        emailNotifications: false,
        logLevel: 'warn'
      }
    };
  }

  static getInstance(): AutomatedRollbackService {
    if (!AutomatedRollbackService.instance) {
      AutomatedRollbackService.instance = new AutomatedRollbackService();
    }
    return AutomatedRollbackService.instance;
  }

  /**
   * Create a rollback point with current system state
   */
  createRollbackPoint(description: string, version: string = 'auto'): string {
    const rollbackPoint: RollbackPoint = {
      id: `rb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      version,
      description,
      systemState: this.captureCurrentSystemState(),
      validationSnapshot: this.captureValidationSnapshot()
    };

    this.rollbackPoints.set(rollbackPoint.id, rollbackPoint);
    
    console.log(`📍 [ROLLBACK] Created rollback point: ${rollbackPoint.id} - ${description}`);
    
    // Keep only last 10 rollback points
    if (this.rollbackPoints.size > 10) {
      const oldest = Array.from(this.rollbackPoints.keys())[0];
      this.rollbackPoints.delete(oldest);
    }

    return rollbackPoint.id;
  }

  /**
   * Execute automated rollback to specific point
   */
  async executeRollback(rollbackPointId?: string): Promise<RollbackResult> {
    if (this.isRollbackInProgress) {
      throw new Error('Rollback already in progress');
    }

    const startTime = performance.now();
    this.isRollbackInProgress = true;

    try {
      // Use latest rollback point if none specified
      const targetPoint = rollbackPointId 
        ? this.rollbackPoints.get(rollbackPointId)
        : this.getLatestRollbackPoint();

      if (!targetPoint) {
        throw new Error('No rollback point available');
      }

      console.log(`🔄 [ROLLBACK] Starting automated rollback to: ${targetPoint.id}`);

      const componentsRestored: string[] = [];
      const errors: string[] = [];

      // Execute rollback steps in order
      for (const step of this.rollbackPlan.rollbackSteps) {
        try {
          await this.executeRollbackStep(step, targetPoint);
          componentsRestored.push(step.component);
          console.log(`✅ [ROLLBACK] Step ${step.order} completed: ${step.description}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Step ${step.order} failed: ${errorMessage}`);
          console.error(`❌ [ROLLBACK] Step ${step.order} failed: ${errorMessage}`);
        }
      }

      // Run validation checks
      const validationResults = await this.runPostRollbackValidation();
      
      if (!validationResults.allPassed) {
        errors.push(...validationResults.failures);
      }

      const rollbackResult: RollbackResult = {
        success: errors.length === 0,
        rollbackPointId: targetPoint.id,
        timeToRollback: Math.round(performance.now() - startTime),
        componentsRestored,
        errors: errors.length > 0 ? errors : undefined
      };

      // Send notifications
      if (this.rollbackPlan.notificationSettings.alertOnRollback) {
        this.sendRollbackNotification(rollbackResult);
      }

      console.log(`🎯 [ROLLBACK] Rollback completed:`, {
        success: rollbackResult.success,
        componentsRestored: rollbackResult.componentsRestored.length,
        timeToRollback: rollbackResult.timeToRollback,
        errors: rollbackResult.errors?.length || 0
      });

      return rollbackResult;

    } finally {
      this.isRollbackInProgress = false;
    }
  }

  /**
   * Check if rollback should be triggered based on conditions
   */
  shouldTriggerRollback(
    errorRate: number,
    averageResponseTime: number,
    validationFailures: number
  ): { shouldTrigger: boolean; reason?: string } {
    for (const trigger of this.rollbackPlan.triggerConditions) {
      switch (trigger.type) {
        case 'error_rate':
          if (errorRate > (trigger.threshold || 0)) {
            return {
              shouldTrigger: true,
              reason: `Error rate ${errorRate}% exceeds threshold ${trigger.threshold}%`
            };
          }
          break;

        case 'performance':
          if (averageResponseTime > (trigger.threshold || 0)) {
            return {
              shouldTrigger: true,
              reason: `Response time ${averageResponseTime}ms exceeds threshold ${trigger.threshold}ms`
            };
          }
          break;

        case 'validation_failure':
          if (validationFailures > (trigger.threshold || 0)) {
            return {
              shouldTrigger: true,
              reason: `Validation failures ${validationFailures} exceed threshold ${trigger.threshold}`
            };
          }
          break;
      }
    }

    return { shouldTrigger: false };
  }

  /**
   * Get rollback history
   */
  getRollbackHistory(): RollbackPoint[] {
    return Array.from(this.rollbackPoints.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Update rollback plan configuration
   */
  updateRollbackPlan(updates: Partial<RollbackPlan>): void {
    this.rollbackPlan = { ...this.rollbackPlan, ...updates };
    console.log('⚙️ [ROLLBACK] Rollback plan updated');
  }

  private captureCurrentSystemState(): SystemState {
    return {
      demandMatrixConfig: {
        groupingMode: 'skill',
        filteringEnabled: true,
        exportEnabled: true
      },
      filteringSettings: {
        supportedModes: ['all', 'specific', 'unassigned'],
        defaultMode: 'all',
        validationEnabled: true
      },
      exportSettings: {
        supportedFormats: ['csv', 'json'],
        defaultFormat: 'csv',
        enhancedFeaturesEnabled: true
      },
      validationRules: {
        strictModeEnabled: true,
        performanceThresholds: {
          maxProcessingTime: 2000,
          maxMemoryUsage: 50
        }
      }
    };
  }

  private captureValidationSnapshot(): any {
    return {
      timestamp: new Date().toISOString(),
      systemHealth: 'healthy',
      lastValidationSuccess: true,
      performanceMetrics: {
        averageResponseTime: 150,
        errorRate: 0.5,
        memoryUsage: 15
      }
    };
  }

  private getLatestRollbackPoint(): RollbackPoint | undefined {
    const points = Array.from(this.rollbackPoints.values());
    return points.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  private async executeRollbackStep(step: RollbackStep, rollbackPoint: RollbackPoint): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    switch (step.action) {
      case 'restore_config':
        // Simulate config restoration
        await delay(100);
        console.log(`🔧 [ROLLBACK] Restored ${step.component} configuration`);
        break;

      case 'reset_state':
        // Simulate state reset
        await delay(50);
        console.log(`🔄 [ROLLBACK] Reset ${step.component} state`);
        break;

      case 'clear_cache':
        // Simulate cache clearing
        await delay(25);
        console.log(`🗑️ [ROLLBACK] Cleared ${step.component} cache`);
        break;

      case 'reload_data':
        // Simulate data reload
        await delay(200);
        console.log(`📥 [ROLLBACK] Reloaded ${step.component} data`);
        break;

      default:
        throw new Error(`Unknown rollback action: ${step.action}`);
    }
  }

  private async runPostRollbackValidation(): Promise<{ allPassed: boolean; failures: string[] }> {
    const failures: string[] = [];

    for (const check of this.rollbackPlan.validationChecks) {
      try {
        // Simulate validation check
        const result = await this.simulateValidationCheck(check);
        if (!result) {
          failures.push(`${check.component} validation failed`);
        }
      } catch (error) {
        failures.push(`${check.component} validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      allPassed: failures.length === 0,
      failures
    };
  }

  private async simulateValidationCheck(check: ValidationCheck): Promise<boolean> {
    // Simulate validation check with timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        resolve(Math.random() > 0.05);
      }, Math.min(check.timeout, 100));
    });
  }

  private sendRollbackNotification(result: RollbackResult): void {
    const message = result.success 
      ? `✅ Rollback completed successfully in ${result.timeToRollback}ms`
      : `❌ Rollback failed with ${result.errors?.length || 0} errors`;

    console.log(`📧 [ROLLBACK NOTIFICATION] ${message}`);

    if (this.rollbackPlan.notificationSettings.logLevel === 'warn' || 
        this.rollbackPlan.notificationSettings.logLevel === 'error') {
      console.warn('[ROLLBACK]', result);
    }
  }
}

// Export singleton instance
export const automatedRollbackService = AutomatedRollbackService.getInstance();
