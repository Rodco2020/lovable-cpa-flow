
/**
 * Integration Test Service for Preferred Staff Filtering
 * 
 * This service provides comprehensive end-to-end testing capabilities
 * for the preferred staff filtering system to ensure proper integration
 * between all components.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { PreferredStaffFilterStrategy } from './preferredStaffFilterStrategy';
import { normalizeStaffId, isStaffIdInArray, findStaffIdMatches } from '@/utils/staffIdUtils';
import { runComprehensiveFilterTest, FilterTestResult } from './preferredStaffFilterStrategy/testingUtils';

export interface IntegrationTestResult {
  testPassed: boolean;
  testName: string;
  executionTime: number;
  issues: string[];
  recommendations: string[];
  detailedResults: any;
}

/**
 * Create a complete DemandFilters object with defaults
 */
function createCompleteFilters(overrides: Partial<DemandFilters> = {}): DemandFilters {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 0, 1); // Start of current year
  const endDate = new Date(currentDate.getFullYear(), 11, 31); // End of current year
  
  return {
    skills: [],
    clients: [],
    preferredStaff: [],
    timeHorizon: {
      start: startDate,
      end: endDate
    },
    ...overrides
  };
}

/**
 * Run comprehensive integration test for preferred staff filtering
 */
export function runIntegrationTest(
  testName: string,
  data: DemandMatrixData,
  filters: DemandFilters
): IntegrationTestResult {
  console.group(`🧪 [INTEGRATION TEST] ${testName}`);
  
  const startTime = performance.now();
  
  try {
    // Run the comprehensive filter test
    const testResult = runComprehensiveFilterTest(data, filters);
    
    // Apply the actual filter strategy
    const filterStrategy = new PreferredStaffFilterStrategy();
    const filteredData = filterStrategy.apply(data, filters);
    
    // Additional integration validations
    const additionalChecks = performIntegrationValidation(data, filters, filteredData);
    
    const executionTime = performance.now() - startTime;
    
    const result: IntegrationTestResult = {
      testPassed: testResult.testPassed && additionalChecks.passed,
      testName,
      executionTime,
      issues: [...testResult.issues, ...additionalChecks.issues],
      recommendations: [...testResult.recommendations, ...additionalChecks.recommendations],
      detailedResults: {
        comprehensiveTest: testResult,
        integrationChecks: additionalChecks,
        filteredDataMetrics: {
          originalDataPoints: data.dataPoints.length,
          filteredDataPoints: filteredData.dataPoints.length,
          filterEfficiency: ((data.dataPoints.length - filteredData.dataPoints.length) / data.dataPoints.length * 100).toFixed(1) + '%'
        }
      }
    };
    
    console.log(`✅ [INTEGRATION TEST] ${testName} completed:`, {
      passed: result.testPassed,
      executionTime: `${executionTime.toFixed(2)}ms`,
      issuesFound: result.issues.length
    });
    
    console.groupEnd();
    return result;
    
  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    console.error(`❌ [INTEGRATION TEST] ${testName} failed:`, error);
    console.groupEnd();
    
    return {
      testPassed: false,
      testName,
      executionTime,
      issues: [`Test execution failed: ${error}`],
      recommendations: ['Check test setup and data integrity'],
      detailedResults: { error: error?.toString() }
    };
  }
}

/**
 * Perform additional integration validation checks
 */
function performIntegrationValidation(
  originalData: DemandMatrixData,
  filters: DemandFilters,
  filteredData: DemandMatrixData
): {
  passed: boolean;
  issues: string[];
  recommendations: string[];
  checks: any;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  const checks: any = {};
  
  // Check 1: Data integrity
  checks.dataIntegrity = {
    originalValid: originalData.dataPoints.length > 0,
    filteredValid: Array.isArray(filteredData.dataPoints),
    structurePreserved: filteredData.dataPoints.every(dp => 
      dp.hasOwnProperty('taskBreakdown') && Array.isArray(dp.taskBreakdown)
    )
  };
  
  if (!checks.dataIntegrity.structurePreserved) {
    issues.push('Filtered data structure is not preserved correctly');
    recommendations.push('Verify filter strategy preserves data point structure');
  }
  
  // Check 2: Filter application consistency
  if (filters.preferredStaff && filters.preferredStaff.length > 0) {
    const normalizedFilters = filters.preferredStaff
      .map(id => normalizeStaffId(id))
      .filter(Boolean) as string[];
    
    let matchingTasksFound = 0;
    filteredData.dataPoints.forEach(dp => {
      if (dp.taskBreakdown) {
        dp.taskBreakdown.forEach(task => {
          if (task.preferredStaffId && isStaffIdInArray(task.preferredStaffId, normalizedFilters)) {
            matchingTasksFound++;
          }
        });
      }
    });
    
    checks.filterConsistency = {
      normalizedFilters,
      matchingTasksInResults: matchingTasksFound,
      hasMatches: matchingTasksFound > 0
    };
    
    if (matchingTasksFound === 0 && filteredData.dataPoints.length > 0) {
      issues.push('Filtered data contains tasks but none match the preferred staff filter');
      recommendations.push('Check if filter logic is correctly matching staff IDs');
    }
  }
  
  return {
    passed: issues.length === 0,
    issues,
    recommendations,
    checks
  };
}

