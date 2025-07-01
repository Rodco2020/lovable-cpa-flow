import { DemandMatrixData } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { SkillResolutionService } from '../skillResolutionService';
import { ClientResolutionService } from '../clientResolutionService';
import { UuidResolutionService } from '@/services/staff/uuidResolutionService';

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
 * Core transformation utilities for matrix data with skill name resolution, client name resolution, and staff name resolution
 */
export class MatrixTransformerCore {
  
  /**
   * Transform forecast data to matrix format with resolved skill names, client names, and staff names
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

    console.log('🔍 [MATRIX TRANSFORMER CORE] Starting transformation with client and staff resolution...');

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

    // Extract unique client IDs for batch resolution
    const allClientIds = [...new Set(tasks.map(task => task.client_id).filter(Boolean))];
    console.log('🔍 [MATRIX TRANSFORMER CORE] Resolving client IDs:', allClientIds);
    
    // Batch resolve client IDs to client names
    const clientResolutionMap = await ClientResolutionService.resolveClientIds(allClientIds);
    console.log('✅ [MATRIX TRANSFORMER CORE] Client resolution complete:', Array.from(clientResolutionMap.entries()));

    // ENHANCED: Extract unique staff IDs for batch resolution
    const allStaffIds = [...new Set(tasks.map(task => task.preferred_staff_id).filter(Boolean))];
    console.log('🔍 [MATRIX TRANSFORMER CORE] Resolving staff IDs:', allStaffIds);
    
    // ENHANCED: Batch resolve staff UUIDs to staff names
    const staffResolutionMap = new Map<string, string>();
    if (allStaffIds.length > 0) {
      try {
        const allStaff = await UuidResolutionService.getAllStaff();
        allStaffIds.forEach(staffId => {
          const staff = allStaff.find(s => s.id === staffId);
          if (staff) {
            staffResolutionMap.set(staffId, staff.full_name);
            console.log(`✅ [MATRIX TRANSFORMER CORE] Staff resolution: ${staffId} -> ${staff.full_name}`);
          } else {
            console.warn(`⚠️ [MATRIX TRANSFORMER CORE] Staff not found for ID: ${staffId}`);
            staffResolutionMap.set(staffId, `Staff ${staffId.substring(0, 8)}...`);
          }
        });
      } catch (error) {
        console.error('❌ [MATRIX TRANSFORMER CORE] Error resolving staff names:', error);
        // Fallback to truncated UUIDs
        allStaffIds.forEach(staffId => {
          staffResolutionMap.set(staffId, `Staff ${staffId.substring(0, 8)}...`);
        });
      }
    }
    console.log('✅ [MATRIX TRANSFORMER CORE] Staff resolution complete:', Array.from(staffResolutionMap.entries()));

    // Generate basic data points with resolved skill names, client names, and staff names
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
          
          // Create task breakdown with resolved client names and staff names
          const taskBreakdown = skillTasks.map(task => {
            const resolvedClientName = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
            
            // ENHANCED: Resolve staff names using the staff resolution map
            const resolvedStaffName = task.preferred_staff_id 
              ? staffResolutionMap.get(task.preferred_staff_id) || `Staff ${task.preferred_staff_id.substring(0, 8)}...`
              : undefined;
            
            console.log(`🔍 [MATRIX TRANSFORMER CORE] Task breakdown enhanced: ${task.client_id} -> ${resolvedClientName}, Staff: ${task.preferred_staff_id} -> ${resolvedStaffName}`);
            
            return {
              clientId: task.client_id,
              clientName: resolvedClientName, // Use resolved client name
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
              preferredStaffName: resolvedStaffName // ENHANCED: Use resolved staff name instead of fallback
            };
          });
          
          dataPoints.push({
            skillType: resolvedSkill, // Use resolved skill name
            month: month.key,
            monthLabel: month.label,
            demandHours: totalHours,
            totalHours: totalHours,
            taskCount: skillTasks.length,
            clientCount: new Set(skillTasks.map(task => task.client_id)).size,
            taskBreakdown
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

    // Generate client totals using resolved names
    const clientTotals = new Map<string, number>();
    const clientRevenue = new Map<string, number>();
    
    for (const task of tasks) {
      const resolvedClientName = clientResolutionMap.get(task.client_id) || `Client ${task.client_id.substring(0, 8)}...`;
      const currentTotal = clientTotals.get(resolvedClientName) || 0;
      clientTotals.set(resolvedClientName, currentTotal + (task.estimated_hours || 0));
      
      // Initialize revenue data if not present
      if (!clientRevenue.has(resolvedClientName)) {
        clientRevenue.set(resolvedClientName, 0);
      }
    }

    console.log('✅ [MATRIX TRANSFORMER CORE] Transformation complete with client and staff resolution:', {
      totalDataPoints: dataPoints.length,
      resolvedClients: clientResolutionMap.size,
      resolvedStaff: staffResolutionMap.size,
      clientTotalsEntries: clientTotals.size
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
      clientRevenue,
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
