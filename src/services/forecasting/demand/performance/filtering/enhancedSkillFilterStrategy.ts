
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { SkillFilterStrategy } from './skillFilterStrategy';

/**
 * Enhanced Skill Filter Strategy with Cross-Filter Comparison Debugging
 * 
 * Extends the base SkillFilterStrategy with comprehensive debugging capabilities
 * to compare skill-based filtering against staff-based filtering results.
 */
export class EnhancedSkillFilterStrategy extends SkillFilterStrategy {
  constructor() {
    super();
  }

  getName(): string {
    return 'EnhancedSkillFilter';
  }

  /**
   * Enhanced apply method with cross-filter comparison debugging
   */
  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    if (!this.shouldApply(filters)) {
      console.log(`🎯 [ENHANCED SKILL FILTER] No skill filtering needed - showing all skills`);
      return data;
    }

    console.log(`🚀 [ENHANCED SKILL FILTER] Starting enhanced skill filtering with cross-comparison debugging`);
    console.log(`🎯 [ENHANCED SKILL FILTER] Target skills:`, filters.skills);

    const skillSet = new Set(filters.skills!);
    const filteredDataPoints = [];
    let totalProcessedTasks = 0;
    let totalMatchedTasks = 0;

    // Process each data point with enhanced debugging
    data.dataPoints.forEach((dataPoint, dpIndex) => {
      const shouldInclude = this.shouldIncludeDataPointWithDebug(dataPoint, skillSet, dpIndex);
      
      if (shouldInclude) {
        filteredDataPoints.push(dataPoint);
        
        // Count tasks for detailed analysis
        if (dataPoint.taskBreakdown) {
          const matchedTasks = dataPoint.taskBreakdown.filter(task => skillSet.has(task.skillType));
          totalMatchedTasks += matchedTasks.length;
        }
      }
      
      // Count all processed tasks
      if (dataPoint.taskBreakdown) {
        totalProcessedTasks += dataPoint.taskBreakdown.length;
      }
    });

    console.log(`📊 [ENHANCED SKILL FILTER] Filtering summary:`, {
      originalDataPoints: data.dataPoints.length,
      filteredDataPoints: filteredDataPoints.length,
      totalProcessedTasks,
      totalMatchedTasks,
      filterEfficiency: `${((totalMatchedTasks / totalProcessedTasks) * 100).toFixed(1)}%`
    });

    const result = this.recalculateTotals(data, filteredDataPoints);
    
    console.log(`✅ [ENHANCED SKILL FILTER] Enhanced filtering complete:`, {
      resultDataPoints: result.dataPoints.length,
      totalDemand: result.totalDemand,
      totalTasks: result.totalTasks
    });

    return result;
  }

  /**
   * Enhanced data point filtering with cross-comparison debugging
   */
  private shouldIncludeDataPointWithDebug(
    dataPoint: any, 
    skillSet: Set<string>, 
    dataPointIndex: number
  ): boolean {
    console.log(`🔍 [ENHANCED SKILL FILTER - DP ${dataPointIndex}] Processing dataPoint:`, {
      skillType: dataPoint.skillType,
      month: dataPoint.monthLabel,
      demandHours: dataPoint.demandHours,
      taskCount: dataPoint.taskCount,
      hasTaskBreakdown: !!dataPoint.taskBreakdown
    });

    // Check if dataPoint's skill type matches our filter
    const skillMatches = skillSet.has(dataPoint.skillType);
    
    console.log(`🎯 [ENHANCED SKILL FILTER - DP ${dataPointIndex}] Skill comparison:`, {
      dataPointSkill: dataPoint.skillType,
      targetSkills: Array.from(skillSet),
      skillMatches: skillMatches ? 'MATCH' : 'NO MATCH'
    });

    if (!skillMatches) {
      console.log(`❌ [ENHANCED SKILL FILTER - DP ${dataPointIndex}] Excluding - skill mismatch`);
      return false;
    }

    // Cross-comparison: Analyze what staff would match this data point
    if (dataPoint.taskBreakdown && dataPoint.taskBreakdown.length > 0) {
      console.log(`🔍 [ENHANCED SKILL FILTER - DP ${dataPointIndex}] Cross-comparison analysis:`);
      
      const staffWithTasks = new Map<string, number>();
      const tasksWithPreferredStaff = [];
      const tasksWithoutPreferredStaff = [];

      dataPoint.taskBreakdown.forEach((task: any, taskIndex: number) => {
        if (task.preferredStaffId && task.preferredStaffName) {
          tasksWithPreferredStaff.push(task);
          
          const currentCount = staffWithTasks.get(task.preferredStaffName) || 0;
          staffWithTasks.set(task.preferredStaffName, currentCount + 1);
          
          console.log(`👤 [ENHANCED SKILL FILTER - DP ${dataPointIndex} - Task ${taskIndex}] Staff assignment:`, {
            taskName: task.taskName,
            clientName: task.clientName,
            preferredStaffName: task.preferredStaffName,
            preferredStaffId: task.preferredStaffId,
            skillType: task.skillType
          });
        } else {
          tasksWithoutPreferredStaff.push(task);
          
          console.log(`⚪ [ENHANCED SKILL FILTER - DP ${dataPointIndex} - Task ${taskIndex}] No staff assignment:`, {
            taskName: task.taskName,
            clientName: task.clientName,
            skillType: task.skillType
          });
        }
      });

      console.log(`📈 [ENHANCED SKILL FILTER - DP ${dataPointIndex}] Staff distribution:`, {
        totalTasks: dataPoint.taskBreakdown.length,
        tasksWithStaff: tasksWithPreferredStaff.length,
        tasksWithoutStaff: tasksWithoutPreferredStaff.length,
        uniqueStaffMembers: staffWithTasks.size,
        staffDistribution: Object.fromEntries(staffWithTasks)
      });

      // Special logging for Marciano, Maria, and Luis
      const targetStaff = ['Marciano Urbaez', 'Maria Vargas', 'Luis Rodriguez'];
      targetStaff.forEach(staffName => {
        const taskCount = staffWithTasks.get(staffName) || 0;
        if (taskCount > 0) {
          console.log(`🎯 [ENHANCED SKILL FILTER - DP ${dataPointIndex}] ${staffName} analysis:`, {
            tasksAssigned: taskCount,
            skillType: dataPoint.skillType,
            monthLabel: dataPoint.monthLabel,
            wouldMatchStaffFilter: 'YES - has preferred staff assignments'
          });
        }
      });
    }

    console.log(`✅ [ENHANCED SKILL FILTER - DP ${dataPointIndex}] Including dataPoint - skill matches`);
    return true;
  }
}
