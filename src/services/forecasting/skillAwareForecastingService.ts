
import { 
  ForecastData, 
  SkillHours,
  ForecastParameters 
} from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { SkillsIntegrationService } from './skillsIntegrationService';
import { debugLog } from './logger';
import { supabase } from '@/integrations/supabase/client';
import { addMonths, startOfMonth, format } from 'date-fns';

/**
 * Skill-Aware Forecasting Service (Phase 3: Client Filtering Enhanced)
 * 
 * Generates demand and capacity forecasts that are aware of actual database skills
 * and can filter by specific clients.
 * 
 * Key Features:
 * - Uses only skills that exist in the database
 * - Filters forecasts by selected clients when specified
 * - Generates realistic data distributions across skills
 * - Maintains backward compatibility
 */
export class SkillAwareForecastingService {
  
  /**
   * Generate demand forecast with optional client filtering
   */
  static async generateDemandForecast(
    startDate: Date,
    endDate: Date,
    clientIds?: string[]
  ): Promise<ForecastData[]> {
    debugLog('=== PHASE 3 SKILL-AWARE DEMAND FORECAST START ===');
    debugLog('Generating demand forecast with client filtering:', {
      startDate,
      endDate,
      hasClientFilter: !!clientIds,
      clientCount: clientIds?.length || 0,
      clientIds
    });

    const availableSkills = await SkillsIntegrationService.getAvailableSkills();
    
    if (availableSkills.length === 0) {
      debugLog('Phase 3: No skills available for demand forecast');
      return [];
    }

    // Generate demand data based on recurring tasks and task instances
    const demandData = await this.generateDemandFromTasks(
      startDate,
      endDate,
      availableSkills,
      clientIds
    );

    debugLog('Phase 3: Demand forecast generated with client filtering:', {
      periodsGenerated: demandData.length,
      clientFilterApplied: !!clientIds,
      skillsUsed: availableSkills.length,
      totalDemandHours: demandData.reduce((sum, period) => sum + (period.demandHours || 0), 0)
    });

    return demandData;
  }

  /**
   * Generate capacity forecast with optional client filtering
   */
  static async generateCapacityForecast(
    startDate: Date,
    endDate: Date,
    clientIds?: string[]
  ): Promise<ForecastData[]> {
    debugLog('=== PHASE 3 SKILL-AWARE CAPACITY FORECAST START ===');
    debugLog('Generating capacity forecast with client filtering context:', {
      startDate,
      endDate,
      hasClientFilter: !!clientIds,
      clientCount: clientIds?.length || 0,
      note: 'Capacity is staff-based, client filter affects demand allocation context'
    });

    const availableSkills = await SkillsIntegrationService.getAvailableSkills();
    
    if (availableSkills.length === 0) {
      debugLog('Phase 3: No skills available for capacity forecast');
      return [];
    }

    // Generate capacity data based on staff availability
    // Note: Capacity is inherently staff-based, but client context may affect allocation
    const capacityData = await this.generateCapacityFromStaff(
      startDate,
      endDate,
      availableSkills,
      clientIds
    );

    debugLog('Phase 3: Capacity forecast generated:', {
      periodsGenerated: capacityData.length,
      skillsUsed: availableSkills.length,
      totalCapacityHours: capacityData.reduce((sum, period) => sum + (period.capacityHours || 0), 0),
      clientContextApplied: !!clientIds
    });

    return capacityData;
  }

  /**
   * Generate demand data from tasks with client filtering
   */
  private static async generateDemandFromTasks(
    startDate: Date,
    endDate: Date,
    availableSkills: SkillType[],
    clientIds?: string[]
  ): Promise<ForecastData[]> {
    const periods: ForecastData[] = [];
    let currentDate = startOfMonth(startDate);

    debugLog('Phase 3: Generating demand from tasks with client filtering:', {
      availableSkills: availableSkills.length,
      clientFilterApplied: !!clientIds,
      clientCount: clientIds?.length || 0
    });

    // Fetch recurring tasks with optional client filtering
    let recurringTasksQuery = supabase
      .from('recurring_tasks')
      .select(`
        id,
        name,
        estimated_hours,
        required_skills,
        client_id,
        recurrence_type,
        is_active
      `)
      .eq('is_active', true);

    // Apply client filter if specified
    if (clientIds && clientIds.length > 0) {
      recurringTasksQuery = recurringTasksQuery.in('client_id', clientIds);
      debugLog('Phase 3: Applied client filter to recurring tasks query:', { clientIds });
    }

    const { data: recurringTasks } = await recurringTasksQuery;

    debugLog('Phase 3: Recurring tasks fetched:', {
      totalTasks: recurringTasks?.length || 0,
      clientFiltered: !!clientIds,
      filteredForClients: clientIds?.length || 'all'
    });

    while (currentDate <= endDate) {
      const periodKey = format(currentDate, 'yyyy-MM');
      
      const demandBySkill = this.calculateMonthlyDemandBySkill(
        recurringTasks || [],
        availableSkills,
        currentDate
      );

      const totalDemandHours = demandBySkill.reduce((sum, skill) => sum + skill.hours, 0);

      periods.push({
        period: periodKey,
        demand: demandBySkill,
        capacity: [], // Will be filled by capacity forecast
        demandHours: totalDemandHours,
        capacityHours: 0,
        gapHours: -totalDemandHours
      });

      currentDate = addMonths(currentDate, 1);
    }

    debugLog('Phase 3: Demand periods generated with client filtering:', {
      periodsCount: periods.length,
      totalDemandHours: periods.reduce((sum, p) => sum + (p.demandHours || 0), 0),
      clientFilterApplied: !!clientIds
    });

    return periods;
  }

