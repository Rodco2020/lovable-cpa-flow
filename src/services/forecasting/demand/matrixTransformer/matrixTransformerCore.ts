
import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { SkillResolutionService } from '../skillResolutionService';

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
 * Matrix Transformer Core
 * 
 * Core transformation utilities for matrix data with skill name resolution
 */
export class MatrixTransformerCore {
  
  /**
   * Transform forecast data to matrix format with resolved skill names
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    filterContext?: FilterContext
  ): Promise<DemandMatrixData> {
    // Basic implementation - can be enhanced later
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

    // Extract months from forecast data
    const months = forecastData.map(fd => ({
      key: fd.period,
      label: fd.period
    }));

    // Extract and resolve skills to display names
    const skillsFromForecast = forecastData.flatMap(fd => 
      fd.demand?.map(d => d.skill) || []
    );
    const skillsFromTasks = tasks.flatMap(task => task.required_skills || []);
    const allSkillRefs = [...new Set([...skillsFromForecast, ...skillsFromTasks])];
    
    // Resolve skill UUIDs to display names
    const resolvedSkills = await this.resolveSkillReferences(allSkillRefs);
    const skills = Array.from(new Set(resolvedSkills));

    // Generate basic data points with resolved skill names
    const dataPoints = [];
    for (const month of months) {
      for (let i = 0; i < allSkillRefs.length; i++) {
        const skillRef = allSkillRefs[i];
        const resolvedSkill = resolvedSkills[i];
        
        const skillTasks = tasks.filter(task => 
          task.required_skills && task.required_skills.includes(skillRef)
        );
        
        if (skillTasks.length > 0) {
          const totalHours = skillTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
          
          dataPoints.push({
            skillType: resolvedSkill, // Use resolved skill name
            month: month.key,
            monthLabel: month.label,
            demandHours: totalHours,
            totalHours: totalHours,
            taskCount: skillTasks.length,
            clientCount: new Set(skillTasks.map(task => task.client_id)).size,
            taskBreakdown: skillTasks.map(task => ({
              clientId: task.client_id,
              clientName: `Client ${task.client_id}`,
              recurringTaskId: task.id,
              taskName: task.name,
              skillType: resolvedSkill, // Use resolved skill name
              estimatedHours: task.estimated_hours || 0,
              recurrencePattern: {
                type: task.recurrence_type || 'monthly',
                interval: task.recurrence_interval || 1,
                frequency: 1
              },
              monthlyHours: task.estimated_hours || 0,
              preferredStaffId: task.preferred_staff_id,
              preferredStaffName: task.preferred_staff_id ? `Staff ${task.preferred_staff_id}` : undefined
            }))
          });
        }
      }
    }

    // Calculate totals
    const totalDemand = dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const uniqueClients = new Set(tasks.map(task => task.client_id));

    // Generate skill summary with resolved names
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

    // Generate client totals
    const clientTotals = new Map<string, number>();
    tasks.forEach(task => {
      const currentTotal = clientTotals.get(task.client_id) || 0;
      clientTotals.set(task.client_id, currentTotal + (task.estimated_hours || 0));
    });

    return {
      months,
      skills,
      dataPoints,
      totalDemand,
      totalTasks,
      totalClients: uniqueClients.size,
      skillSummary,
      clientTotals,
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

  /**
   * Resolve skill references (UUIDs or names) to display names
   */
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
