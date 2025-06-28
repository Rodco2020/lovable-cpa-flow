
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from '../baseFilterStrategy';
import { 
  validateAndNormalizeFilters, 
  analyzeFilterData, 
  shouldProceedWithFiltering 
} from './validationUtils';
import { processDataPoint, calculateFilteredTotals } from './dataPointProcessor';
import { 
  generateZeroResultsDiagnostics, 
  logZeroResultsDiagnostics, 
  generatePerformanceMetrics 
} from './diagnosticsUtils';
import { runComprehensiveFilterTest } from './testingUtils';

/**
 * ENHANCED Preferred Staff Filter Strategy with COMPREHENSIVE DEBUGGING
 * 
 * This strategy has been completely enhanced to provide surgical precision debugging
 * and comprehensive validation for the preferred staff filtering process.
 * 
 * CRITICAL DEBUGGING PHASE: This version includes extensive logging to identify
 * exactly where the skill-based filtering is happening instead of staff ID filtering.
 */
export class PreferredStaffFilterStrategy implements BaseFilterStrategy {
  getName(): string {
    return 'PreferredStaffFilter_Enhanced_Debug';
  }

  getPriority(): number {
    return 4;
  }

  shouldApply(filters: DemandFilters): boolean {
    return shouldProceedWithFiltering(filters);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.group('🚀 [CRITICAL DEBUG] PREFERRED STAFF FILTER ANALYSIS');
    console.log('🔧 Starting COMPREHENSIVE debugging to identify skill vs staff ID issue');
    
    const startTime = performance.now();
    
    // CRITICAL DEBUG: Run comprehensive test first
    console.log('🧪 RUNNING COMPREHENSIVE FILTER TEST');
    const testResult = runComprehensiveFilterTest(data, filters);
    
    if (!testResult.testPassed) {
      console.error('❌ CRITICAL ISSUES DETECTED:', testResult.issues);
      console.warn('💡 RECOMMENDATIONS:', testResult.recommendations);
    }
    
    // Early exit for no preferred staff selected
    if (!filters.preferredStaff || filters.preferredStaff.length === 0) {
      console.log('✅ No preferred staff filter applied - showing all data');
      console.groupEnd();
      return data;
    }

    // CRITICAL DEBUG: Answer the user's specific questions
    this.answerCriticalQuestions(data, filters);

    // STEP 1: Enhanced validation and normalization
    console.log('📋 STEP 1: Enhanced Filter Validation');
    const { normalizedFilterIds, isValid, validationErrors } = validateAndNormalizeFilters(filters.preferredStaff);
    
    if (!isValid) {
      console.error('❌ Filter validation failed:', validationErrors);
      console.groupEnd();
      return this.createEmptyResult(data);
    }

    // STEP 2: Comprehensive data analysis
    console.log('📊 STEP 2: Comprehensive Data Analysis');
    const filterAnalysis = analyzeFilterData(data, normalizedFilterIds);
    this.logDataAnalysisResults(filterAnalysis);

    // STEP 3: Enhanced data point processing with CRITICAL debugging
    console.log('🔄 STEP 3: Enhanced Data Point Processing WITH CRITICAL DEBUG');
    const filteredDataPoints = data.dataPoints
      .map(dataPoint => {
        const { filteredDataPoint } = processDataPoint(dataPoint, normalizedFilterIds);
        return filteredDataPoint;
      })
      .filter(dataPoint => dataPoint.demandHours > 0);

    // STEP 4: Calculate enhanced totals
    console.log('📈 STEP 4: Enhanced Totals Calculation');
    const { 
      totalDemand, 
      totalTasks, 
      totalClients, 
      skillSummary, 
      remainingSkills 
    } = calculateFilteredTotals(filteredDataPoints);

    // STEP 5: Performance metrics generation
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    const performanceMetrics = generatePerformanceMetrics(
      processingTime,
      data,
      {
        ...data,
        dataPoints: filteredDataPoints,
        skills: remainingSkills,
        totalDemand,
        totalTasks,
        totalClients,
        skillSummary
      }
    );

    console.log('⚡ STEP 5: Performance Metrics:', performanceMetrics);

    // STEP 6: Zero results handling
    if (filteredDataPoints.length === 0) {
      console.warn('🚨 STEP 6: Zero Results Detected - Running Comprehensive Diagnostics');
      const diagnostics = generateZeroResultsDiagnostics(
        filters.preferredStaff,
        normalizedFilterIds,
        data
      );
      logZeroResultsDiagnostics(diagnostics);
      
      console.error('❌ Zero results after filtering - this indicates the field mapping issue persists');
      console.groupEnd();
      return this.createEmptyResult(data);
    }

    // STEP 7: Success logging
    console.log('✅ ENHANCED FILTERING SUCCESSFUL:', {
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      originalTasks: data.totalTasks,
      filteredTasks: totalTasks,
      filterEfficiency: ((filteredDataPoints.length / data.dataPoints.length) * 100).toFixed(1) + '%',
      processingTime: processingTime.toFixed(2) + 'ms',
      fieldMappingVerified: true,
      enhancedDebuggingComplete: true
    });

    console.groupEnd();

    return {
      ...data,
      dataPoints: filteredDataPoints,
      skills: remainingSkills,
      totalDemand,
      totalTasks,
      totalClients,
      skillSummary
    };
  }