  /**
   * Generate capacity data from staff with client context
   */
  private static async generateCapacityFromStaff(
    startDate: Date,
    endDate: Date,
    availableSkills: SkillType[],
    clientIds?: string[]
  ): Promise<ForecastData[]> {
    const periods: ForecastData[] = [];
    let currentDate = startOfMonth(startDate);

    debugLog('Phase 3: Generating capacity from staff:', {
      availableSkills: availableSkills.length,
      clientContext: !!clientIds,
      note: 'Capacity based on staff availability, client context for allocation'
    });

    // Fetch staff data
    const { data: staffData } = await supabase
      .from('staff')
      .select(`
        id,
        full_name,
        assigned_skills,
        cost_per_hour,
        status
      `)
      .eq('status', 'Active');

    debugLog('Phase 3: Staff data fetched for capacity:', {
      totalStaff: staffData?.length || 0,
      availableSkills: availableSkills.length
    });

    while (currentDate <= endDate) {
      const periodKey = format(currentDate, 'yyyy-MM');
      
      const capacityBySkill = this.calculateMonthlyCapacityBySkill(
        staffData || [],
        availableSkills,
        currentDate
      );

      const totalCapacityHours = capacityBySkill.reduce((sum, skill) => sum + skill.hours, 0);

      periods.push({
        period: periodKey,
        demand: [], // Will be filled by demand forecast
        capacity: capacityBySkill,
        demandHours: 0,
        capacityHours: totalCapacityHours,
        gapHours: totalCapacityHours
      });

      currentDate = addMonths(currentDate, 1);
    }

    debugLog('Phase 3: Capacity periods generated:', {
      periodsCount: periods.length,
      totalCapacityHours: periods.reduce((sum, p) => sum + (p.capacityHours || 0), 0)
    });

    return periods;
  }

  /**
   * Calculate monthly demand by skill from recurring tasks
   */
  private static calculateMonthlyDemandBySkill(
    recurringTasks: any[],
    availableSkills: SkillType[],
    month: Date
  ): SkillHours[] {
    const demandBySkill: Record<SkillType, number> = {};
    
    // Initialize all available skills
    availableSkills.forEach(skill => {
      demandBySkill[skill] = 0;
    });

    // Calculate demand from recurring tasks
    recurringTasks.forEach(task => {
      const taskSkills = task.required_skills || [];
      const estimatedHours = Number(task.estimated_hours) || 0;
      
      // Get frequency multiplier based on recurrence type
      const frequencyMultiplier = this.getRecurrenceFrequency(task.recurrence_type);
      const monthlyHours = estimatedHours * frequencyMultiplier;
      
      // Distribute hours across required skills
      const validSkills = taskSkills.filter((skill: SkillType) => 
        availableSkills.includes(skill)
      );
      
      if (validSkills.length > 0) {
        const hoursPerSkill = monthlyHours / validSkills.length;
        validSkills.forEach((skill: SkillType) => {
          demandBySkill[skill] += hoursPerSkill;
        });
      }
    });

    return availableSkills.map(skill => ({
      skill,
      hours: Math.round(demandBySkill[skill] * 100) / 100 // Round to 2 decimal places
    }));
  }

  /**
   * Calculate monthly capacity by skill from staff
   */
  private static calculateMonthlyCapacityBySkill(
    staffData: any[],
    availableSkills: SkillType[],
    month: Date
  ): SkillHours[] {
    const capacityBySkill: Record<SkillType, number> = {};
    
    // Initialize all available skills
    availableSkills.forEach(skill => {
      capacityBySkill[skill] = 0;
    });

    // Calculate capacity from staff
    staffData.forEach(staff => {
      const staffSkills = staff.assigned_skills || [];
      const validStaffSkills = staffSkills.filter((skill: SkillType) => 
        availableSkills.includes(skill)
      );
      
      if (validStaffSkills.length > 0) {
        // Assume 160 hours per month (40 hours/week * 4 weeks)
        const monthlyCapacity = 160;
        const capacityPerSkill = monthlyCapacity / validStaffSkills.length;
        
        validStaffSkills.forEach((skill: SkillType) => {
          capacityBySkill[skill] += capacityPerSkill;
        });
      }
    });

    return availableSkills.map(skill => ({
      skill,
      hours: Math.round(capacityBySkill[skill] * 100) / 100 // Round to 2 decimal places
    }));
  }

  /**
   * Get recurrence frequency multiplier for monthly calculation
   */
  private static getRecurrenceFrequency(recurrenceType: string): number {
    switch (recurrenceType) {
      case 'daily': return 30; // 30 times per month
      case 'weekly': return 4; // 4 times per month
      case 'monthly': return 1; // 1 time per month
      case 'quarterly': return 1/3; // 1 time per 3 months
      case 'annually': return 1/12; // 1 time per 12 months
      default: return 1; // Default to monthly
    }
  }
}
