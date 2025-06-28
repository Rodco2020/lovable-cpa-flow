
/**
 * ENHANCED Testing utilities for Preferred Staff Filter Strategy
 * 
 * This module provides comprehensive testing and validation capabilities
 * for debugging the preferred staff filtering issue.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { normalizeStaffId } from '@/utils/staffIdUtils';

export interface FilterTestResult {
  testPassed: boolean;
  issues: string[];
  recommendations: string[];
  detailedAnalysis: {
    inputAnalysis: any;
    dataAnalysis: any;
    filteringResults: any;
    comparisonResults: any;
  };
}

/**
 * ENHANCED: Run comprehensive filter test with detailed debugging
 */
export function runComprehensiveFilterTest(
  data: DemandMatrixData,
  filters: DemandFilters
): FilterTestResult {
  console.group('🧪 [COMPREHENSIVE FILTER TEST] Starting detailed analysis');
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // STEP 1: Input Analysis
  console.log('📋 STEP 1: Input Analysis');
  const inputAnalysis = analyzeFilterInputs(filters);
  logInputAnalysis(inputAnalysis);
  
  // STEP 2: Data Structure Analysis
  console.log('📊 STEP 2: Data Structure Analysis');
  const dataAnalysis = analyzeDataStructure(data);
  logDataAnalysis(dataAnalysis);
  
  // STEP 3: Field Mapping Analysis
  console.log('🔗 STEP 3: Field Mapping Analysis');
  const fieldMappingAnalysis = analyzeFieldMapping(data);
  logFieldMappingAnalysis(fieldMappingAnalysis);
  
  // STEP 4: Filter Comparison Analysis
  console.log('⚖️ STEP 4: Filter Comparison Analysis');
  const comparisonResults = analyzeFilterComparison(data, filters);
  logComparisonResults(comparisonResults);
  
  // STEP 5: Generate Issues and Recommendations
  if (inputAnalysis.invalidStaffIds.length > 0) {
    issues.push(`Invalid staff IDs found: ${inputAnalysis.invalidStaffIds.join(', ')}`);
    recommendations.push('Verify staff ID format and normalization logic');
  }
  
  if (dataAnalysis.tasksWithoutPreferredStaff > dataAnalysis.tasksWithPreferredStaff * 2) {
    issues.push('Most tasks lack preferred staff assignments');
    recommendations.push('Ensure tasks are properly assigned to preferred staff');
  }
  
  if (comparisonResults.noMatches && inputAnalysis.validStaffIds.length > 0) {
    issues.push('No matching staff IDs found despite valid input');
    recommendations.push('Check for data type mismatches or normalization issues');
  }
  
  const testPassed = issues.length === 0;
  
  console.log('🎯 TEST SUMMARY:', {
    testPassed,
    issuesFound: issues.length,
    issues,
    recommendations
  });
  
  console.groupEnd();
  
  return {
    testPassed,
    issues,
    recommendations,
    detailedAnalysis: {
      inputAnalysis,
      dataAnalysis,
      filteringResults: comparisonResults,
      comparisonResults
    }
  };
}

/**
 * Analyze filter inputs in detail
 */
function analyzeFilterInputs(filters: DemandFilters) {
  const preferredStaff = filters.preferredStaff || [];
  const validStaffIds: string[] = [];
  const invalidStaffIds: any[] = [];
  
  console.log('🔍 Analyzing filter inputs:', {
    originalArray: preferredStaff,
    arrayLength: preferredStaff.length,
    arrayType: Array.isArray(preferredStaff) ? 'Array' : typeof preferredStaff
  });
  
  preferredStaff.forEach((staffId, index) => {
    console.log(`📋 Analyzing staff ID ${index}:`, {
      originalValue: staffId,
      type: typeof staffId,
      isNull: staffId === null,
      isUndefined: staffId === undefined,
      stringValue: String(staffId)
    });
    
    const normalized = normalizeStaffId(staffId);
    if (normalized) {
      validStaffIds.push(normalized);
    } else {
      invalidStaffIds.push(staffId);
    }
  });
  
  return {
    originalStaffIds: preferredStaff,
    validStaffIds,
    invalidStaffIds,
    normalizationSuccess: validStaffIds.length > 0
  };
}