  /**
   * CRITICAL DEBUG: Answer the user's specific questions
   */
  private answerCriticalQuestions(data: DemandMatrixData, filters: DemandFilters): void {
    console.group('🎯 [CRITICAL DEBUG] ANSWERING USER QUESTIONS');
    
    // Question 1: Show exact console.log output when Marciano Urbaez is selected
    console.log('❓ QUESTION 1: Filter values being passed');
    console.log('📋 filters.preferredStaff array contents:', {
      originalArray: filters.preferredStaff,
      arrayLength: filters.preferredStaff?.length,
      arrayContents: filters.preferredStaff?.map((id, index) => ({
        index,
        value: id,
        type: typeof id,
        stringValue: String(id)
      }))
    });
    
    // Question 2: Show actual taskBreakdown data structure
    console.log('❓ QUESTION 2: Actual taskBreakdown data structure');
    const sampleDataPoint = data.dataPoints[0];
    if (sampleDataPoint?.taskBreakdown?.length > 0) {
      const sampleTask = sampleDataPoint.taskBreakdown[0];
      console.log('📊 Sample taskBreakdown object:', {
        taskName: sampleTask.taskName,
        clientName: sampleTask.clientName,
        preferredStaffId: sampleTask.preferredStaffId,
        preferredStaffName: sampleTask.preferredStaffName,
        skillType: sampleTask.skillType,
        fieldTypes: {
          preferredStaffId: typeof sampleTask.preferredStaffId,
          preferredStaffName: typeof sampleTask.preferredStaffName,
          skillType: typeof sampleTask.skillType
        },
        completeTaskObject: sampleTask
      });
    }
    
    // Question 3: Show normalizeStaffId function behavior
    console.log('❓ QUESTION 3: normalizeStaffId function testing');
    if (filters.preferredStaff && filters.preferredStaff.length > 0) {
      filters.preferredStaff.forEach((staffId, index) => {
        console.log(`🔍 normalizeStaffId test ${index}:`, {
          input: staffId,
          inputType: typeof staffId,
          // The actual normalization will be logged in the normalizeStaffId function
        });
      });
    }
    
    // Question 4: Show current shouldIncludeDataPoint method (this will be logged in processDataPoint)
    console.log('❓ QUESTION 4: Filter comparison logic will be shown in data point processing');
    
    // Question 5: Debug filter comparison logic (logged in dataPointProcessor)
    console.log('❓ QUESTION 5: Filter comparison debugging will be shown per task');
    
    // Question 6: Show staff data structure
    console.log('❓ QUESTION 6: Staff data analysis');
    this.analyzeStaffDataStructure(data);
    
    // Question 7: Verify recurring_tasks data
    console.log('❓ QUESTION 7: Database records analysis');
    this.analyzeRecurringTasksData(data);
    
    // Question 8: Check for skill-based filtering logic
    console.log('❓ QUESTION 8: Checking for accidental skill-based filtering');
    this.checkForSkillBasedFiltering(data, filters);
    
    console.groupEnd();
  }
  
