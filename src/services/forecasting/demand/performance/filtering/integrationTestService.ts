
/**
 * PHASE 4: Integration Test Service for Real Data Scenarios
 * 
 * Comprehensive testing service that validates the filtering pipeline
 * with real production-like data scenarios and edge cases.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { FilterStrategyFactory } from './filterStrategyFactory';
import { OptimizedPreferredStaffFilterStrategy } from './optimizedPreferredStaffFilterStrategy';
import { normalizeStaffId, isStaffIdInArray, findStaffIdMatches } from '@/utils/staffIdUtils';

interface IntegrationTestScenario {
  name: string;
  description: string;
  data: DemandMatrixData;
  filters: DemandFilters;
  expectedResults: {
    minDataPoints: number;
    maxDataPoints: number;
    shouldHaveSpecificSkills?: string[];
    shouldHaveSpecificClients?: string[];
    shouldHaveSpecificStaff?: string[];
    maxExecutionTime: number;
  };
}

interface IntegrationTestResult {
  scenario: string;
  passed: boolean;
  executionTime: number;
  actualDataPoints: number;
  expectedDataPoints: { min: number; max: number };
  errors: string[];
  warnings: string[];
  performanceMetrics: {
    cacheHits: number;
    cacheMisses: number;
    memoryUsage: number;
    filterEfficiency: number;
  };
}

export class IntegrationTestService {
  private static testScenarios: IntegrationTestScenario[] = [];

  /**
   * PHASE 4: Run comprehensive integration tests with real data scenarios
   */
  static async runIntegrationTests(): Promise<{
    overallResult: 'PASS' | 'FAIL';
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalExecutionTime: number;
    results: IntegrationTestResult[];
    summary: string;
  }> {
    console.log('🚀 [INTEGRATION TEST] PHASE 4: Starting comprehensive integration tests');
    
    const startTime = performance.now();
    
    // Generate test scenarios
    await this.generateTestScenarios();
    
    const results: IntegrationTestResult[] = [];
    let passedTests = 0;
    let failedTests = 0;

    // Run each test scenario
    for (const scenario of this.testScenarios) {
      console.log(`🧪 [INTEGRATION TEST] Running scenario: ${scenario.name}`);
      
      const result = await this.runSingleScenario(scenario);
      results.push(result);
      
      if (result.passed) {
        passedTests++;
      } else {
        failedTests++;
        console.error(`❌ [INTEGRATION TEST] Failed scenario: ${scenario.name}`, result.errors);
      }
    }

    const totalExecutionTime = performance.now() - startTime;
    const overallResult = failedTests === 0 ? 'PASS' : 'FAIL';
    
    const summary = this.generateTestSummary(results, totalExecutionTime);
    
    console.log(`🎯 [INTEGRATION TEST] PHASE 4 COMPLETE: ${overallResult}`, {
      totalTests: this.testScenarios.length,
      passedTests,
      failedTests,
      totalExecutionTime: `${totalExecutionTime.toFixed(2)}ms`,
      overallResult
    });

    return {
      overallResult,
      totalTests: this.testScenarios.length,
      passedTests,
      failedTests,
      totalExecutionTime,
      results,
      summary
    };
  }

  /**
   * Generate comprehensive test scenarios with real data patterns
   */
  private static async generateTestScenarios(): Promise<void> {
    this.testScenarios = [
      // Scenario 1: Large dataset with mixed staff IDs
      {
        name: 'Large Dataset Mixed Staff IDs',
        description: 'Test performance with 1000+ data points and mixed staff ID formats',
        data: this.createLargeDataset(1000),
        filters: {
          skills: [],
          clients: [],
          preferredStaff: ['staff-1', 'STAFF-2', 'staff_3', 'Staff-4'], // Mixed formats
          timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
        },
        expectedResults: {
          minDataPoints: 50,
          maxDataPoints: 200,
          shouldHaveSpecificStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4'],
          maxExecutionTime: 500
        }
      },
      
      // Scenario 2: Empty preferred staff filter (should show all data)
      {
        name: 'Empty Preferred Staff Filter',
        description: 'Test that empty preferred staff array shows all data',
        data: this.createMediumDataset(100),
        filters: {
          skills: [],
          clients: [],
          preferredStaff: [], // Empty = show all
          timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
        },
        expectedResults: {
          minDataPoints: 100,
          maxDataPoints: 100,
          maxExecutionTime: 100
        }
      },
      
      // Scenario 3: Non-existent staff IDs
      {
        name: 'Non-existent Staff IDs',
        description: 'Test filtering with staff IDs that dont exist in data',
        data: this.createMediumDataset(100),
        filters: {
          skills: [],
          clients: [],
          preferredStaff: ['nonexistent-1', 'fake-staff-2', 'missing-3'],
          timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
        },
        expectedResults: {
          minDataPoints: 0,
          maxDataPoints: 0,
          maxExecutionTime: 50
        }
      },
      
      // Scenario 4: UUID vs String staff IDs
      {
        name: 'UUID vs String Staff IDs',
        description: 'Test mixed UUID and string staff ID formats',
        data: this.createDatasetWithUUIDs(200),
        filters: {
          skills: [],
          clients: [],
          preferredStaff: [
            '12345678-1234-1234-1234-123456789012', // UUID format
            'staff-string-id', // String format
            'MIXED-Case-ID' // Mixed case
          ],
          timeHorizon: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
        },
        expectedResults: {
          minDataPoints: 10,
          maxDataPoints: 50,
          maxExecutionTime: 200
        }
      },
      
      // Scenario 5: Combined filters stress test
      {
        name: 'Combined Filters Stress Test',
        description: 'Test all filter types combined with large dataset',
        data: this.createLargeDataset(2000),
        filters: {
          skills: ['Tax Preparation', 'Audit'],
          clients: ['client-1', 'client-2'],
          preferredStaff: ['staff-1', 'staff-2', 'staff-3'],
          timeHorizon: { start: new Date('2024-06-01'), end: new Date('2024-08-31') }
        },
        expectedResults: {
          minDataPoints: 5,
          maxDataPoints: 100,
          shouldHaveSpecificSkills: ['Tax Preparation', 'Audit'],
          maxExecutionTime: 800
        }
      }
    ];
  }

  /**
   * Run a single test scenario
   */
  private static async runSingleScenario(scenario: IntegrationTestScenario): Promise<IntegrationTestResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const scenarioStartTime = performance.now();
    
    try {
      // Clear caches before test
      OptimizedPreferredStaffFilterStrategy.clearOptimizationCache();
      FilterStrategyFactory.clearPerformanceData();
      
      const initialMemory = this.getMemoryUsage();
      
      // Apply filters
      const filteredData = FilterStrategyFactory.applyFilters(scenario.data, scenario.filters);
      
      const executionTime = performance.now() - scenarioStartTime;
      const finalMemory = this.getMemoryUsage();
      const memoryUsage = finalMemory - initialMemory;
      
      // Validate results
      const validationResult = this.validateScenarioResults(scenario, filteredData, executionTime);
      
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors);
      }
      
      warnings.push(...validationResult.warnings);
      
      // Get performance metrics
      const performanceMetrics = this.getPerformanceMetrics(scenario.name);
      
      return {
        scenario: scenario.name,
        passed: errors.length === 0,
        executionTime,
        actualDataPoints: filteredData.dataPoints.length,
        expectedDataPoints: {
          min: scenario.expectedResults.minDataPoints,
          max: scenario.expectedResults.maxDataPoints
        },
        errors,
        warnings,
        performanceMetrics: {
          cacheHits: performanceMetrics.cacheHits,
          cacheMisses: performanceMetrics.cacheMisses,
          memoryUsage,
          filterEfficiency: scenario.data.dataPoints.length > 0 
            ? filteredData.dataPoints.length / scenario.data.dataPoints.length 
            : 0
        }
      };
      
    } catch (error) {
      const executionTime = performance.now() - scenarioStartTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        scenario: scenario.name,
        passed: false,
        executionTime,
        actualDataPoints: 0,
        expectedDataPoints: {
          min: scenario.expectedResults.minDataPoints,
          max: scenario.expectedResults.maxDataPoints
        },
        errors: [`Scenario execution failed: ${errorMessage}`],
        warnings: [],
        performanceMetrics: {
          cacheHits: 0,
          cacheMisses: 0,
          memoryUsage: 0,
          filterEfficiency: 0
        }
      };
    }
  }

  /**
   * Validate scenario results against expected outcomes
   */
  private static validateScenarioResults(
    scenario: IntegrationTestScenario,
    filteredData: DemandMatrixData,
    executionTime: number
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check data point count
    if (filteredData.dataPoints.length < scenario.expectedResults.minDataPoints) {
      errors.push(`Too few data points: ${filteredData.dataPoints.length} < ${scenario.expectedResults.minDataPoints}`);
    }
    
    if (filteredData.dataPoints.length > scenario.expectedResults.maxDataPoints) {
      errors.push(`Too many data points: ${filteredData.dataPoints.length} > ${scenario.expectedResults.maxDataPoints}`);
    }
    
    // Check execution time
    if (executionTime > scenario.expectedResults.maxExecutionTime) {
      errors.push(`Execution too slow: ${executionTime.toFixed(2)}ms > ${scenario.expectedResults.maxExecutionTime}ms`);
    }
    
    // Check specific skills if expected
    if (scenario.expectedResults.shouldHaveSpecificSkills) {
      const actualSkills = new Set(filteredData.dataPoints.map(dp => dp.skillType));
      for (const expectedSkill of scenario.expectedResults.shouldHaveSpecificSkills) {
        if (!actualSkills.has(expectedSkill)) {
          warnings.push(`Expected skill not found: ${expectedSkill}`);
        }
      }
    }
    
    // Check staff ID filtering accuracy
    if (scenario.filters.preferredStaff.length > 0) {
      const normalizedFilterStaff = scenario.filters.preferredStaff
        .map(id => normalizeStaffId(id))
        .filter(Boolean) as string[];
      
      // Verify all filtered data points have matching preferred staff
      for (const dataPoint of filteredData.dataPoints) {
        if (dataPoint.taskBreakdown) {
          const hasMatchingStaff = dataPoint.taskBreakdown.some(task => {
            const normalizedTaskStaffId = normalizeStaffId(task.preferredStaffId);
            return normalizedTaskStaffId && isStaffIdInArray(normalizedTaskStaffId, normalizedFilterStaff);
          });
          
          if (!hasMatchingStaff) {
            errors.push(`Data point without matching preferred staff found: ${dataPoint.skillType}/${dataPoint.month}`);
          }
        }
      }
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Create large test dataset
   */
  private static createLargeDataset(size: number): DemandMatrixData {
    const dataPoints = Array.from({ length: size }, (_, i) => ({
      skillType: `Skill ${i % 10}`,
      month: `2024-${((i % 12) + 1).toString().padStart(2, '0')}`,
      monthLabel: `Month ${(i % 12) + 1}`,
      demandHours: Math.random() * 100,
      taskCount: Math.floor(Math.random() * 10) + 1,
      clientCount: Math.floor(Math.random() * 5) + 1,
      taskBreakdown: [{
        clientId: `client-${i % 20}`,
        clientName: `Client ${i % 20}`,
        recurringTaskId: `task-${i}`,
        taskName: `Task ${i}`,
        skillType: `Skill ${i % 10}`,
        estimatedHours: Math.random() * 20,
        monthlyHours: Math.random() * 20,
        recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
        preferredStaffId: `staff-${(i % 10) + 1}`, // Consistent staff IDs
        preferredStaffName: `Staff ${(i % 10) + 1}`
      }]
    }));

    return {
      months: Array.from({ length: 12 }, (_, i) => ({
        key: `2024-${(i + 1).toString().padStart(2, '0')}`,
        label: `Month ${i + 1}`
      })),
      skills: Array.from({ length: 10 }, (_, i) => `Skill ${i}`),
      dataPoints,
      totalDemand: dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
      totalTasks: dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0),
      totalClients: new Set(dataPoints.flatMap(dp => dp.taskBreakdown?.map(tb => tb.clientId) || [])).size,
      skillSummary: {}
    };
  }

  /**
   * Create medium test dataset
   */
  private static createMediumDataset(size: number): DemandMatrixData {
    return this.createLargeDataset(size);
  }

  /**
   * Create dataset with UUID staff IDs
   */
  private static createDatasetWithUUIDs(size: number): DemandMatrixData {
    const baseData = this.createLargeDataset(size);
    
    // Replace some staff IDs with UUIDs
    baseData.dataPoints.forEach((dp, i) => {
      if (dp.taskBreakdown) {
        dp.taskBreakdown.forEach(tb => {
          if (i % 3 === 0) {
            tb.preferredStaffId = `12345678-1234-1234-1234-12345678901${i % 10}`;
          } else if (i % 3 === 1) {
            tb.preferredStaffId = `staff-string-id-${i}`;
          } else {
            tb.preferredStaffId = `MIXED-Case-ID-${i}`;
          }
        });
      }
    });
    
    return baseData;
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      return (window.performance as any).memory?.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Get performance metrics for a scenario
   */
  private static getPerformanceMetrics(scenarioName: string): {
    cacheHits: number;
    cacheMisses: number;
  } {
    const dashboard = FilterStrategyFactory.getPerformanceDashboard();
    // Return mock metrics for now - in real implementation, this would extract actual metrics
    return {
      cacheHits: Math.floor(Math.random() * 10),
      cacheMisses: Math.floor(Math.random() * 5)
    };
  }

  /**
   * Generate comprehensive test summary
   */
  private static generateTestSummary(results: IntegrationTestResult[], totalTime: number): string {
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;
    const averageExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const totalDataPointsProcessed = results.reduce((sum, r) => sum + r.actualDataPoints, 0);
    
    return `
PHASE 4 Integration Test Summary:
====================================
Total Tests: ${results.length}
Passed: ${passedTests}
Failed: ${failedTests}
Success Rate: ${((passedTests / results.length) * 100).toFixed(1)}%

Performance Metrics:
- Total Execution Time: ${totalTime.toFixed(2)}ms
- Average Test Time: ${averageExecutionTime.toFixed(2)}ms
- Total Data Points Processed: ${totalDataPointsProcessed}
- Average Filter Efficiency: ${(results.reduce((sum, r) => sum + r.performanceMetrics.filterEfficiency, 0) / results.length * 100).toFixed(1)}%

Failed Tests:
${results.filter(r => !r.passed).map(r => `- ${r.scenario}: ${r.errors.join(', ')}`).join('\n')}

Performance Analysis:
- Fastest Test: ${Math.min(...results.map(r => r.executionTime)).toFixed(2)}ms
- Slowest Test: ${Math.max(...results.map(r => r.executionTime)).toFixed(2)}ms
- Memory Efficiency: ${results.every(r => r.performanceMetrics.memoryUsage < 10 * 1024 * 1024) ? 'GOOD' : 'NEEDS IMPROVEMENT'}

Overall Status: ${failedTests === 0 ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}
    `.trim();
  }
}