/**
 * Analyze data structure for preferred staff information
 */
function analyzeDataStructure(data: DemandMatrixData) {
  let totalTasks = 0;
  let tasksWithPreferredStaff = 0;
  let tasksWithoutPreferredStaff = 0;
  const uniquePreferredStaffIds = new Set<string>();
  const preferredStaffNames = new Set<string>();
  const sampleTasks: any[] = [];
  
  data.dataPoints.forEach((dataPoint, dpIndex) => {
    if (dataPoint.taskBreakdown) {
      dataPoint.taskBreakdown.forEach((task, taskIndex) => {
        totalTasks++;
        
        // Log first few tasks for detailed analysis
        if (sampleTasks.length < 5) {
          console.log(`📋 Sample Task ${sampleTasks.length + 1}:`, {
            taskName: task.taskName,
            clientName: task.clientName,
            preferredStaffId: task.preferredStaffId,
            preferredStaffName: task.preferredStaffName,
            skillType: task.skillType,
            fieldTypes: {
              preferredStaffId: typeof task.preferredStaffId,
              preferredStaffName: typeof task.preferredStaffName,
              skillType: typeof task.skillType
            }
          });
          
          sampleTasks.push({
            taskName: task.taskName,
            preferredStaffId: task.preferredStaffId,
            preferredStaffName: task.preferredStaffName,
            skillType: task.skillType
          });
        }
        
        if (task.preferredStaffId) {
          tasksWithPreferredStaff++;
          uniquePreferredStaffIds.add(task.preferredStaffId);
          if (task.preferredStaffName) {
            preferredStaffNames.add(task.preferredStaffName);
          }
        } else {
          tasksWithoutPreferredStaff++;
        }
      });
    }
  });
  
  return {
    totalTasks,
    tasksWithPreferredStaff,
    tasksWithoutPreferredStaff,
    uniquePreferredStaffIds: Array.from(uniquePreferredStaffIds),
    preferredStaffNames: Array.from(preferredStaffNames),
    sampleTasks
  };
}

/**
 * Analyze field mapping between database and application
 */
function analyzeFieldMapping(data: DemandMatrixData) {
  const fieldMappingIssues: string[] = [];
  const sampleFieldMappings: any[] = [];
  
  data.dataPoints.slice(0, 3).forEach((dataPoint, dpIndex) => {
    if (dataPoint.taskBreakdown) {
      dataPoint.taskBreakdown.slice(0, 2).forEach((task, taskIndex) => {
        const fieldMapping = {
          taskName: task.taskName,
          hasPreferredStaffId: task.hasOwnProperty('preferredStaffId'),
          preferredStaffIdValue: task.preferredStaffId,
          preferredStaffIdType: typeof task.preferredStaffId,
          hasPreferredStaffName: task.hasOwnProperty('preferredStaffName'),
          preferredStaffNameValue: task.preferredStaffName,
          skillType: task.skillType,
          skillTypeEqualsStaffId: task.skillType === task.preferredStaffId
        };
        
        console.log(`🔗 Field Mapping Analysis ${dpIndex}-${taskIndex}:`, fieldMapping);
        sampleFieldMappings.push(fieldMapping);
        
        if (task.skillType === task.preferredStaffId && task.preferredStaffId) {
          fieldMappingIssues.push(`Task "${task.taskName}" has skillType === preferredStaffId (${task.skillType})`);
        }
      });
    }
  });
  
  return {
    fieldMappingIssues,
    sampleFieldMappings
  };
}

/**
 * Analyze filter comparison logic
 */
