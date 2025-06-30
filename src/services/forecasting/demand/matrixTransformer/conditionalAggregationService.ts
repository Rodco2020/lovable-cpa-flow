
import { DemandDataPoint } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { StaffBasedAggregationService } from './staffBasedAggregationService';
import { DataPointGenerationService } from './dataPointGenerationService';
import { RevenueEnhancedDataPointContext } from './types';
import { debugLog } from '../../logger';

/**
 * Conditional Aggregation Service - ENHANCED WITH COMPREHENSIVE VERIFICATION LOGGING
 * 
 * Determines the appropriate aggregation strategy based on active filters:
 * - Staff filtering active → aggregate by individual staff members
 * - Skill filtering active → aggregate by skill types
 * - Both active → aggregate by staff within skill
 * - Neither active → use default skill-based aggregation
 */
export class ConditionalAggregationService {
  /**
   * Generate data points using the appropriate aggregation strategy
   * ENHANCED: Comprehensive verification logging
   */
  static async generateDataPointsWithConditionalAggregation(
    context: RevenueEnhancedDataPointContext,
    activeFilters?: {
      hasStaffFilter: boolean;
      hasSkillFilter: boolean;
      preferredStaffIds: string[];
      skillTypes: string[];
    }
  ): Promise<DemandDataPoint[]> {
    const { forecastData, tasks, skills, skillMapping } = context;
    
    console.log(`🔍 [VERIFICATION - CONDITIONAL AGGREGATION] ========= STARTING AGGREGATION STRATEGY DETERMINATION =========`);
    console.log(`🔍 [VERIFICATION - CONDITIONAL AGGREGATION] Context:`, {
      forecastPeriods: forecastData.length,
      totalTasks: tasks.length,
      availableSkills: skills.length,
      skillMappingSize: skillMapping.size,
      activeFilters: activeFilters || 'NO FILTERS PROVIDED'
    });
    
    // Enhanced filter analysis
    const filterAnalysis = {
      hasStaffFilter: activeFilters?.hasStaffFilter || false,
      hasSkillFilter: activeFilters?.hasSkillFilter || false,
      staffFilterCount: activeFilters?.preferredStaffIds?.length || 0,
      skillFilterCount: activeFilters?.skillTypes?.length || 0,
      preferredStaffIds: activeFilters?.preferredStaffIds || [],
      skillTypes: activeFilters?.skillTypes || []
    };
    
    console.log(`🎯 [VERIFICATION - CONDITIONAL AGGREGATION] Filter Analysis:`, filterAnalysis);
    
    debugLog('Determining aggregation strategy - VERIFICATION MODE', filterAnalysis);
    
    // CRITICAL DECISION POINT - Log the exact decision logic
    if (activeFilters?.hasStaffFilter) {
      console.log(`✅ [VERIFICATION - CONDITIONAL AGGREGATION] DECISION: Using STAFF-BASED aggregation`);
      console.log(`🚀 [VERIFICATION - CONDITIONAL AGGREGATION] Reason: Staff filter is active (hasStaffFilter = true)`);
      console.log(`👥 [VERIFICATION - CONDITIONAL AGGREGATION] Staff IDs being filtered: ${JSON.stringify(activeFilters.preferredStaffIds)}`);
      
      const staffBasedResult = await this.generateStaffBasedDataPoints(forecastData, tasks, skillMapping);
      
      console.log(`🏁 [VERIFICATION - CONDITIONAL AGGREGATION] STAFF-BASED RESULT:`, {
        totalDataPoints: staffBasedResult.length,
        dataPointTypes: staffBasedResult.map(dp => ({
          skillType: dp.skillType,
          isStaffSpecific: dp.isStaffSpecific,
          actualStaffId: dp.actualStaffId,
          actualStaffName: dp.actualStaffName,
          underlyingSkillType: dp.underlyingSkillType,
          demandHours: dp.demandHours,
          taskCount: dp.taskCount
        }))
      });
      
      return staffBasedResult;
    } else {
      console.log(`❌ [VERIFICATION - CONDITIONAL AGGREGATION] DECISION: Using SKILL-BASED aggregation`);
      console.log(`🔄 [VERIFICATION - CONDITIONAL AGGREGATION] Reason: No staff filter active (hasStaffFilter = false)`);
      
      const skillBasedResult = await DataPointGenerationService.generateDataPointsWithSkillMapping(context);
      
      console.log(`🏁 [VERIFICATION - CONDITIONAL AGGREGATION] SKILL-BASED RESULT:`, {
        totalDataPoints: skillBasedResult.length,
        skillTypes: skillBasedResult.map(dp => dp.skillType).filter((v, i, a) => a.indexOf(v) === i)
      });
      
      return skillBasedResult;
    }
  }
  
