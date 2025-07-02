import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { SkillResolutionService } from '../skillResolutionService';
import { ClientResolutionService } from '../clientResolutionService';
import { UuidResolutionService } from '@/services/staff/uuidResolutionService';
import { MonthlyDemandCalculationService } from './monthlyDemandCalculationService';
import { StaffBasedAggregationService } from '../staffBasedAggregationService';
import { MatrixRevenueCalculator } from './matrixRevenueCalculator';

export interface SkillHours {
  skillType: string;
  hours: number;
}

export interface FilterContext {
  hasStaffFilter?: boolean;
  hasSkillFilter?: boolean;
  preferredStaffIds?: string[];
  skillTypes?: string[];
}

/**
 * Matrix Transformer Core - FIXED
 * 
 * Fixed transformation utilities that ensure tasks only appear in their correct months
 * and staff-based filtering shows individual staff results (not grouped by skill).
 */
export class MatrixTransformerCore {
  
  /**
   * FIXED: Transform forecast data to matrix format with proper staff-based aggregation
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    filterContext?: FilterContext
  ): Promise<DemandMatrixData> {
    // Basic validation
    if (!forecastData || !tasks) {
      return {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {},
        clientTotals: new Map(),
        clientRevenue: new Map(),
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        },
        aggregationStrategy: filterContext?.hasStaffFilter ? 'staff-based' : 'skill-based'
      };
    }

    console.log('🔍 [MATRIX TRANSFORMER CORE] FIXED: Starting transformation with staff-based aggregation fix...');

    // Extract months from forecast data
    const months = forecastData.map(fd => ({
      key: fd.period,
      label: fd.period
    }));

    // FIXED: Handle staff-based vs skill-based aggregation differently
    if (filterContext?.hasStaffFilter && filterContext.preferredStaffIds?.length) {
      console.log('👨‍💼 [MATRIX TRANSFORMER CORE] FIXED: Using staff-based aggregation for individual staff filtering');
      return await this.transformWithStaffBasedAggregation(
        forecastData,
        tasks,
        filterContext.preferredStaffIds,
        months
      );
    } else {
      console.log('🎯 [MATRIX TRANSFORMER CORE] FIXED: Using skill-based aggregation for general filtering');
      return await this.transformWithSkillBasedAggregation(
        forecastData,
        tasks,
        filterContext,
        months
      );
    }
  }

  /**
   * FIXED: Staff-based transformation using the fixed aggregation service
   */
  private static async transformWithStaffBasedAggregation(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    staffIds: string[],
    months: { key: string; label: string }[]
  ): Promise<DemandMatrixData> {
    console.log('👨‍💼 [MATRIX TRANSFORMER CORE] FIXED: Executing staff-based transformation');

    // FIXED: Filter tasks to only those assigned to selected staff
    const staffTasks = StaffBasedAggregationService.filterTasksForStaff(tasks, staffIds);
    
    // Resolve staff member information
    const staffMembers = await StaffBasedAggregationService.resolveStaffMembers(staffIds);
    
    // FIXED: Generate staff-specific data points using the fixed aggregation
    const dataPoints = await StaffBasedAggregationService.generateStaffSpecificDataPoints(
      forecastData,
      staffTasks,
      staffMembers
    );

    // Extract skills (which are actually staff names in staff-based mode)
    const skills = [...new Set(dataPoints.map(dp => dp.skillType))];

    // Calculate totals and summaries
    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const uniqueClients = new Set(
      dataPoints.flatMap(dp => dp.taskBreakdown.map(tb => tb.clientId))
    );

    // Generate skill summary (staff summary in this case)
    const skillSummary: Record<string, any> = {};
    staffMembers.forEach(staff => {
      const staffDataPoints = dataPoints.filter(dp => dp.actualStaffId === staff.id);
      skillSummary[staff.name] = {
        totalHours: staffDataPoints.reduce((sum, dp) => sum + dp.totalHours, 0),
        demandHours: staffDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
        taskCount: staffDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0),
        clientCount: new Set(staffDataPoints.flatMap(dp => dp.taskBreakdown.map(tb => tb.clientId))).size,
        totalSuggestedRevenue: 0,
        totalExpectedLessSuggested: 0,
        averageFeeRate: 0
      };
    });

    // Batch resolve client information for totals
    const allClientIds = [...new Set(staffTasks.map(task => task.client_id))];
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(allClientIds);
    
    // Generate client totals using resolved names
    const clientTotals = new Map<string, number>();
    const clientRevenue = new Map<string, number>();
    
