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
   * 
   * CRITICAL FIX: undefined clientIds means "include all clients" (no filtering)
   */
  static async generateDemandForecast(
    startDate: Date,
    endDate: Date,
    clientIds?: string[]
  ): Promise<ForecastData[]> {
    debugLog('=== PHASE 3 SKILL-AWARE DEMAND FORECAST START WITH CLIENT FILTERING FIX ===');
    debugLog('Generating demand forecast with CLIENT FILTERING LOGIC FIX:', {
      startDate,
      endDate,
      hasClientFilter: !!clientIds,
      clientCount: clientIds?.length || 0,
      clientIds,
      filteringMode: clientIds ? `filter to ${clientIds.length} specific clients` : 'include all clients (no filtering)'
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
      clientIds // Pass undefined or array - service will handle appropriately
    );

    debugLog('Phase 3: Demand forecast generated with CLIENT FILTERING FIX:', {
      periodsGenerated: demandData.length,
      clientFilteringMode: clientIds ? 'filtered to specific clients' : 'all clients included',
      skillsUsed: availableSkills.length,
      totalDemandHours: demandData.reduce((sum, period) => sum + (period.demandHours || 0), 0)
    });

    return demandData;
  }

  /**
   * Generate capacity forecast with optional client filtering
   * 
   * CRITICAL FIX: undefined clientIds means "include all clients" (no filtering)
   */
  static async generateCapacityForecast(
    startDate: Date,
    endDate: Date,
    clientIds?: string[]
  ): Promise<ForecastData[]> {
    debugLog('=== PHASE 3 SKILL-AWARE CAPACITY FORECAST START WITH CLIENT FILTERING FIX ===');
    debugLog('Generating capacity forecast with CLIENT FILTERING LOGIC FIX:', {
      startDate,
      endDate,
      hasClientFilter: !!clientIds,
      clientCount: clientIds?.length || 0,
      note: 'Capacity is staff-based, client filter affects demand allocation context',
      filteringMode: clientIds ? `context for ${clientIds.length} specific clients` : 'context for all clients'
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
      clientIds // Pass undefined or array - service will handle appropriately
    );

    debugLog('Phase 3: Capacity forecast generated with CLIENT FILTERING FIX:', {
      periodsGenerated: capacityData.length,
      skillsUsed: availableSkills.length,
      totalCapacityHours: capacityData.reduce((sum, period) => sum + (period.capacityHours || 0), 0),
      clientContextMode: clientIds ? 'specific clients context' : 'all clients context'
    });

    return capacityData;
  }

  /**
   * Generate demand data from tasks with client filtering
   * 
   * CRITICAL FIX: undefined clientIds means "include all clients" (no WHERE IN clause)
   */
  private static async generateDemandFromTasks(
    startDate: Date,
    endDate: Date,
    availableSkills: SkillType[],
    clientIds?: string[]
  ): Promise<ForecastData[]> {
    const periods: ForecastData[] = [];
    let currentDate = startOfMonth(startDate);

    debugLog('Phase 3: Generating demand from tasks with CLIENT FILTERING FIX:', {
      availableSkills: availableSkills.length,
      clientFilteringMode: clientIds ? 'filtered to specific clients' : 'all clients included',
      clientCount: clientIds?.length || 'all'
    });

    // Fetch recurring tasks with PROPER client filtering logic
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

    // CRITICAL FIX: Only apply client filter when clientIds is explicitly provided
    if (clientIds && clientIds.length > 0) {
      recurringTasksQuery = recurringTasksQuery.in('client_id', clientIds);
      debugLog('Phase 3: Applied client filter to recurring tasks query (SPECIFIC CLIENTS):', { clientIds });
    } else {
      debugLog('Phase 3: NO client filter applied - including ALL CLIENTS in recurring tasks query');
    }

    const { data: recurringTasks } = await recurringTasksQuery;

    debugLog('Phase 3: Recurring tasks fetched with CLIENT FILTERING FIX:', {
      totalTasks: recurringTasks?.length || 0,
      clientFilteringMode: clientIds ? 'filtered to specific clients' : 'all clients included',
      filteredForClients: clientIds?.length || 'all clients'
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

    debugLog('Phase 3: Demand periods generated with CLIENT FILTERING FIX:', {
      periodsCount: periods.length,
      totalDemandHours: periods.reduce((sum, p) => sum + (p.demandHours || 0), 0),
      clientFilteringMode: clientIds ? 'filtered data' : 'all clients data'
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

    // Fetch staff data with corrected status filter
    const { data: staffData } = await supabase
      .from('staff')
      .select(`
        id,
        full_name,
        assigned_skills,
        cost_per_hour,
        status
      `)
      .eq('status', 'active'); // Use lowercase 'active' to match database

    debugLog('Phase 3: Staff data fetched for capacity with CORRECTED STATUS FILTER:', {
      totalStaff: staffData?.length || 0,
      availableSkills: availableSkills.length,
      statusFilter: 'active (lowercase)',
      staffFound: staffData?.map(s => ({ name: s.full_name, status: s.status })) || []
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