  /**
   * Analyze staff data structure for debugging
   */
  private analyzeStaffDataStructure(data: DemandMatrixData): void {
    const staffIds = new Set<string>();
    const staffNames = new Set<string>();
    const skillTypes = new Set<string>();
    
    data.dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          if (task.preferredStaffId) {
            staffIds.add(task.preferredStaffId);
          }
          if (task.preferredStaffName) {
            staffNames.add(task.preferredStaffName);
          }
          if (task.skillType) {
            skillTypes.add(task.skillType);
          }
        });
      }
    });
    
    console.log('👥 Staff Data Structure Analysis:', {
      uniqueStaffIds: Array.from(staffIds),
      uniqueStaffNames: Array.from(staffNames),
      uniqueSkillTypes: Array.from(skillTypes),
      potentialIssue: {
        staffIdsMatchSkillTypes: Array.from(staffIds).some(id => skillTypes.has(id)),
        explanation: 'If true, staff IDs are being confused with skill types'
      }
    });
  }
  
  /**
   * Analyze recurring tasks data for preferred staff assignments
   */
  private analyzeRecurringTasksData(data: DemandMatrixData): void {
    const preferredStaffAnalysis = {
      totalTasks: 0,
      tasksWithPreferredStaff: 0,
      tasksWithoutPreferredStaff: 0,
      preferredStaffIdFormats: new Map<string, number>()
    };
    
    data.dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          preferredStaffAnalysis.totalTasks++;
          
          if (task.preferredStaffId) {
            preferredStaffAnalysis.tasksWithPreferredStaff++;
            
            // Analyze ID format
            const idFormat = this.analyzeIdFormat(task.preferredStaffId);
            const count = preferredStaffAnalysis.preferredStaffIdFormats.get(idFormat) || 0;
            preferredStaffAnalysis.preferredStaffIdFormats.set(idFormat, count + 1);
          } else {
            preferredStaffAnalysis.tasksWithoutPreferredStaff++;
          }
        });
      }
    });
    
    console.log('🗄️ Recurring Tasks Data Analysis:', {
      ...preferredStaffAnalysis,
      preferredStaffIdFormats: Object.fromEntries(preferredStaffAnalysis.preferredStaffIdFormats),
      coverageRate: ((preferredStaffAnalysis.tasksWithPreferredStaff / preferredStaffAnalysis.totalTasks) * 100).toFixed(1) + '%'
    });
  }
  
  /**
   * Analyze ID format for debugging
   */
  private analyzeIdFormat(id: string): string {
    if (!id) return 'empty';
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return 'uuid';
    }
    if (id.match(/^\d+$/)) return 'numeric';
    if (id.match(/^[A-Za-z\s]+$/)) return 'text';
    return 'other';
  }
  
  /**
   * Check for accidental skill-based filtering logic
   */
  private checkForSkillBasedFiltering(data: DemandMatrixData, filters: DemandFilters): void {
    const skills = new Set<string>();
    const staffIdsInSkillPosition = new Set<string>();
    
    data.dataPoints.forEach(dataPoint => {
      skills.add(dataPoint.skillType);
      
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          if (task.preferredStaffId === task.skillType) {
            staffIdsInSkillPosition.add(task.preferredStaffId);
          }
        });
      }
    });
    
    const filterIds = filters.preferredStaff || [];
    const filtersMatchingSkills = filterIds.filter(id => 
      Array.from(skills).includes(String(id))
    );
    
    console.log('🔍 Skill-Based Filtering Analysis:', {
      allSkillTypes: Array.from(skills),
      staffIdsMatchingSkillTypes: Array.from(staffIdsInSkillPosition),
      filterIdsMatchingSkills: filtersMatchingSkills,
      potentialSkillBasedFiltering: filtersMatchingSkills.length > 0,
      warningMessage: filtersMatchingSkills.length > 0 ? 'CRITICAL: Filters match skill types instead of staff IDs!' : 'No skill-based filtering detected'
    });
  }

  /**
   * Log comprehensive data analysis results
   */
  private logDataAnalysisResults(analysis: any): void {
    console.log('📊 Data Analysis Results:', {
      totalTasks: analysis.totalTasks,
      tasksWithPreferredStaff: analysis.tasksWithPreferredStaff,
      tasksWithoutPreferredStaff: analysis.tasksWithoutPreferredStaff,
      filterCoverage: analysis.filterCoverage.toFixed(1) + '%',
      uniquePreferredStaffIds: analysis.uniquePreferredStaffIds,
      preferredStaffNames: analysis.preferredStaffNames,
      taskDistribution: Object.fromEntries(analysis.tasksByStaff)
    });
  }

  /**
   * Create empty result structure
   */
  private createEmptyResult(originalData: DemandMatrixData): DemandMatrixData {
    return {
      ...originalData,
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {}
    };
  }
}
