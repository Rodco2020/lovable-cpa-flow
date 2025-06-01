
import { getClientRecurringTasks } from '@/services/clientTaskService';
import { getAllStaff } from '@/services/staffService';
import { SkillsIntegrationService } from './skillsIntegrationService';
import { normalizeSkills } from '../skillNormalizationService';
import { ForecastData, SkillHours } from '@/types/forecasting';
import { SkillType } from '@/types/task';
import { debugLog } from './logger';
import { addMonths, format, startOfMonth } from 'date-fns';

/**
 * Skill-Aware Forecasting Service
 * Handles forecasting with proper skill ID resolution and normalization
 */
export class SkillAwareForecastingService {
  /**
   * Generate demand forecast with proper skill resolution
   */
  static async generateDemandForecast(startDate: Date, endDate: Date): Promise<ForecastData[]> {
    debugLog('Generating demand forecast with skill resolution', { startDate, endDate });
    
    try {
      // Get all recurring tasks from all clients
      const clients = await import('@/services/clientService').then(m => m.getAllClients());
      const allRecurringTasks = [];
      
      for (const client of clients) {
        try {
          const clientTasks = await getClientRecurringTasks(client.id);
          allRecurringTasks.push(...clientTasks);
        } catch (error) {
          debugLog(`Error fetching tasks for client ${client.id}:`, error);
        }
      }
      
      const forecastPeriods: ForecastData[] = [];
      
      // Generate 12 months of forecast data
      for (let i = 0; i < 12; i++) {
        const periodStart = addMonths(startOfMonth(startDate), i);
        const periodKey = format(periodStart, 'yyyy-MM');
        
        const demandSkillHours: SkillHours[] = [];
        const demandBySkill = new Map<SkillType, number>();
        
        // Process each recurring task
        for (const task of allRecurringTasks.filter(t => t.isActive)) {
          try {
            // Resolve skill IDs to names and normalize them
            const resolvedSkillNames = await SkillsIntegrationService.resolveSkillIds(task.requiredSkills);
            const normalizedSkills = await Promise.all(
              resolvedSkillNames.map(skillName => 
                normalizeSkills([skillName])
              )
            );
            
            // Flatten the normalized skills array
            const flattenedSkills = normalizedSkills.flat();
            
            debugLog(`Task "${task.name}" skills resolved:`, {
              originalIds: task.requiredSkills,
              resolvedNames: resolvedSkillNames,
              normalized: flattenedSkills
            });
            
            // Add hours for each skill
            flattenedSkills.forEach(skill => {
              const currentHours = demandBySkill.get(skill) || 0;
              demandBySkill.set(skill, currentHours + task.estimatedHours);
            });
            
          } catch (error) {
            debugLog(`Error processing task ${task.id}:`, error);
            // Fallback: use a default skill if resolution fails
            const fallbackSkill: SkillType = 'Junior Staff';
            const currentHours = demandBySkill.get(fallbackSkill) || 0;
            demandBySkill.set(fallbackSkill, currentHours + task.estimatedHours);
          }
        }
        
        // Convert map to SkillHours array
        demandBySkill.forEach((hours, skill) => {
          demandSkillHours.push({ skill, hours });
        });
        
        debugLog(`Period ${periodKey} demand:`, demandSkillHours);
        
        forecastPeriods.push({
          period: periodKey,
          demand: demandSkillHours,
          capacity: [], // Will be filled by capacity service
          demandHours: Array.from(demandBySkill.values()).reduce((sum, hours) => sum + hours, 0)
        });
      }
      
      debugLog(`Generated ${forecastPeriods.length} demand forecast periods`);
      return forecastPeriods;
      
    } catch (error) {
      debugLog('Error generating demand forecast:', error);
      throw error;
    }
  }
  
  /**
   * Generate capacity forecast with proper skill resolution
   */
  static async generateCapacityForecast(startDate: Date, endDate: Date): Promise<ForecastData[]> {
    debugLog('Generating capacity forecast with skill resolution', { startDate, endDate });
    
    try {
      const staff = await getAllStaff();
      const forecastPeriods: ForecastData[] = [];
      
      // Generate 12 months of forecast data
      for (let i = 0; i < 12; i++) {
        const periodStart = addMonths(startOfMonth(startDate), i);
        const periodKey = format(periodStart, 'yyyy-MM');
        
        const capacitySkillHours: SkillHours[] = [];
        const capacityBySkill = new Map<SkillType, number>();
        
        // Process each staff member
        for (const staffMember of staff.filter(s => s.status === 'active')) {
          try {
            // Resolve skill IDs to names and normalize them
            const resolvedSkillNames = await SkillsIntegrationService.resolveSkillIds(staffMember.assignedSkills);
            const normalizedSkills = await normalizeSkills(resolvedSkillNames, staffMember.id);
            
            debugLog(`Staff "${staffMember.fullName}" skills resolved:`, {
              originalIds: staffMember.assignedSkills,
              resolvedNames: resolvedSkillNames,
              normalized: normalizedSkills
            });
            
            // Assume 160 hours per month capacity per staff member
            const monthlyCapacity = 160;
            
            // Distribute capacity across their skills
            const hoursPerSkill = normalizedSkills.length > 0 ? monthlyCapacity / normalizedSkills.length : 0;
            
            normalizedSkills.forEach(skill => {
              const currentCapacity = capacityBySkill.get(skill) || 0;
              capacityBySkill.set(skill, currentCapacity + hoursPerSkill);
            });
            
          } catch (error) {
            debugLog(`Error processing staff ${staffMember.id}:`, error);
            // Fallback: assign to Junior Staff if resolution fails
            const fallbackSkill: SkillType = 'Junior Staff';
            const currentCapacity = capacityBySkill.get(fallbackSkill) || 0;
            capacityBySkill.set(fallbackSkill, currentCapacity + 160);
          }
        }
        
        // Convert map to SkillHours array
        capacityBySkill.forEach((hours, skill) => {
          capacitySkillHours.push({ skill, hours });
        });
        
        debugLog(`Period ${periodKey} capacity:`, capacitySkillHours);
        
        forecastPeriods.push({
          period: periodKey,
          demand: [], // Will be filled by demand service
          capacity: capacitySkillHours,
          capacityHours: Array.from(capacityBySkill.values()).reduce((sum, hours) => sum + hours, 0)
        });
      }
      
      debugLog(`Generated ${forecastPeriods.length} capacity forecast periods`);
      return forecastPeriods;
      
    } catch (error) {
      debugLog('Error generating capacity forecast:', error);
      throw error;
    }
  }
}
