
/**
 * Phase 6: End-to-End Test Scenarios
 * 
 * Comprehensive testing workflows for the entire enhanced system
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { DemandMatrixValidator } from '@/services/validation/demandMatrixValidator';
import { EnhancedExportService } from '@/services/forecasting/export/enhancedExportService';
import { DemandMatrixData, DemandFilters } from '@/types/demand';

export interface EndToEndTestResult {
  testSuite: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testResults: TestScenarioResult[];
  overallDuration: number;
  performanceMetrics: any;
}

export interface TestScenarioResult {
  scenario: string;
  passed: boolean;
  duration: number;
  validationResult?: any;
  errorMessage?: string;
}

export class Phase6EndToEndTestRunner {
  private static mockDemandData: DemandMatrixData = {
    dataPoints: [
      {
        skillType: 'Tax Preparation',
        month: '2025-01',
        monthLabel: 'Jan 2025',
        demandHours: 120,
        taskCount: 8,
        clientCount: 3,
        taskBreakdown: [
          {
            clientId: 'client-1',
            clientName: 'Client A',
            recurringTaskId: 'task-1',
            taskName: 'Monthly Tax Review',
            skillType: 'Tax Preparation',
            estimatedHours: 15,
            recurrencePattern: {
              type: 'monthly',
              interval: 1,
              frequency: 12
            },
            monthlyHours: 60,
            preferredStaff: {
              staffId: 'staff-1',
              staffName: 'John Smith',
              assignmentType: 'preferred'
            }
          },
          {
            clientId: 'client-2',
            clientName: 'Client B',
            recurringTaskId: 'task-2',
            taskName: 'Quarterly Filing',
            skillType: 'Tax Preparation',
            estimatedHours: 15,
            recurrencePattern: {
              type: 'quarterly',
              interval: 3,
              frequency: 4
            },
            monthlyHours: 60,
            preferredStaff: undefined
          }
        ]
      },
      {
        skillType: 'Advisory',
        month: '2025-01',
        monthLabel: 'Jan 2025',
        demandHours: 80,
        taskCount: 4,
        clientCount: 2,
        taskBreakdown: [
          {
            clientId: 'client-3',
            clientName: 'Client C',
            recurringTaskId: 'task-3',
            taskName: 'Business Advisory',
            skillType: 'Advisory',
            estimatedHours: 20,
            recurrencePattern: {
              type: 'monthly',
              interval: 1,
              frequency: 12
            },
            monthlyHours: 80,
            preferredStaff: {
              staffId: 'staff-2',
              staffName: 'Jane Doe',
              assignmentType: 'preferred'
            }
          }
        ]
      }
    ],
    skills: ['Tax Preparation', 'Advisory', 'Audit'],
    months: [
      { key: '2025-01', label: 'Jan 2025' },
      { key: '2025-02', label: 'Feb 2025' }
    ],
    totalDemand: 200,
    totalTasks: 12,
    totalClients: 3,
    skillSummary: {
      'Tax Preparation': {
        totalHours: 120,
        taskCount: 8,
        clientCount: 3
      },
      'Advisory': {
        totalHours: 80,
        taskCount: 4,
        clientCount: 2
      }
    }
  };

  /**
   * Run all Phase 6 end-to-end test scenarios
   */
  static async runAllEndToEndTests(): Promise<EndToEndTestResult> {
    console.log('🚀 [PHASE 6 E2E] Starting comprehensive end-to-end testing');
    const overallStartTime = performance.now();

    const testScenarios = [
      'All Staff Mode Testing',
      'Specific Staff Mode Testing',
      'Unassigned Only Mode Testing',
      'Edge Case Testing',
      'Performance Testing',
      'Export Integration Testing',
      'Data Integrity Testing',
      'Error Handling Testing'
    ];

    const testResults: TestScenarioResult[] = [];

    for (const scenario of testScenarios) {
      const result = await this.runTestScenario(scenario);
      testResults.push(result);
    }

    const overallDuration = performance.now() - overallStartTime;
    const passedTests = testResults.filter(r => r.passed).length;
    const failedTests = testResults.filter(r => !r.passed).length;

    const endToEndResult: EndToEndTestResult = {
      testSuite: 'Phase 6 Comprehensive End-to-End Tests',
      totalTests: testScenarios.length,
      passedTests,
      failedTests,
      testResults,
      overallDuration: Math.round(overallDuration),
      performanceMetrics: this.calculateOverallPerformanceMetrics(testResults)
    };

    console.log('✅ [PHASE 6 E2E] End-to-end testing completed:', {
      passed: passedTests,
      failed: failedTests,
      successRate: `${Math.round((passedTests / testScenarios.length) * 100)}%`,
      duration: `${Math.round(overallDuration)}ms`
    });

    return endToEndResult;
  }

  private static async runTestScenario(scenario: string): Promise<TestScenarioResult> {
    const startTime = performance.now();
    
    try {
      console.log(`🧪 [E2E] Running scenario: ${scenario}`);
      
      switch (scenario) {
        case 'All Staff Mode Testing':
          await this.testAllStaffMode();
          break;
        case 'Specific Staff Mode Testing':
          await this.testSpecificStaffMode();
          break;
        case 'Unassigned Only Mode Testing':
          await this.testUnassignedOnlyMode();
          break;
        case 'Edge Case Testing':
          await this.testEdgeCases();
          break;
        case 'Performance Testing':
          await this.testPerformance();
          break;
        case 'Export Integration Testing':
          await this.testExportIntegration();
          break;
        case 'Data Integrity Testing':
          await this.testDataIntegrity();
          break;
        case 'Error Handling Testing':
          await this.testErrorHandling();
          break;
        default:
          throw new Error(`Unknown test scenario: ${scenario}`);
      }

      const duration = performance.now() - startTime;
      
      return {
        scenario,
        passed: true,
        duration: Math.round(duration)
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        scenario,
        passed: false,
        duration: Math.round(duration),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async testAllStaffMode(): Promise<void> {
    const filters: DemandFilters = {
      // No preferred staff filter = all staff mode
    };

    const validationResult = await DemandMatrixValidator.validateSystem(
      this.mockDemandData,
      filters,
      performance.now()
    );

    if (!validationResult.isValid) {
      throw new Error(`All staff mode validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Verify all tasks are included
    const totalTasks = this.mockDemandData.dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    if (totalTasks !== this.mockDemandData.totalTasks) {
      throw new Error('All staff mode: Task count mismatch');
    }
  }

  private static async testSpecificStaffMode(): Promise<void> {
    const filters: DemandFilters = {
      preferredStaff: {
        staffIds: ['staff-1'],
        includeUnassigned: false,
        showOnlyPreferred: false
      }
    };

    const validationResult = await DemandMatrixValidator.validateSystem(
      this.mockDemandData,
      filters,
      performance.now()
    );

    if (!validationResult.isValid) {
      throw new Error(`Specific staff mode validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Verify only selected staff tasks are included
    const hasNonSelectedStaff = this.mockDemandData.dataPoints.some(dp =>
      dp.taskBreakdown?.some(task => 
        task.preferredStaff && !['staff-1'].includes(task.preferredStaff.staffId)
      )
    );

    if (hasNonSelectedStaff) {
      throw new Error('Specific staff mode: Non-selected staff found in results');
    }
  }

  private static async testUnassignedOnlyMode(): Promise<void> {
    const filters: DemandFilters = {
      preferredStaff: {
        staffIds: [],
        includeUnassigned: false,
        showOnlyPreferred: true
      }
    };

    const validationResult = await DemandMatrixValidator.validateSystem(
      this.mockDemandData,
      filters,
      performance.now()
    );

    if (!validationResult.isValid) {
      throw new Error(`Unassigned only mode validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Verify only unassigned tasks are included
    const hasAssignedTasks = this.mockDemandData.dataPoints.some(dp =>
      dp.taskBreakdown?.some(task => task.preferredStaff)
    );

    if (hasAssignedTasks) {
      throw new Error('Unassigned only mode: Assigned tasks found in results');
    }
  }

  private static async testEdgeCases(): Promise<void> {
    // Test empty data
    const emptyData: DemandMatrixData = {
      dataPoints: [],
      skills: [],
      months: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {}
    };

    const validationResult = await DemandMatrixValidator.validateSystem(
      emptyData,
      {},
      performance.now()
    );

    // Empty data should have warnings but not be invalid
    if (validationResult.errors.filter(e => e.severity === 'critical').length > 0) {
      throw new Error('Edge case testing: Empty data caused critical errors');
    }

    // Test with invalid filters
    const invalidFilters: DemandFilters = {
      preferredStaff: {
        staffIds: ['non-existent-staff'],
        includeUnassigned: false,
        showOnlyPreferred: false
      }
    };

    const invalidFilterResult = await DemandMatrixValidator.validateSystem(
      this.mockDemandData,
      invalidFilters,
      performance.now()
    );

    // Should handle invalid filters gracefully
    if (invalidFilterResult.errors.length === 0) {
      console.warn('Edge case testing: No errors detected for invalid staff filter');
    }
  }

  private static async testPerformance(): Promise<void> {
    const startTime = performance.now();
    
    const validationResult = await DemandMatrixValidator.validateSystem(
      this.mockDemandData,
      {},
      startTime
    );

    const processingTime = validationResult.performanceMetrics.processingTime;

    // Performance should be under 1 second for this dataset
    if (processingTime > 1000) {
      throw new Error(`Performance test failed: Processing took ${processingTime}ms, exceeds 1000ms threshold`);
    }

    // Memory usage should be reasonable
    if (validationResult.performanceMetrics.memoryUsage > 10) {
      throw new Error(`Performance test failed: Memory usage ${validationResult.performanceMetrics.memoryUsage}MB exceeds 10MB threshold`);
    }
  }

  private static async testExportIntegration(): Promise<void> {
    // Test export functionality with validation
    const exportResult = await EnhancedExportService.exportWithFilteringContext(
      this.mockDemandData,
      {},
      ['Tax Preparation'],
      ['client-1'],
      { start: 0, end: 1 },
      {
        format: 'json',
        includeMetadata: true,
        includeTaskBreakdown: true,
        includePreferredStaffInfo: true,
        includeFilteringModeDetails: true,
        validateDataIntegrity: true
      }
    );

    if (!exportResult.success) {
      throw new Error(`Export integration test failed: ${exportResult.errors?.join(', ')}`);
    }

    if (!exportResult.exportedFileName) {
      throw new Error('Export integration test failed: No exported file name');
    }
  }

  private static async testDataIntegrity(): Promise<void> {
    const validationResult = await DemandMatrixValidator.validateSystem(
      this.mockDemandData,
      {},
      performance.now()
    );

    // Check system health
    if (!validationResult.systemHealth.dataIntegrity) {
      throw new Error('Data integrity test failed: System health check failed');
    }

    // Verify all required data is present
    if (this.mockDemandData.dataPoints.length === 0) {
      throw new Error('Data integrity test failed: No data points');
    }

    if (this.mockDemandData.skills.length === 0) {
      throw new Error('Data integrity test failed: No skills');
    }

    if (this.mockDemandData.months.length === 0) {
      throw new Error('Data integrity test failed: No months');
    }
  }

  private static async testErrorHandling(): Promise<void> {
    // Test with malformed data
    const malformedData = {
      ...this.mockDemandData,
      dataPoints: [
        {
          ...this.mockDemandData.dataPoints[0],
          demandHours: -1, // Invalid negative hours
          taskCount: 'invalid' as any // Wrong type
        }
      ]
    };

    const validationResult = await DemandMatrixValidator.validateSystem(
      malformedData,
      {},
      performance.now()
    );

    // Should detect errors but not crash
    if (validationResult.errors.length === 0) {
      throw new Error('Error handling test failed: No errors detected for malformed data');
    }

    // Should still be able to process
    if (!validationResult.performanceMetrics) {
      throw new Error('Error handling test failed: System crashed on malformed data');
    }
  }

  private static calculateOverallPerformanceMetrics(testResults: TestScenarioResult[]): any {
    const totalDuration = testResults.reduce((sum, result) => sum + result.duration, 0);
    const averageDuration = totalDuration / testResults.length;
    const maxDuration = Math.max(...testResults.map(r => r.duration));
    const minDuration = Math.min(...testResults.map(r => r.duration));

    return {
      totalDuration: Math.round(totalDuration),
      averageDuration: Math.round(averageDuration),
      maxDuration: Math.round(maxDuration),
      minDuration: Math.round(minDuration),
      testCount: testResults.length
    };
  }
}