function analyzeFilterComparison(data: DemandMatrixData, filters: DemandFilters) {
  const preferredStaff = filters.preferredStaff || [];
  const normalizedFilterIds = preferredStaff.map(id => normalizeStaffId(id)).filter(Boolean);
  
  console.log('⚖️ Filter Comparison Setup:', {
    originalFilterIds: preferredStaff,
    normalizedFilterIds,
    filterSetContents: normalizedFilterIds
  });
  
  const lookupSet = new Set(normalizedFilterIds);
  let matchingTasks = 0;
  let nonMatchingTasks = 0;
  const comparisonExamples: any[] = [];
  
  data.dataPoints.forEach(dataPoint => {
    if (dataPoint.taskBreakdown) {
      dataPoint.taskBreakdown.forEach(task => {
        if (task.preferredStaffId) {
          const normalizedTaskStaffId = normalizeStaffId(task.preferredStaffId);
          const isMatch = normalizedTaskStaffId ? lookupSet.has(normalizedTaskStaffId) : false;
          
          if (comparisonExamples.length < 10) {
            const comparisonExample = {
              taskName: task.taskName,
              originalStaffId: task.preferredStaffId,
              normalizedStaffId: normalizedTaskStaffId,
              filterSet: Array.from(lookupSet),
              isMatch,
              lookupResult: normalizedTaskStaffId ? lookupSet.has(normalizedTaskStaffId) : false
            };
            
            console.log(`⚖️ Comparison Example ${comparisonExamples.length + 1}:`, comparisonExample);
            comparisonExamples.push(comparisonExample);
          }
          
          if (isMatch) {
            matchingTasks++;
          } else {
            nonMatchingTasks++;
          }
        }
      });
    }
  });
  
  return {
    normalizedFilterIds,
    lookupSet: Array.from(lookupSet),
    matchingTasks,
    nonMatchingTasks,
    noMatches: matchingTasks === 0,
    comparisonExamples
  };
}

/**
 * Log input analysis results
 */
function logInputAnalysis(analysis: any): void {
  console.log('📋 INPUT ANALYSIS RESULTS:', {
    originalCount: analysis.originalStaffIds.length,
    validCount: analysis.validStaffIds.length,
    invalidCount: analysis.invalidStaffIds.length,
    validIds: analysis.validStaffIds,
    invalidIds: analysis.invalidStaffIds,
    normalizationWorking: analysis.normalizationSuccess
  });
}

/**
 * Log data analysis results
 */
function logDataAnalysis(analysis: any): void {
  console.log('📊 DATA ANALYSIS RESULTS:', {
    totalTasks: analysis.totalTasks,
    tasksWithStaff: analysis.tasksWithPreferredStaff,
    tasksWithoutStaff: analysis.tasksWithoutPreferredStaff,
    uniqueStaffIds: analysis.uniquePreferredStaffIds.length,
    staffIds: analysis.uniquePreferredStaffIds,
    staffNames: analysis.preferredStaffNames,
    coveragePercentage: ((analysis.tasksWithPreferredStaff / analysis.totalTasks) * 100).toFixed(1) + '%'
  });
}

/**
 * Log field mapping analysis results
 */
function logFieldMappingAnalysis(analysis: any): void {
  console.log('🔗 FIELD MAPPING ANALYSIS:', {
    issuesFound: analysis.fieldMappingIssues.length,
    issues: analysis.fieldMappingIssues,
    sampleMappings: analysis.sampleFieldMappings
  });
}

/**
 * Log comparison results
 */
function logComparisonResults(results: any): void {
  console.log('⚖️ COMPARISON RESULTS:', {
    filterIds: results.normalizedFilterIds,
    lookupSet: results.lookupSet,
    matchingTasks: results.matchingTasks,
    nonMatchingTasks: results.nonMatchingTasks,
    hasMatches: !results.noMatches,
    examples: results.comparisonExamples
  });
}

/**
 * Create test data for validation
 */
export function createTestData(): any {
  return {
    message: 'Test data creation not implemented yet',
    timestamp: new Date().toISOString()
  };
}
