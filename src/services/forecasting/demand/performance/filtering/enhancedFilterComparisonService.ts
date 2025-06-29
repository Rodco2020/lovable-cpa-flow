
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { EnhancedOptimizedPreferredStaffFilterStrategy } from './enhancedOptimizedPreferredStaffFilterStrategy';
import { EnhancedSkillFilterStrategy } from './enhancedSkillFilterStrategy';
import { UuidResolutionService } from '@/services/staff/uuidResolutionService';

export interface EnhancedFilterComparisonResult {
  testName: string;
  testSubject: string;
  filters: {
    preferredStaff: DemandFilters;
    skill: DemandFilters;
  };
  results: {
    preferredStaffFilter: {
      dataPoints: number;
      totalHours: number;
      taskCount: number;
      matchedTasks: Array<any>;
    };
    skillFilter: {
      dataPoints: number;
      totalHours: number;
      taskCount: number;
      matchedTasks: Array<any>;
    };
  };
  crossComparisonInsights: {
    commonDataPoints: number;
    uniqueToPreferredStaff: number;
    uniqueToSkill: number;
    debuggingNotes: string[];
  };
  executionTime: number;
}

/**
 * Enhanced Filter Comparison Service with Cross-Filter Debugging
 * 
 * Provides comprehensive comparison between skill and staff filters with detailed
 * cross-analysis and debugging insights to understand filtering behavior.
 */
export class EnhancedFilterComparisonService {
  
  /**
   * Compare preferred staff filter vs skill filter with enhanced debugging
   */
  static async compareFiltersWithEnhancedDebugging(
    demandData: DemandMatrixData,
    targetStaffName: string = 'Marciano Urbaez',
    targetSkill: string = 'Senior'
  ): Promise<EnhancedFilterComparisonResult> {
    console.log(`🚀 [ENHANCED FILTER COMPARISON] Starting enhanced cross-comparison debugging`);
    console.log(`🎯 [ENHANCED FILTER COMPARISON] Target: ${targetStaffName} vs ${targetSkill} skill`);
    
    const startTime = performance.now();
    
    // Resolve staff UUID
    const staffUuids = await UuidResolutionService.resolveStaffNamesToUuids([targetStaffName]);
    
    if (staffUuids.length === 0) {
      throw new Error(`Could not resolve UUID for ${targetStaffName}`);
    }
    
    const staffUuid = staffUuids[0];
    console.log(`✅ [ENHANCED FILTER COMPARISON] Resolved ${targetStaffName}: ${staffUuid}`);

    // Create filter configurations
    const preferredStaffFilter: DemandFilters = {
      skills: [],
      clients: [],
      preferredStaff: [staffUuid],
      timeHorizon: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      }
    };

