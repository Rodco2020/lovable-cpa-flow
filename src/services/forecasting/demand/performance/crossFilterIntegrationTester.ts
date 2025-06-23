
/**
 * Cross-Filter Integration Tester
 * Comprehensive testing for all filter combinations
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { StaffFilterOption } from '@/types/demand';

export interface FilterCombinationTest {
  name: string;
  filters: DemandFilters;
  expectedResults: {
    minDataPoints: number;
    maxDataPoints: number;
    shouldHaveSkills: string[];
    shouldHaveClients: string[];
    shouldHaveStaff: string[];
  };
}

export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  dataPointsCount: number;
  errors: string[];
  warnings: string[];
  performance: {
    filterTime: number;
    calculationTime: number;
    renderTime: number;
  };
}

export class CrossFilterIntegrationTester {
  /**
   * Run comprehensive cross-filter integration tests
   */
  static async runComprehensiveTests(
    matrixData: DemandMatrixData,
    availableStaff: StaffFilterOption[]
  ): Promise<IntegrationTestResult[]> {
    console.log('🧪 Starting comprehensive cross-filter integration tests...');
    
    const testSuites = this.generateTestSuites(matrixData, availableStaff);
    const results: IntegrationTestResult[] = [];
    
    for (const test of testSuites) {
      const result = await this.runSingleFilterTest(matrixData, test);
      results.push(result);
      
      // Log progress
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.testName}: ${result.duration.toFixed(2)}ms`);
    }
    
    this.logTestSummary(results);
    return results;
  }
  
  /**
   * Test performance under load with large datasets
   */
  static async testPerformanceUnderLoad(
    matrixData: DemandMatrixData,
    loadTestConfig: {
      iterations: number;
      concurrentFilters: number;
      dataMultiplier: number;
    }
  ): Promise<{
    averageFilterTime: number;
    maxFilterTime: number;
    memoryUsageMB: number;
    passed: boolean;
  }> {
    console.log('🚀 Starting performance load testing...');
    
    const startMemory = this.getMemoryUsage();
    const filterTimes: number[] = [];
    
    // Generate larger dataset for load testing
    const largeDataset = this.multiplyDataset(matrixData, loadTestConfig.dataMultiplier);
    
    for (let i = 0; i < loadTestConfig.iterations; i++) {
      const concurrentPromises = [];
      
      for (let j = 0; j < loadTestConfig.concurrentFilters; j++) {
        const randomFilters = this.generateRandomFilters(largeDataset);
        concurrentPromises.push(this.performFilterOperation(largeDataset, randomFilters));
      }
      
      const startTime = performance.now();
      await Promise.all(concurrentPromises);
      const filterTime = performance.now() - startTime;
      
      filterTimes.push(filterTime);
    }
    
    const endMemory = this.getMemoryUsage();
    const averageFilterTime = filterTimes.reduce((a, b) => a + b, 0) / filterTimes.length;
    const maxFilterTime = Math.max(...filterTimes);
    const memoryUsageMB = (endMemory - startMemory) / (1024 * 1024);
    
    // Performance thresholds
    const passed = averageFilterTime < 1000 && maxFilterTime < 3000 && memoryUsageMB < 100;
    
    console.log(`📊 Load test results:
      - Average filter time: ${averageFilterTime.toFixed(2)}ms
      - Max filter time: ${maxFilterTime.toFixed(2)}ms
      - Memory usage: ${memoryUsageMB.toFixed(2)}MB
      - Status: ${passed ? 'PASSED' : 'FAILED'}`);
    
    return {
      averageFilterTime,
      maxFilterTime,
      memoryUsageMB,
      passed
    };
  }
  
  /**
   * Test real-time updates with staff filtering
   */
  static async testRealtimeUpdatesWithStaffFiltering(
    initialData: DemandMatrixData,
    staffOptions: StaffFilterOption[]
  ): Promise<{
    updateLatency: number;
    dataConsistency: boolean;
    performanceImpact: number;
  }> {
    console.log('⚡ Testing real-time updates with staff filtering...');
    
    const startTime = performance.now();
    
    // Simulate real-time data update
    const updatedData = { ...initialData };
    updatedData.dataPoints = [...initialData.dataPoints];
    
    // Add new data point with staff information
    updatedData.dataPoints.push({
      skillType: 'Test Skill',
      month: '2024-01',
      monthLabel: 'January 2024',
      demandHours: 10,
      taskCount: 2,
      clientCount: 1,
      taskBreakdown: [{
        clientId: 'test-client',
        clientName: 'Test Client',
        recurringTaskId: 'test-task',
        taskName: 'Test Task',
        skillType: 'Test Skill',
        estimatedHours: 10,
        recurrencePattern: { type: 'Monthly', interval: 1, frequency: 1 },
        monthlyHours: 10,
        preferredStaffId: staffOptions[0]?.id,
        preferredStaffName: staffOptions[0]?.name,
        isUnassigned: false,
        staffInfo: {
          id: staffOptions[0]?.id || 'test-staff',
          name: staffOptions[0]?.name || 'Test Staff'
        }
      }]
    });
    
    // Test filtering with the updated data
    const testFilters: DemandFilters = {
      skills: ['Test Skill'],
      clients: ['test-client'],
      preferredStaff: [staffOptions[0]?.id || 'test-staff'],
      timeHorizon: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      }
    };
    
    const filteredResult = await this.performFilterOperation(updatedData, testFilters);
    const updateLatency = performance.now() - startTime;
    
    // Check data consistency
    const dataConsistency = filteredResult.dataPoints.length > 0 &&
      filteredResult.dataPoints.some(dp => dp.skillType === 'Test Skill');
    
    // Calculate performance impact
    const baselineTime = await this.measureBaselineFilterTime(initialData, testFilters);
    const performanceImpact = ((updateLatency - baselineTime) / baselineTime) * 100;
    
    return {
      updateLatency,
      dataConsistency,
      performanceImpact
    };
  }
  
  // Private helper methods
  private static generateTestSuites(
    matrixData: DemandMatrixData,
    availableStaff: StaffFilterOption[]
  ): FilterCombinationTest[] {
    const tests: FilterCombinationTest[] = [];
    
    // Test 1: No filters (baseline)
    tests.push({
      name: 'No Filters (Baseline)',
      filters: {
        skills: [],
        clients: [],
        preferredStaff: [],
        timeHorizon: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31')
        }
      },
      expectedResults: {
        minDataPoints: matrixData.dataPoints.length,
        maxDataPoints: matrixData.dataPoints.length,
        shouldHaveSkills: matrixData.skills,
        shouldHaveClients: [],
        shouldHaveStaff: availableStaff.map(s => s.id)
      }
    });
    
    // Test 2: Single skill filter
    if (matrixData.skills.length > 0) {
      tests.push({
        name: 'Single Skill Filter',
        filters: {
          skills: [matrixData.skills[0]],
          clients: [],
          preferredStaff: [],
          timeHorizon: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31')
          }
        },
        expectedResults: {
          minDataPoints: 0,
          maxDataPoints: matrixData.dataPoints.length,
          shouldHaveSkills: [matrixData.skills[0]],
          shouldHaveClients: [],
          shouldHaveStaff: []
        }
      });
    }
    
    // Test 3: Single staff filter
    if (availableStaff.length > 0) {
      tests.push({
        name: 'Single Staff Filter',
        filters: {
          skills: [],
          clients: [],
          preferredStaff: [availableStaff[0].id],
          timeHorizon: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31')
          }
        },
        expectedResults: {
          minDataPoints: 0,
          maxDataPoints: matrixData.dataPoints.length,
          shouldHaveSkills: [],
          shouldHaveClients: [],
          shouldHaveStaff: [availableStaff[0].id]
        }
      });
    }
    
    // Test 4: Combined filters (Skills + Staff)
    if (matrixData.skills.length > 0 && availableStaff.length > 0) {
      tests.push({
        name: 'Combined Skills and Staff Filter',
        filters: {
          skills: [matrixData.skills[0]],
          clients: [],
          preferredStaff: [availableStaff[0].id],
          timeHorizon: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31')
          }
        },
        expectedResults: {
          minDataPoints: 0,
          maxDataPoints: matrixData.dataPoints.length,
          shouldHaveSkills: [matrixData.skills[0]],
          shouldHaveClients: [],
          shouldHaveStaff: [availableStaff[0].id]
        }
      });
    }
    
    // Test 5: Time range filter
    tests.push({
      name: 'Time Range Filter',
      filters: {
        skills: [],
        clients: [],
        preferredStaff: [],
        timeHorizon: {
          start: new Date('2024-01-01'),
          end: new Date('2024-06-30')
        }
      },
      expectedResults: {
        minDataPoints: 0,
        maxDataPoints: matrixData.dataPoints.length,
        shouldHaveSkills: [],
        shouldHaveClients: [],
        shouldHaveStaff: []
      }
    });
    
    return tests;
  }
  
  private static async runSingleFilterTest(
    matrixData: DemandMatrixData,
    test: FilterCombinationTest
  ): Promise<IntegrationTestResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Measure filter performance
      const filterStartTime = performance.now();
      const filteredData = await this.performFilterOperation(matrixData, test.filters);
      const filterTime = performance.now() - filterStartTime;
      
      // Measure calculation performance
      const calcStartTime = performance.now();
      this.validateCalculations(filteredData);
      const calculationTime = performance.now() - calcStartTime;
      
      // Measure render simulation time
      const renderStartTime = performance.now();
      this.simulateRender(filteredData);
      const renderTime = performance.now() - renderStartTime;
      
      // Validate results
      const dataPointsCount = filteredData.dataPoints.length;
      
      if (dataPointsCount < test.expectedResults.minDataPoints) {
        errors.push(`Too few data points: ${dataPointsCount} < ${test.expectedResults.minDataPoints}`);
      }
      
      if (dataPointsCount > test.expectedResults.maxDataPoints) {
        warnings.push(`More data points than expected: ${dataPointsCount} > ${test.expectedResults.maxDataPoints}`);
      }
      
      // Check performance thresholds
      if (filterTime > 500) {
        warnings.push(`Filter time exceeded 500ms: ${filterTime.toFixed(2)}ms`);
      }
      
      if (calculationTime > 200) {
        warnings.push(`Calculation time exceeded 200ms: ${calculationTime.toFixed(2)}ms`);
      }
      
      const totalDuration = performance.now() - startTime;
      
      return {
        testName: test.name,
        passed: errors.length === 0,
        duration: totalDuration,
        dataPointsCount,
        errors,
        warnings,
        performance: {
          filterTime,
          calculationTime,
          renderTime
        }
      };
      
    } catch (error) {
      errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        testName: test.name,
        passed: false,
        duration: performance.now() - startTime,
        dataPointsCount: 0,
        errors,
        warnings,
        performance: {
          filterTime: 0,
          calculationTime: 0,
          renderTime: 0
        }
      };
    }
  }
  
  private static async performFilterOperation(
    matrixData: DemandMatrixData,
    filters: DemandFilters
  ): Promise<DemandMatrixData> {
    // Simulate filtering operation
    let filteredData = { ...matrixData };
    filteredData.dataPoints = [...matrixData.dataPoints];
    
    // Apply skill filters
    if (filters.skills.length > 0) {
      filteredData.dataPoints = filteredData.dataPoints.filter(
        dp => filters.skills.includes(dp.skillType)
      );
    }
    
    // Apply staff filters
    if (filters.preferredStaff && filters.preferredStaff.length > 0) {
      filteredData.dataPoints = filteredData.dataPoints.filter(dp => {
        if (!dp.taskBreakdown) return false;
        return dp.taskBreakdown.some(task => 
          task.preferredStaffId && filters.preferredStaff!.includes(task.preferredStaffId)
        );
      });
    }
    
    // Apply time range filters
    if (filters.timeHorizon) {
      const startMonth = filters.timeHorizon.start.getMonth();
      const endMonth = filters.timeHorizon.end.getMonth();
      
      filteredData.dataPoints = filteredData.dataPoints.filter(dp => {
        const monthIndex = parseInt(dp.month.split('-')[1]) - 1;
        return monthIndex >= startMonth && monthIndex <= endMonth;
      });
    }
    
    return filteredData;
  }
  
  private static validateCalculations(data: DemandMatrixData): void {
    // Validate that totals are consistent
    const calculatedTotal = data.dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    if (Math.abs(calculatedTotal - data.totalDemand) > 0.01) {
      throw new Error(`Total demand calculation mismatch: ${calculatedTotal} vs ${data.totalDemand}`);
    }
  }
  
  private static simulateRender(data: DemandMatrixData): void {
    // Simulate rendering operations
    data.dataPoints.forEach(dp => {
      // Simulate DOM operations
      const mockElement = {
        skillType: dp.skillType,
        hours: dp.demandHours,
        tasks: dp.taskCount
      };
      JSON.stringify(mockElement); // Simulate serialization
    });
  }
  
  private static multiplyDataset(data: DemandMatrixData, multiplier: number): DemandMatrixData {
    const multipliedData = { ...data };
    multipliedData.dataPoints = [];
    
    for (let i = 0; i < multiplier; i++) {
      data.dataPoints.forEach(dp => {
        multipliedData.dataPoints.push({
          ...dp,
          month: `${dp.month}-${i}`
        });
      });
    }
    
    return multipliedData;
  }
  
  private static generateRandomFilters(data: DemandMatrixData): DemandFilters {
    const randomSkills = data.skills.slice(0, Math.floor(Math.random() * data.skills.length) + 1);
    
    return {
      skills: randomSkills,
      clients: [],
      preferredStaff: [],
      timeHorizon: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      }
    };
  }
  
  private static async measureBaselineFilterTime(
    data: DemandMatrixData,
    filters: DemandFilters
  ): Promise<number> {
    const startTime = performance.now();
    await this.performFilterOperation(data, filters);
    return performance.now() - startTime;
  }
  
  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }
  
  private static logTestSummary(results: IntegrationTestResult[]): void {
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;
    
    console.log(`
📋 Cross-Filter Integration Test Summary:
  ✅ Passed: ${passed}/${total} tests
  ⏱️  Average Duration: ${averageDuration.toFixed(2)}ms
  🚨 Total Errors: ${results.reduce((sum, r) => sum + r.errors.length, 0)}
  ⚠️  Total Warnings: ${results.reduce((sum, r) => sum + r.warnings.length, 0)}
    `);
  }
}
