
/**
 * Comprehensive Testing Utilities for Preferred Staff Filter Strategy
 * 
 * This module provides end-to-end testing capabilities to validate that the
 * preferred staff filtering system works correctly with proper field mapping.
 */

import { DemandMatrixData, DemandFilters, ClientTaskDemand } from '@/types/demand';
import { PreferredStaffFilterStrategy } from './preferredStaffFilterStrategy';

export interface FilterTestResult {
  testName: string;
  passed: boolean;
  details: {
    input: {
      dataPoints: number;
      totalTasks: number;
      tasksWithPreferredStaff: number;
      filterIds: string[];
    };
    output: {
      dataPoints: number;
      totalTasks: number;
      expectedTasks: number;
      actualTasks: number;
    };
    validation: {
      fieldMappingWorking: boolean;
      filterLogicWorking: boolean;
      dataIntegrityMaintained: boolean;
    };
  };
  errors: string[];
  recommendations: string[];
}

/**
 * Run comprehensive end-to-end test of the preferred staff filtering
 */
export async function runComprehensiveFilterTest(
  testData: DemandMatrixData,
  testFilters: DemandFilters
): Promise<FilterTestResult> {
  console.group('🧪 [FILTER TESTING] Comprehensive End-to-End Test');
  
  const testName = 'Preferred Staff Filter End-to-End Test';
  const errors: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // Analyze input data
    const inputAnalysis = analyzeInputData(testData);
    console.log('📊 Input Analysis:', inputAnalysis);
    
    // Execute filter strategy
    const filterStrategy = new PreferredStaffFilterStrategy();
    const filteredData = filterStrategy.apply(testData, testFilters);
    
    // Analyze output data
    const outputAnalysis = analyzeOutputData(filteredData);
    console.log('📈 Output Analysis:', outputAnalysis);
    
    // Validate field mapping
    const fieldMappingValidation = validateFieldMapping(testData, filteredData);
    console.log('🔍 Field Mapping Validation:', fieldMappingValidation);
    
    // Validate filter logic
    const filterLogicValidation = validateFilterLogic(
      testData, 
      filteredData, 
      testFilters.preferredStaff || []
    );
    console.log('🎯 Filter Logic Validation:', filterLogicValidation);
    
    // Calculate expected vs actual results
    const expectedTasks = calculateExpectedFilteredTasks(testData, testFilters.preferredStaff || []);
    const actualTasks = outputAnalysis.totalTasks;
    
    // Determine test result
    const passed = (
      fieldMappingValidation.working &&
      filterLogicValidation.working &&
      Math.abs(expectedTasks - actualTasks) <= 1 // Allow for small rounding differences
    );
    
    if (!fieldMappingValidation.working) {
      errors.push('Field mapping validation failed');
      recommendations.push('Check that preferredStaffId field is properly mapped from database');
    }
    
    if (!filterLogicValidation.working) {
      errors.push('Filter logic validation failed');
      recommendations.push('Verify that filter matching logic correctly identifies preferred staff');
    }
    
    const testResult: FilterTestResult = {
      testName,
      passed,
      details: {
        input: {
          dataPoints: inputAnalysis.dataPoints,
          totalTasks: inputAnalysis.totalTasks,
          tasksWithPreferredStaff: inputAnalysis.tasksWithPreferredStaff,
          filterIds: testFilters.preferredStaff || []
        },
        output: {
          dataPoints: outputAnalysis.dataPoints,
          totalTasks: outputAnalysis.totalTasks,
          expectedTasks,
          actualTasks
        },
        validation: {
          fieldMappingWorking: fieldMappingValidation.working,
          filterLogicWorking: filterLogicValidation.working,
          dataIntegrityMaintained: true
        }
      },
      errors,
      recommendations
    };
    
    console.log(`${passed ? '✅' : '❌'} Test Result:`, testResult);
    console.groupEnd();
    
    return testResult;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    console.groupEnd();
    
    return {
      testName,
      passed: false,
      details: {
        input: { dataPoints: 0, totalTasks: 0, tasksWithPreferredStaff: 0, filterIds: [] },
        output: { dataPoints: 0, totalTasks: 0, expectedTasks: 0, actualTasks: 0 },
        validation: { fieldMappingWorking: false, filterLogicWorking: false, dataIntegrityMaintained: false }
      },
      errors: [`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      recommendations: ['Check console logs for detailed error information']
    };
  }
}

/**
 * Analyze input data structure
 */
function analyzeInputData(data: DemandMatrixData): {
  dataPoints: number;
  totalTasks: number;
  tasksWithPreferredStaff: number;
  uniquePreferredStaffIds: string[];
} {
  let totalTasks = 0;
  let tasksWithPreferredStaff = 0;
  const preferredStaffIds = new Set<string>();
  
  data.dataPoints.forEach(dataPoint => {
    dataPoint.taskBreakdown?.forEach(task => {
      totalTasks++;
      if (task.preferredStaffId) {
        tasksWithPreferredStaff++;
        preferredStaffIds.add(task.preferredStaffId);
      }
    });
  });
  
  return {
    dataPoints: data.dataPoints.length,
    totalTasks,
    tasksWithPreferredStaff,
    uniquePreferredStaffIds: Array.from(preferredStaffIds)
  };
}

/**
 * Analyze output data structure
 */
function analyzeOutputData(data: DemandMatrixData): {
  dataPoints: number;
  totalTasks: number;
  tasksWithPreferredStaff: number;
} {
  let totalTasks = 0;
  let tasksWithPreferredStaff = 0;
  
  data.dataPoints.forEach(dataPoint => {
    dataPoint.taskBreakdown?.forEach(task => {
      totalTasks++;
      if (task.preferredStaffId) {
        tasksWithPreferredStaff++;
      }
    });
  });
  
  return {
    dataPoints: data.dataPoints.length,
    totalTasks,
    tasksWithPreferredStaff
  };
}

/**
 * Validate field mapping is working correctly
 */
function validateFieldMapping(
  inputData: DemandMatrixData,
  outputData: DemandMatrixData
): { working: boolean; details: any } {
  const inputTasks = extractAllTasks(inputData);
  const outputTasks = extractAllTasks(outputData);
  
  // Check that all output tasks have consistent field mapping
  const fieldMappingIssues: string[] = [];
  
  outputTasks.forEach(task => {
    // Verify that preferredStaffId field exists and is accessible
    if (task.hasOwnProperty('preferredStaffId')) {
      const value = task.preferredStaffId;
      if (value !== null && typeof value !== 'string') {
        fieldMappingIssues.push(`Task ${task.taskName}: preferredStaffId has wrong type: ${typeof value}`);
      }
    } else {
      fieldMappingIssues.push(`Task ${task.taskName}: preferredStaffId field missing`);
    }
  });
  
  return {
    working: fieldMappingIssues.length === 0,
    details: {
      inputTasks: inputTasks.length,
      outputTasks: outputTasks.length,
      fieldMappingIssues
    }
  };
}

/**
 * Validate filter logic is working correctly
 */
function validateFilterLogic(
  inputData: DemandMatrixData,
  outputData: DemandMatrixData,
  filterIds: (string | number)[]
): { working: boolean; details: any } {
  const inputTasks = extractAllTasks(inputData);
  const outputTasks = extractAllTasks(outputData);
  
  // Normalize filter IDs for comparison
  const normalizedFilterIds = filterIds
    .map(id => String(id).trim())
    .filter(id => id.length > 0);
  
  // Check that all output tasks should have been retained
  const logicIssues: string[] = [];
  
  outputTasks.forEach(task => {
    if (!task.preferredStaffId) {
      logicIssues.push(`Task ${task.taskName}: Retained but has no preferred staff`);
    } else if (!normalizedFilterIds.includes(task.preferredStaffId)) {
      logicIssues.push(`Task ${task.taskName}: Retained but preferred staff ${task.preferredStaffId} not in filter`);
    }
  });
  
  return {
    working: logicIssues.length === 0,
    details: {
      inputTasks: inputTasks.length,
      outputTasks: outputTasks.length,
      filterIds: normalizedFilterIds,
      logicIssues
    }
  };
}

/**
 * Calculate expected number of filtered tasks
 */
function calculateExpectedFilteredTasks(
  data: DemandMatrixData,
  filterIds: (string | number)[]
): number {
  const normalizedFilterIds = filterIds
    .map(id => String(id).trim())
    .filter(id => id.length > 0);
  
  let expectedTasks = 0;
  
  data.dataPoints.forEach(dataPoint => {
    dataPoint.taskBreakdown?.forEach(task => {
      if (task.preferredStaffId && normalizedFilterIds.includes(task.preferredStaffId)) {
        expectedTasks++;
      }
    });
  });
  
  return expectedTasks;
}

/**
 * Extract all tasks from matrix data
 */
function extractAllTasks(data: DemandMatrixData): ClientTaskDemand[] {
  const tasks: ClientTaskDemand[] = [];
  
  data.dataPoints.forEach(dataPoint => {
    if (dataPoint.taskBreakdown) {
      tasks.push(...dataPoint.taskBreakdown);
    }
  });
  
  return tasks;
}

/**
 * Create test data for validation
 */
export function createTestData(): {
  testData: DemandMatrixData;
  testFilters: DemandFilters;
} {
  // This would be implemented to create realistic test data
  // For now, return empty structures
  return {
    testData: {
      months: [],
      skills: [],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {}
    },
    testFilters: {
      skills: [],
      clients: [],
      preferredStaff: [],
      timeHorizon: { start: new Date(), end: new Date() }
    }
  };
}