  /**
   * Generate staff-based data points for all forecast periods
   * ENHANCED: Detailed verification logging
   */
  private static async generateStaffBasedDataPoints(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint[]> {
    const allDataPoints: DemandDataPoint[] = [];
    
    console.log(`📊 [VERIFICATION - STAFF AGGREGATION] ========= GENERATING STAFF-BASED DATA POINTS =========`);
    console.log(`📊 [VERIFICATION - STAFF AGGREGATION] Input:`, {
      forecastPeriods: forecastData.length,
      totalTasks: tasks.length,
      tasksWithStaffAssignment: tasks.filter(t => t.preferred_staff_id).length,
      tasksWithoutStaffAssignment: tasks.filter(t => !t.preferred_staff_id).length
    });
    
    // Analyze tasks by staff assignment
    const tasksByStaff = new Map<string, RecurringTaskDB[]>();
    tasks.forEach(task => {
      if (task.preferred_staff_id) {
        const staffKey = `${task.preferred_staff_id}_${task.staff?.full_name || 'Unknown'}`;
        if (!tasksByStaff.has(staffKey)) {
          tasksByStaff.set(staffKey, []);
        }
        tasksByStaff.get(staffKey)!.push(task);
      }
    });
    
    console.log(`👥 [VERIFICATION - STAFF AGGREGATION] Staff Assignment Analysis:`, {
      uniqueStaffMembers: tasksByStaff.size,
      staffBreakdown: Array.from(tasksByStaff.entries()).map(([staffKey, staffTasks]) => ({
        staffKey,
        taskCount: staffTasks.length,
        staffId: staffTasks[0]?.preferred_staff_id,
        staffName: staffTasks[0]?.staff?.full_name
      }))
    });
    
    for (const forecastPeriod of forecastData) {
      try {
        console.log(`📅 [VERIFICATION - STAFF AGGREGATION] Processing period: ${forecastPeriod.period}`);
        
        const periodDataPoints = await StaffBasedAggregationService.generateStaffSpecificDataPoints(
          forecastPeriod,
          tasks,
          skillMapping
        );
        
        console.log(`✅ [VERIFICATION - STAFF AGGREGATION] Period ${forecastPeriod.period} results:`, {
          dataPointsGenerated: periodDataPoints.length,
          dataPointDetails: periodDataPoints.map(dp => ({
            skillType: dp.skillType,
            demandHours: dp.demandHours,
            taskCount: dp.taskCount,
            isStaffSpecific: dp.isStaffSpecific,
            actualStaffName: dp.actualStaffName,
            underlyingSkillType: dp.underlyingSkillType
          }))
        });
        
        allDataPoints.push(...periodDataPoints);
        
      } catch (error) {
        console.error(`❌ [VERIFICATION - STAFF AGGREGATION] Error generating data points for ${forecastPeriod.period}:`, error);
      }
    }
    
    console.log(`🏁 [VERIFICATION - STAFF AGGREGATION] ========= FINAL STAFF-BASED RESULTS =========`);
    console.log(`🏁 [VERIFICATION - STAFF AGGREGATION] Summary:`, {
      totalDataPoints: allDataPoints.length,
      staffSpecificDataPoints: allDataPoints.filter(dp => dp.isStaffSpecific).length,
      unassignedDataPoints: allDataPoints.filter(dp => dp.isUnassigned).length,
      uniqueStaffNames: [...new Set(allDataPoints.map(dp => dp.actualStaffName).filter(Boolean))],
      skillTypeBreakdown: allDataPoints.reduce((acc, dp) => {
        acc[dp.skillType] = (acc[dp.skillType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
    
    return allDataPoints;
  }
  
  /**
   * Detect if staff filtering should be active based on current context
   * ENHANCED: Detailed verification logging
   */
  static shouldUseStaffBasedAggregation(
    preferredStaffFilter: (string | number | null | undefined)[]
  ): boolean {
    console.log(`🔍 [VERIFICATION - AGGREGATION DETECTION] ========= ANALYZING STAFF FILTER =========`);
    console.log(`🔍 [VERIFICATION - AGGREGATION DETECTION] Input filter:`, {
      rawFilter: preferredStaffFilter,
      filterType: typeof preferredStaffFilter,
      isArray: Array.isArray(preferredStaffFilter),
      length: preferredStaffFilter?.length
    });
    
    const hasStaffFilter = preferredStaffFilter && 
                          preferredStaffFilter.length > 0 && 
                          preferredStaffFilter.some(id => id !== null && id !== undefined && String(id).trim() !== '');
    
    const validStaffIds = preferredStaffFilter?.filter(id => 
      id !== null && id !== undefined && String(id).trim() !== ''
    ) || [];
    
    console.log(`🎯 [VERIFICATION - AGGREGATION DETECTION] Analysis Results:`, {
      hasStaffFilter,
      validStaffIdsCount: validStaffIds.length,
      validStaffIds: validStaffIds.map(id => String(id)),
      shouldUseStaffAggregation: hasStaffFilter,
      decision: hasStaffFilter ? 'STAFF-BASED AGGREGATION' : 'SKILL-BASED AGGREGATION'
    });
    
    console.log(`🚀 [VERIFICATION - AGGREGATION DETECTION] FINAL DECISION: ${hasStaffFilter ? 'USE STAFF AGGREGATION' : 'USE SKILL AGGREGATION'}`);
    
    return hasStaffFilter;
  }
}