    const skillFilter: DemandFilters = {
      skills: [targetSkill],
      clients: [],
      preferredStaff: [],
      timeHorizon: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      }
    };

    console.log(`🔧 [ENHANCED FILTER COMPARISON] Starting enhanced debugging filters...`);

    // Apply enhanced filters with debugging
    const enhancedStaffStrategy = new EnhancedOptimizedPreferredStaffFilterStrategy();
    const enhancedSkillStrategy = new EnhancedSkillFilterStrategy();

    console.log(`🎯 [ENHANCED FILTER COMPARISON] Applying enhanced staff filter...`);
    const preferredStaffResult = enhancedStaffStrategy.apply(demandData, preferredStaffFilter);

    console.log(`🎯 [ENHANCED FILTER COMPARISON] Applying enhanced skill filter...`);
    const skillResult = enhancedSkillStrategy.apply(demandData, skillFilter);

    // Extract and analyze results
    const preferredStaffTasks = this.extractTaskDetails(preferredStaffResult, 'preferredStaff');
    const skillTasks = this.extractTaskDetails(skillResult, 'skill');

    // Perform cross-comparison analysis
    const crossComparisonInsights = this.performCrossComparisonAnalysis(
      preferredStaffResult, 
      skillResult, 
      preferredStaffTasks, 
      skillTasks,
      targetStaffName,
      targetSkill
    );

    const executionTime = performance.now() - startTime;

    const result: EnhancedFilterComparisonResult = {
      testName: `Enhanced Cross-Filter Comparison with Debugging`,
      testSubject: `${targetStaffName} (${staffUuid}) vs ${targetSkill} Skill`,
      filters: {
        preferredStaff: preferredStaffFilter,
        skill: skillFilter
      },
      results: {
        preferredStaffFilter: {
          dataPoints: preferredStaffResult.dataPoints.length,
          totalHours: preferredStaffResult.totalDemand,
          taskCount: preferredStaffResult.totalTasks,
          matchedTasks: preferredStaffTasks
        },
        skillFilter: {
          dataPoints: skillResult.dataPoints.length,
          totalHours: skillResult.totalDemand,
          taskCount: skillResult.totalTasks,
          matchedTasks: skillTasks
        }
      },
      crossComparisonInsights,
      executionTime
    };

    console.log(`✅ [ENHANCED FILTER COMPARISON] Enhanced debugging complete:`, {
      staffFilterDataPoints: result.results.preferredStaffFilter.dataPoints,
      skillFilterDataPoints: result.results.skillFilter.dataPoints,
      commonDataPoints: result.crossComparisonInsights.commonDataPoints,
      executionTime: `${executionTime.toFixed(2)}ms`
    });

    return result;
  }

  /**
   * Extract task details from filtered data
   */
  private static extractTaskDetails(data: DemandMatrixData, filterType: 'preferredStaff' | 'skill'): Array<any> {
    const tasks: Array<any> = [];

    data.dataPoints.forEach(dataPoint => {
      dataPoint.taskBreakdown?.forEach(task => {
        const taskDetail = {
          taskName: task.taskName,
          clientName: task.clientName,
          skillType: task.skillType,
          hours: task.monthlyHours,
          month: dataPoint.month,
          monthLabel: dataPoint.monthLabel
        };

        if (filterType === 'preferredStaff') {
          (taskDetail as any).preferredStaffId = task.preferredStaffId;
          (taskDetail as any).preferredStaffName = task.preferredStaffName;
        }

        tasks.push(taskDetail);
      });
    });

    return tasks;
  }

  /**
   * Perform comprehensive cross-comparison analysis
   */
  private static performCrossComparisonAnalysis(
    preferredStaffResult: DemandMatrixData,
    skillResult: DemandMatrixData,
    preferredStaffTasks: Array<any>,
    skillTasks: Array<any>,
    targetStaffName: string,
    targetSkill: string
  ): EnhancedFilterComparisonResult['crossComparisonInsights'] {
    
    console.log(`🔍 [ENHANCED CROSS-COMPARISON] Starting detailed analysis...`);

    // Create data point identifiers for comparison
    const createDataPointId = (dataPoint: any) => `${dataPoint.skillType}-${dataPoint.month}`;
    
    const staffDataPointIds = new Set(preferredStaffResult.dataPoints.map(createDataPointId));
    const skillDataPointIds = new Set(skillResult.dataPoints.map(createDataPointId));

    const commonDataPointIds = new Set([...staffDataPointIds].filter(id => skillDataPointIds.has(id)));
    const uniqueToStaff = staffDataPointIds.size - commonDataPointIds.size;
    const uniqueToSkill = skillDataPointIds.size - commonDataPointIds.size;

    // Generate debugging notes
    const debuggingNotes: string[] = [];
    
    debuggingNotes.push(`=== ENHANCED CROSS-COMPARISON ANALYSIS ===`);
    debuggingNotes.push(`Staff filter (${targetStaffName}): ${preferredStaffResult.dataPoints.length} data points, ${preferredStaffTasks.length} tasks`);
    debuggingNotes.push(`Skill filter (${targetSkill}): ${skillResult.dataPoints.length} data points, ${skillTasks.length} tasks`);
    debuggingNotes.push(`Common data points: ${commonDataPointIds.size}`);
    debuggingNotes.push(`Unique to staff filter: ${uniqueToStaff}`);
    debuggingNotes.push(`Unique to skill filter: ${uniqueToSkill}`);

    // Analyze skill distribution in staff results
    const staffSkillDistribution = new Map<string, number>();
    preferredStaffResult.dataPoints.forEach(dp => {
      const current = staffSkillDistribution.get(dp.skillType) || 0;
      staffSkillDistribution.set(dp.skillType, current + 1);
    });

    debuggingNotes.push(`=== STAFF FILTER SKILL DISTRIBUTION ===`);
    Array.from(staffSkillDistribution.entries()).forEach(([skill, count]) => {
      debuggingNotes.push(`${skill}: ${count} data points`);
    });

    // Check if target staff has tasks in target skill
    const staffTargetSkillCount = staffSkillDistribution.get(targetSkill) || 0;
    if (staffTargetSkillCount > 0) {
      debuggingNotes.push(`✅ ${targetStaffName} HAS ${staffTargetSkillCount} data points in ${targetSkill} skill`);
    } else {
      debuggingNotes.push(`❌ ${targetStaffName} has NO data points in ${targetSkill} skill - explains filtering difference`);
    }

    // Month-by-month analysis
    debuggingNotes.push(`=== MONTH-BY-MONTH COMPARISON ===`);
    const staffMonths = new Set(preferredStaffResult.dataPoints.map(dp => dp.monthLabel));
    const skillMonths = new Set(skillResult.dataPoints.map(dp => dp.monthLabel));
    
    const allMonths = new Set([...staffMonths, ...skillMonths]);
    Array.from(allMonths).sort().forEach(month => {
      const inStaff = staffMonths.has(month);
      const inSkill = skillMonths.has(month);
      debuggingNotes.push(`${month}: Staff=${inStaff ? '✓' : '✗'}, Skill=${inSkill ? '✓' : '✗'}`);
    });

    console.log(`📊 [ENHANCED CROSS-COMPARISON] Analysis complete:`, {
      commonDataPoints: commonDataPointIds.size,
      uniqueToStaff,
      uniqueToSkill,
      staffSkillDistribution: Object.fromEntries(staffSkillDistribution)
    });

    return {
      commonDataPoints: commonDataPointIds.size,
      uniqueToPreferredStaff: uniqueToStaff,
      uniqueToSkill: uniqueToSkill,
      debuggingNotes
    };
  }
}
