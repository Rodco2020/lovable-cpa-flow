
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { FilterComparisonService, FilterComparisonResult } from './filterComparisonService';

export interface MultiStaffComparisonResult {
  testName: string;
  testSubject: string;
  staffComparisons: Array<{
    staffName: string;
    staffUuid: string;
    result: FilterComparisonResult;
  }>;
  aggregatedMetrics: {
    totalPreferredStaffTasks: number;
    totalPreferredStaffHours: number;
    totalSkillTasks: number;
    totalSkillHours: number;
    averageCommonTasks: number;
    staffWithMostTasks: string;
    staffWithLeastTasks: string;
  };
  executionTime: number;
}

/**
 * Service for comparing multiple staff members against skill filters
 */
export class MultiStaffComparisonService {
  
  /**
   * Compare multiple staff members against a target skill
   */
  static async compareMultipleStaff(
    demandData: DemandMatrixData,
    staffNames: string[] = ['Marciano Urbaez', 'Maria Vargas', 'Luis Rodriguez'],
    targetSkill: string = 'Senior'
  ): Promise<MultiStaffComparisonResult> {
    console.log(`🔍 [MULTI-STAFF COMPARISON] Starting comparison for ${staffNames.length} staff members vs ${targetSkill} skill`);
    
    const startTime = performance.now();
    const staffComparisons: MultiStaffComparisonResult['staffComparisons'] = [];

    // Run comparison for each staff member
    for (const staffName of staffNames) {
      try {
        console.log(`🎯 [MULTI-STAFF COMPARISON] Processing ${staffName}...`);
        
        const result = await FilterComparisonService.compareFilterResults(
          demandData,
          staffName,
          targetSkill
        );
        
        // Extract UUID from the result
        const staffUuid = result.filters.preferredStaff.preferredStaff[0] || 'unknown';
        
        staffComparisons.push({
          staffName,
          staffUuid,
          result
        });
        
        console.log(`✅ [MULTI-STAFF COMPARISON] Completed ${staffName}:`, {
          preferredStaffTasks: result.results.preferredStaffFilter.taskCount,
          skillTasks: result.results.skillFilter.taskCount,
          commonTasks: result.comparison.commonTasks
        });
        
      } catch (error) {
        console.error(`❌ [MULTI-STAFF COMPARISON] Failed for ${staffName}:`, error);
        
        // Create a placeholder result for failed comparisons
        staffComparisons.push({
          staffName,
          staffUuid: 'error',
          result: {
            testName: `Failed Comparison`,
            testSubject: `${staffName} vs ${targetSkill} Skill`,
            filters: {
              preferredStaff: { skills: [], clients: [], preferredStaff: [], timeHorizon: { start: new Date(), end: new Date() } },
              skill: { skills: [], clients: [], preferredStaff: [], timeHorizon: { start: new Date(), end: new Date() } }
            },
            results: {
              preferredStaffFilter: { dataPoints: 0, totalHours: 0, taskCount: 0, matchedTasks: [] },
              skillFilter: { dataPoints: 0, totalHours: 0, taskCount: 0, matchedTasks: [] }
            },
            comparison: {
              commonTasks: 0,
              uniqueToPreferredStaff: 0,
              uniqueToSkill: 0,
              totalDifference: 0,
              hoursDifference: 0,
              analysisNotes: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
            },
            executionTime: 0
          }
        });
      }
    }

    // Calculate aggregated metrics
    const aggregatedMetrics = this.calculateAggregatedMetrics(staffComparisons);
    
    const executionTime = performance.now() - startTime;

    const result: MultiStaffComparisonResult = {
      testName: `Multi-Staff Filter Comparison`,
      testSubject: `${staffNames.join(', ')} vs ${targetSkill} Skill`,
      staffComparisons,
      aggregatedMetrics,
      executionTime
    };

    console.log(`✅ [MULTI-STAFF COMPARISON] Multi-staff comparison complete:`, {
      staffCount: staffComparisons.length,
      totalExecutionTime: `${executionTime.toFixed(2)}ms`,
      aggregatedMetrics
    });

    return result;
  }

  /**
   * Calculate aggregated metrics across all staff comparisons
   */
  private static calculateAggregatedMetrics(
    staffComparisons: MultiStaffComparisonResult['staffComparisons']
  ): MultiStaffComparisonResult['aggregatedMetrics'] {
    
    const validComparisons = staffComparisons.filter(sc => sc.staffUuid !== 'error');
    
    if (validComparisons.length === 0) {
      return {
        totalPreferredStaffTasks: 0,
        totalPreferredStaffHours: 0,
        totalSkillTasks: 0,
        totalSkillHours: 0,
        averageCommonTasks: 0,
        staffWithMostTasks: 'None',
        staffWithLeastTasks: 'None'
      };
    }

    const totalPreferredStaffTasks = validComparisons.reduce((sum, sc) => 
      sum + sc.result.results.preferredStaffFilter.taskCount, 0);
    
    const totalPreferredStaffHours = validComparisons.reduce((sum, sc) => 
      sum + sc.result.results.preferredStaffFilter.totalHours, 0);
    
    // Skill filter results should be the same across all comparisons (same skill filter)
    const totalSkillTasks = validComparisons[0]?.result.results.skillFilter.taskCount || 0;
    const totalSkillHours = validComparisons[0]?.result.results.skillFilter.totalHours || 0;
    
    const averageCommonTasks = validComparisons.reduce((sum, sc) => 
      sum + sc.result.comparison.commonTasks, 0) / validComparisons.length;

    // Find staff with most and least tasks
    const sortedByTasks = validComparisons.sort((a, b) => 
      b.result.results.preferredStaffFilter.taskCount - a.result.results.preferredStaffFilter.taskCount);
    
    const staffWithMostTasks = sortedByTasks[0]?.staffName || 'None';
    const staffWithLeastTasks = sortedByTasks[sortedByTasks.length - 1]?.staffName || 'None';

    return {
      totalPreferredStaffTasks,
      totalPreferredStaffHours,
      totalSkillTasks,
      totalSkillHours,
      averageCommonTasks: Math.round(averageCommonTasks * 100) / 100,
      staffWithMostTasks,
      staffWithLeastTasks
    };
  }
}