    for (const task of staffTasks) {
      const resolvedClientName = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
      
      // Calculate total hours across all months where task appears
      let totalTaskHours = 0;
      for (const month of months) {
        const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, month.key);
        totalTaskHours += monthlyDemand.monthlyHours;
      }
      
      const currentTotal = clientTotals.get(resolvedClientName) || 0;
      clientTotals.set(resolvedClientName, currentTotal + totalTaskHours);
      
      if (!clientRevenue.has(resolvedClientName)) {
        clientRevenue.set(resolvedClientName, 0);
      }
    }

    console.log('✅ [MATRIX TRANSFORMER CORE] FIXED: Staff-based transformation complete:', {
      totalDataPoints: dataPoints.length,
      staffMembers: staffMembers.length,
      uniqueClients: uniqueClients.size,
      clientTotalsEntries: clientTotals.size,
      staffSpecificDataPoints: dataPoints.filter(dp => dp.isStaffSpecific).length
    });

    // REVENUE CALCULATION INTEGRATION - Staff-based aggregation
    try {
      console.log('💰 [MATRIX TRANSFORMER CORE] Starting revenue calculations for staff-based aggregation...');
      const revenueData = await MatrixRevenueCalculator.calculateMatrixRevenue(dataPoints, months);
      
      // Enhance skill summaries with revenue information
      const enhancedSkillSummaries = MatrixRevenueCalculator.enhanceSkillSummaryWithRevenue(
        skillSummary,
        revenueData.skillFeeRates,
        dataPoints
      );
      
      console.log('✅ [MATRIX TRANSFORMER CORE] Revenue calculations completed for staff-based aggregation:', {
        clientsWithRevenue: revenueData.clientRevenue.size,
        totalExpectedRevenue: revenueData.revenueTotals.totalExpectedRevenue,
        totalSuggestedRevenue: revenueData.revenueTotals.totalSuggestedRevenue
      });

      return {
        months,
        skills,
        dataPoints,
        totalDemand,
        totalTasks,
        totalClients: uniqueClients.size,
        skillSummary: enhancedSkillSummaries,
        clientTotals,
        clientRevenue: revenueData.clientRevenue,
        clientHourlyRates: revenueData.clientHourlyRates,
        clientSuggestedRevenue: revenueData.clientSuggestedRevenue,
        clientExpectedLessSuggested: revenueData.clientExpectedLessSuggested,
        revenueTotals: revenueData.revenueTotals,
        aggregationStrategy: 'staff-based'
      };
    } catch (error) {
      console.error('❌ [MATRIX TRANSFORMER CORE] Revenue calculation failed for staff-based aggregation:', error);
      // Return matrix with existing empty revenue maps as fallback
      return {
        months,
        skills,
        dataPoints,
        totalDemand,
        totalTasks,
        totalClients: uniqueClients.size,
        skillSummary,
        clientTotals,
        clientRevenue,
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        },
        aggregationStrategy: 'staff-based'
      };
    }
  }

  /**
   * FIXED: Skill-based transformation (existing logic preserved)
   */
  private static async transformWithSkillBasedAggregation(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    filterContext?: FilterContext,
    months?: { key: string; label: string }[]
  ): Promise<DemandMatrixData> {
    
    // Extract and resolve skills to display names
    const skillsFromForecast = forecastData.flatMap(fd => 
      fd.demand?.map(d => d.skill) || []
    );
    const skillsFromTasks = tasks.flatMap(task => task.required_skills || []);
    const allSkillRefs = [...new Set([...skillsFromForecast, ...skillsFromTasks])];
    
    // Resolve skill UUIDs to display names
    const resolvedSkills = await this.resolveSkillReferences(allSkillRefs);
    const skills = Array.from(new Set(resolvedSkills));

    // Batch resolve client and staff information
    const allClientIds = [...new Set(tasks.map(task => task.client_id).filter(Boolean))];
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(allClientIds);
    
    const allStaffIds = [...new Set(tasks.map(task => task.preferred_staff_id).filter(Boolean))];
    const staffResolutionMap = new Map<string, string>();
    if (allStaffIds.length > 0) {
      try {
        const allStaff = await UuidResolutionService.getAllStaff();
        allStaffIds.forEach(staffId => {
          const staff = allStaff.find(s => s.id === staffId);
          if (staff) {
            staffResolutionMap.set(staffId, staff.full_name);
          } else {
            staffResolutionMap.set(staffId, `Staff ${staffId.substring(0, 8)}...`);
          }
        });
      } catch (error) {
        console.error('❌ [MATRIX TRANSFORMER CORE] Error resolving staff names:', error);
        allStaffIds.forEach(staffId => {
          staffResolutionMap.set(staffId, `Staff ${staffId.substring(0, 8)}...`);
        });
      }
    }

    // Generate data points with proper monthly demand calculation
    const dataPoints = [];
    
    // Create skill-to-UUID mapping for filtering
    const skillMapping = new Map<string, string>();
    for (let i = 0; i < allSkillRefs.length; i++) {
      skillMapping.set(allSkillRefs[i], resolvedSkills[i]);
    }

    for (const month of months!) {
      for (const skill of skills) {
        // Find tasks that require this skill and are due in this month
        const skillTasks = tasks.filter(task => {
          // Check if task requires this skill
          const taskSkills = Array.isArray(task.required_skills) ? task.required_skills : [];
          const hasSkill = taskSkills.some(taskSkill => {
            const mappedSkill = skillMapping.get(taskSkill);
            return mappedSkill === skill || taskSkill === skill;
          });
          
          if (!hasSkill) return false;
          
          // Check if task is due in this specific month
          return MonthlyDemandCalculationService.shouldTaskAppearInMonth(task, month.key);
        });

        if (skillTasks.length > 0) {
          // Calculate total demand for this skill in this month
          let totalDemand = 0;
          const taskBreakdown = [];

          for (const task of skillTasks) {
            // Calculate actual monthly demand for this specific month
            const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, month.key);
            
            if (monthlyDemand.monthlyHours > 0) {
              totalDemand += monthlyDemand.monthlyHours;
              
              const resolvedClientName = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
              const resolvedStaffName = task.preferred_staff_id 
                ? staffResolutionMap.get(task.preferred_staff_id) || `Staff ${task.preferred_staff_id.substring(0, 8)}...`
                : undefined;
              
              taskBreakdown.push({
                clientId: task.client_id,
                clientName: resolvedClientName,
                recurringTaskId: task.id,
                taskName: task.name,
                skillType: skill,
                estimatedHours: task.estimated_hours,
                recurrencePattern: {
                  type: task.recurrence_type || 'monthly',
                  interval: task.recurrence_interval || 1,
                  frequency: monthlyDemand.monthlyOccurrences
                },
                monthlyHours: monthlyDemand.monthlyHours,
                preferredStaffId: task.preferred_staff_id,
                preferredStaffName: resolvedStaffName
              });
            }
          }

          // Only create data point if there's actual demand
          if (totalDemand > 0) {
            dataPoints.push({
              skillType: skill,
              month: month.key,
              monthLabel: month.label,
              demandHours: totalDemand,
              totalHours: totalDemand,
              taskCount: taskBreakdown.length,
              clientCount: new Set(taskBreakdown.map(tb => tb.clientId)).size,
              taskBreakdown
            });
          }
        }
      }
    }

    // Calculate totals and summaries
    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const uniqueClients = new Set(tasks.map(task => task.client_id));

    // Generate skill summary
    const skillSummary: Record<string, any> = {};
    skills.forEach(skill => {
      const skillDataPoints = dataPoints.filter(dp => dp.skillType === skill);
      skillSummary[skill] = {
        totalHours: skillDataPoints.reduce((sum, dp) => sum + dp.totalHours, 0),
        demandHours: skillDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
        taskCount: skillDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0),
        clientCount: uniqueClients.size,
        totalSuggestedRevenue: 0,
        totalExpectedLessSuggested: 0,
        averageFeeRate: 0
      };
    });

    // Generate client totals using resolved names
    const clientTotals = new Map<string, number>();
    const clientRevenue = new Map<string, number>();
    
    for (const task of tasks) {
      const resolvedClientName = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
      
      // Calculate total hours across all months where task appears
      let totalTaskHours = 0;
      for (const month of months!) {
        const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, month.key);
        totalTaskHours += monthlyDemand.monthlyHours;
      }
      
      const currentTotal = clientTotals.get(resolvedClientName) || 0;
      clientTotals.set(resolvedClientName, currentTotal + totalTaskHours);
      
      if (!clientRevenue.has(resolvedClientName)) {
        clientRevenue.set(resolvedClientName, 0);
      }
    }

    console.log('✅ [MATRIX TRANSFORMER CORE] FIXED: Skill-based transformation complete:', {
      totalDataPoints: dataPoints.length,
      resolvedClients: clientResolutionMap.size,
      resolvedStaff: staffResolutionMap.size,
      clientTotalsEntries: clientTotals.size,
      averageDataPointsPerMonth: (dataPoints.length / months!.length).toFixed(2)
    });

    // REVENUE CALCULATION INTEGRATION - Skill-based aggregation
    try {
      console.log('💰 [MATRIX TRANSFORMER CORE] Starting revenue calculations for skill-based aggregation...');
      const revenueData = await MatrixRevenueCalculator.calculateMatrixRevenue(dataPoints, months!);
      
      // Enhance skill summaries with revenue information
      const enhancedSkillSummaries = MatrixRevenueCalculator.enhanceSkillSummaryWithRevenue(
        skillSummary,
        revenueData.skillFeeRates,
        dataPoints
      );
      
      console.log('✅ [MATRIX TRANSFORMER CORE] Revenue calculations completed for skill-based aggregation:', {
        clientsWithRevenue: revenueData.clientRevenue.size,
        totalExpectedRevenue: revenueData.revenueTotals.totalExpectedRevenue,
        totalSuggestedRevenue: revenueData.revenueTotals.totalSuggestedRevenue
      });

      return {
        months: months!,
        skills,
        dataPoints,
        totalDemand,
        totalTasks,
        totalClients: uniqueClients.size,
        skillSummary: enhancedSkillSummaries,
        clientTotals,
        clientRevenue: revenueData.clientRevenue,
        clientHourlyRates: revenueData.clientHourlyRates,
        clientSuggestedRevenue: revenueData.clientSuggestedRevenue,
        clientExpectedLessSuggested: revenueData.clientExpectedLessSuggested,
        revenueTotals: revenueData.revenueTotals,
        aggregationStrategy: 'skill-based'
      };
    } catch (error) {
      console.error('❌ [MATRIX TRANSFORMER CORE] Revenue calculation failed for skill-based aggregation:', error);
      // Return matrix with existing empty revenue maps as fallback
      return {
        months: months!,
        skills,
        dataPoints,
        totalDemand,
        totalTasks,
        totalClients: uniqueClients.size,
        skillSummary,
        clientTotals,
        clientRevenue,
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        },
        aggregationStrategy: 'skill-based'
      };
    }
  }

  private static async resolveSkillReferences(skillRefs: string[]): Promise<string[]> {
    try {
      console.log('🔍 [MATRIX TRANSFORMER] Resolving skill references:', skillRefs);
      
      const resolvedSkills = await Promise.all(
        skillRefs.map(async (skillRef) => {
          if (this.isUUID(skillRef)) {
            // It's a UUID - resolve to display name
            const displayNames = await SkillResolutionService.getSkillNames([skillRef]);
            const resolvedName = displayNames[0] || skillRef;
            console.log(`🔍 [MATRIX TRANSFORMER] UUID ${skillRef} -> ${resolvedName}`);
            return resolvedName;
          } else {
            // It's already a display name
            console.log(`🔍 [MATRIX TRANSFORMER] Display name preserved: ${skillRef}`);
            return skillRef;
          }
        })
      );

      console.log('✅ [MATRIX TRANSFORMER] Skill resolution complete:', {
        originalRefs: skillRefs,
        resolvedSkills: resolvedSkills
      });

      return resolvedSkills;
    } catch (error) {
      console.error('❌ [MATRIX TRANSFORMER] Error resolving skill references:', error);
      // Fallback to original references
      return skillRefs;
    }
  }

  /**
   * Check if a string is a UUID
   */
  private static isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
  
  /**
   * Transform skill hours data
   */
  static transformSkillHours(skillHours: SkillHours[]): SkillHours[] {
    if (!skillHours || !Array.isArray(skillHours)) {
      return [];
    }
    
    return skillHours.map(item => ({
      skillType: item.skillType,
      hours: item.hours
    }));
  }
  
  /**
   * Aggregate skill hours by skill type
   */
  static aggregateSkillHours(skillHours: SkillHours[]): Map<string, number> {
    const aggregated = new Map<string, number>();
    
    skillHours.forEach(item => {
      const currentTotal = aggregated.get(item.skillType) || 0;
      aggregated.set(item.skillType, currentTotal + item.hours);
    });
    
    return aggregated;
  }
  
  /**
   * Filter skill hours by minimum threshold
   */
  static filterByMinimumHours(skillHours: SkillHours[], minimumHours: number): SkillHours[] {
    return skillHours.filter(item => item.hours >= minimumHours);
  }
}
