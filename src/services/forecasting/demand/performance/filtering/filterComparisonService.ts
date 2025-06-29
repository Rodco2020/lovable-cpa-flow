
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { OptimizedPreferredStaffFilterStrategy } from './optimizedPreferredStaffFilterStrategy';
import { SkillFilterStrategy } from './skillFilterStrategy';
import { UuidResolutionService } from '@/services/staff/uuidResolutionService';

export interface FilterComparisonResult {
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
      matchedTasks: Array<{
        taskName: string;
        clientName: string;
        skillType: string;
        hours: number;
        preferredStaffId: string;
        preferredStaffName: string;
      }>;
    };
    skillFilter: {
      dataPoints: number;
      totalHours: number;
      taskCount: number;
      matchedTasks: Array<{
        taskName: string;
        clientName: string;
        skillType: string;
        hours: number;
      }>;
    };
  };
  comparison: {
    commonTasks: number;
    uniqueToPreferredStaff: number;
    uniqueToSkill: number;
    totalDifference: number;
    hoursDifference: number;
    analysisNotes: string[];
  };
  executionTime: number;
}

/**
 * Service for comparing different filter strategies to understand their behavior
 */
export class FilterComparisonService {
  
  /**
   * Compare preferred staff filter vs skill filter for Marciano Urbaez
   */
  static async compareFilterResults(
    demandData: DemandMatrixData,
    targetStaffName: string = 'Marciano Urbaez',
    targetSkill: string = 'Senior'
  ): Promise<FilterComparisonResult> {
    console.log(`🔍 [FILTER COMPARISON] Starting comparison for ${targetStaffName} vs ${targetSkill} skill`);
    
    const startTime = performance.now();
    
    // Resolve Marciano's UUID
    const marcianoUuids = await UuidResolutionService.resolveStaffNamesToUuids([targetStaffName]);
    
    if (marcianoUuids.length === 0) {
      throw new Error(`Could not resolve UUID for ${targetStaffName}`);
    }
    
    const marcianoUuid = marcianoUuids[0];
    const marcianoStaff = await UuidResolutionService.findStaffByUuid(marcianoUuid);
    
    console.log(`✅ [FILTER COMPARISON] Resolved ${targetStaffName}:`, {
      uuid: marcianoUuid,
      name: marcianoStaff?.full_name || 'Unknown'
    });

    // Create filter configurations
    const preferredStaffFilter: DemandFilters = {
      skills: [],
      clients: [],
      preferredStaff: [marcianoUuid],
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

    // Apply filters
    const preferredStaffStrategy = new OptimizedPreferredStaffFilterStrategy();
    const skillStrategy = new SkillFilterStrategy();

    console.log(`🎯 [FILTER COMPARISON] Applying preferred staff filter for ${targetStaffName}...`);
    const preferredStaffResult = preferredStaffStrategy.apply(demandData, preferredStaffFilter);

    console.log(`🎯 [FILTER COMPARISON] Applying skill filter for ${targetSkill}...`);
    const skillResult = skillStrategy.apply(demandData, skillFilter);

    // Extract task details for comparison
    const preferredStaffTasks = this.extractTaskDetails(preferredStaffResult, 'preferredStaff');
    const skillTasks = this.extractTaskDetails(skillResult, 'skill');

    // Perform detailed comparison
    const comparison = this.performComparison(preferredStaffTasks, skillTasks, marcianoUuid, targetSkill);

    const executionTime = performance.now() - startTime;

    const result: FilterComparisonResult = {
      testName: `Preferred Staff vs Skill Filter Comparison`,
      testSubject: `${targetStaffName} (${marcianoUuid}) vs ${targetSkill} Skill`,
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
      comparison,
      executionTime
    };

    console.log(`✅ [FILTER COMPARISON] Comparison complete:`, {
      preferredStaffDataPoints: result.results.preferredStaffFilter.dataPoints,
      skillDataPoints: result.results.skillFilter.dataPoints,
      commonTasks: result.comparison.commonTasks,
      executionTime: `${executionTime.toFixed(2)}ms`
    });

    return result;
  }

  /**
   * Extract task details from filtered data
   */
  private static extractTaskDetails(
    data: DemandMatrixData,
    filterType: 'preferredStaff' | 'skill'
  ): Array<any> {
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
   * Perform detailed comparison between filter results
   */
  private static performComparison(
    preferredStaffTasks: Array<any>,
    skillTasks: Array<any>,
    marcianoUuid: string,
    targetSkill: string
  ): FilterComparisonResult['comparison'] {
    console.log(`🔍 [FILTER COMPARISON] Analyzing task overlaps...`);

    // Create unique identifiers for tasks
    const createTaskId = (task: any) => `${task.clientName}-${task.taskName}-${task.month}`;

    const preferredStaffTaskIds = new Set(preferredStaffTasks.map(createTaskId));
    const skillTaskIds = new Set(skillTasks.map(createTaskId));

    // Find overlaps
    const commonTaskIds = new Set([...preferredStaffTaskIds].filter(id => skillTaskIds.has(id)));
    const uniqueToPreferredStaff = preferredStaffTaskIds.size - commonTaskIds.size;
    const uniqueToSkill = skillTaskIds.size - commonTaskIds.size;

    // Calculate hour differences
    const preferredStaffHours = preferredStaffTasks.reduce((sum, task) => sum + task.hours, 0);
    const skillHours = skillTasks.reduce((sum, task) => sum + task.hours, 0);
    const hoursDifference = Math.abs(preferredStaffHours - skillHours);

    // Generate analysis notes
    const analysisNotes: string[] = [];
    
    analysisNotes.push(`Preferred staff filter found ${preferredStaffTasks.length} tasks (${preferredStaffHours} hours)`);
    analysisNotes.push(`${targetSkill} skill filter found ${skillTasks.length} tasks (${skillHours} hours)`);
    analysisNotes.push(`${commonTaskIds.size} tasks appear in both results`);
    
    if (uniqueToPreferredStaff > 0) {
      analysisNotes.push(`${uniqueToPreferredStaff} tasks unique to preferred staff filter`);
    }
    
    if (uniqueToSkill > 0) {
      analysisNotes.push(`${uniqueToSkill} tasks unique to skill filter`);
    }

    // Analyze why tasks might be different
    const preferredStaffSkillTypes = new Set(preferredStaffTasks.map(t => t.skillType));
    if (preferredStaffSkillTypes.size > 1) {
      analysisNotes.push(`Preferred staff tasks span multiple skills: ${Array.from(preferredStaffSkillTypes).join(', ')}`);
    }

    // Check if Marciano has tasks in the target skill
    const marcianoTargetSkillTasks = preferredStaffTasks.filter(t => t.skillType === targetSkill);
    if (marcianoTargetSkillTasks.length > 0) {
      analysisNotes.push(`Marciano has ${marcianoTargetSkillTasks.length} tasks in ${targetSkill} skill`);
    } else {
      analysisNotes.push(`Marciano has NO tasks in ${targetSkill} skill - this explains the filtering difference`);
    }

    console.log(`✅ [FILTER COMPARISON] Analysis complete:`, {
      commonTasks: commonTaskIds.size,
      uniqueToPreferredStaff,
      uniqueToSkill,
      hoursDifference,
      notes: analysisNotes
    });

    return {
      commonTasks: commonTaskIds.size,
      uniqueToPreferredStaff,
      uniqueToSkill,
      totalDifference: Math.abs(preferredStaffTasks.length - skillTasks.length),
      hoursDifference,
      analysisNotes
    };
  }
}