/**
 * Run a battery of integration tests
 */
export function runIntegrationTestSuite(
  data: DemandMatrixData
): IntegrationTestResult[] {
  const testSuite: IntegrationTestResult[] = [];
  
  // Test 1: No filters (should return all data)
  testSuite.push(runIntegrationTest(
    'No Filters Test',
    data,
    createCompleteFilters({ preferredStaff: [] })
  ));
  
  // Test 2: Single staff filter
  if (data.dataPoints.length > 0 && data.dataPoints[0].taskBreakdown?.length > 0) {
    const firstTaskStaffId = data.dataPoints[0].taskBreakdown[0].preferredStaffId;
    if (firstTaskStaffId) {
      testSuite.push(runIntegrationTest(
        'Single Staff Filter Test',
        data,
        createCompleteFilters({ preferredStaff: [firstTaskStaffId] })
      ));
    }
  }
  
  // Test 3: Multiple staff filter
  const uniqueStaffIds = new Set<string>();
  data.dataPoints.forEach(dp => {
    dp.taskBreakdown?.forEach(task => {
      if (task.preferredStaffId) {
        uniqueStaffIds.add(task.preferredStaffId);
      }
    });
  });
  
  if (uniqueStaffIds.size >= 2) {
    const multipleStaffIds = Array.from(uniqueStaffIds).slice(0, 2);
    testSuite.push(runIntegrationTest(
      'Multiple Staff Filter Test',
      data,
      createCompleteFilters({ preferredStaff: multipleStaffIds })
    ));
  }
  
  // Test 4: Invalid staff filter
  testSuite.push(runIntegrationTest(
    'Invalid Staff Filter Test',
    data,
    createCompleteFilters({ preferredStaff: ['non-existent-staff-id'] })
  ));
  
  return testSuite;
}

/**
 * Integration Test Service class for external consumption
 */
export class IntegrationTestService {
  /**
   * Run comprehensive integration tests
   */
  static async runIntegrationTests(): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallResult: 'PASS' | 'FAIL';
    totalExecutionTime: number;
    testResults: IntegrationTestResult[];
  }> {
    console.log('🚀 [INTEGRATION TEST SERVICE] Starting comprehensive integration tests');
    
    const startTime = performance.now();
    
    // For now, create mock data for testing
    // In a real implementation, this would fetch actual matrix data
    const mockData: DemandMatrixData = {
      months: [{ key: '2024-01', label: 'January 2024' }],
      skills: ['Junior', 'Senior', 'CPA'],
      dataPoints: [
        {
          skillType: 'Junior',
          month: '2024-01',
          monthLabel: 'January 2024',
          demandHours: 40,
          taskCount: 5,
          clientCount: 2,
          taskBreakdown: [
            {
              clientId: 'client-1',
              clientName: 'Test Client 1',
              recurringTaskId: 'task-1',
              taskName: 'Test Task 1',
              skillType: 'Junior',
              estimatedHours: 20,
              recurrencePattern: { type: 'monthly', interval: 1, frequency: 1 },
              monthlyHours: 20,
              preferredStaffId: 'staff-1',
              preferredStaffName: 'John Doe'
            }
          ]
        }
      ],
      totalDemand: 40,
      totalTasks: 5,
      totalClients: 2,
      skillSummary: {
        'Junior': { totalHours: 40, taskCount: 5, clientCount: 2 }
      }
    };
    
    const testResults = runIntegrationTestSuite(mockData);
    const totalExecutionTime = performance.now() - startTime;
    
    const passedTests = testResults.filter(t => t.testPassed).length;
    const failedTests = testResults.length - passedTests;
    
    const result = {
      totalTests: testResults.length,
      passedTests,
      failedTests,
      overallResult: failedTests === 0 ? 'PASS' as const : 'FAIL' as const,
      totalExecutionTime,
      testResults
    };
    
    console.log('✅ [INTEGRATION TEST SERVICE] Integration tests completed:', {
      totalTests: result.totalTests,
      passed: result.passedTests,
      failed: result.failedTests,
      overallResult: result.overallResult,
      executionTime: `${totalExecutionTime.toFixed(2)}ms`
    });
    
    return result;
  }
}

// Export the service functions for backward compatibility
export { runIntegrationTest, runIntegrationTestSuite };
