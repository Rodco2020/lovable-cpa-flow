
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { ClientTaskDemand } from '@/types/demand';
import { ClientResolutionService } from '../clientResolutionService';
import { RecurrenceCalculator } from '../recurrenceCalculator';
import { SkillConsistencyService } from '../../skillConsistencyService';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Consistent Demand Calculation Service
 * FIXED: Ensures consistent skill naming between Demand and Capacity matrices
 * 
 * This is the primary fix for the skill demand calculation discrepancy.
 * It ensures both matrices use identical skill names for accurate lookups.
 */
export class ConsistentDemandCalculationService {
  /**
   * Calculate demand for skill period with CONSISTENT skill mapping
   * FIXED: Uses SkillConsistencyService to ensure matrix alignment
   */
  static calculateDemandForSkillPeriodConsistent(
    period: ForecastData, 
    skill: SkillType, 
    skillMapping: Map<string, string>
  ): number {
    try {
      if (!period || !Array.isArray(period.demand)) {
        return 0;
      }

      console.log(`🔍 [CONSISTENT DEMAND] Calculating demand for skill "${skill}" in period ${period.period}`);
      console.log(`📋 [CONSISTENT DEMAND] Available demand items:`, period.demand.map(d => ({ skill: d.skill, hours: d.hours })));

      // Create enhanced skill mapping that includes normalization
      const enhancedMapping = this.createEnhancedSkillMapping(skillMapping, period.demand);

      // Try direct match first
      let skillDemand = period.demand.find(d => d && d.skill === skill);
      
      // If no direct match, try enhanced mapping
      if (!skillDemand) {
        for (const demandItem of period.demand) {
          if (demandItem && demandItem.skill) {
            const mappedSkill = enhancedMapping.get(demandItem.skill);
            if (mappedSkill === skill) {
              skillDemand = demandItem;
              console.log(`🎯 [CONSISTENT DEMAND] Found skill via enhanced mapping: ${demandItem.skill} -> ${mappedSkill}`);
              break;
            }
          }
        }
      }

      if (!skillDemand || typeof skillDemand.hours !== 'number') {
        console.log(`⚠️ [CONSISTENT DEMAND] No demand found for skill "${skill}"`);
        return 0;
      }

      const hours = Math.max(0, skillDemand.hours);
      console.log(`✅ [CONSISTENT DEMAND] Found ${hours}h demand for skill "${skill}" (using consistent mapping)`);
      return hours;
    } catch (error) {
      console.warn(`Error calculating consistent demand for skill ${skill}:`, error);
      return 0;
    }
  }

  /**
   * Generate task breakdown with consistent skill mapping
   * FIXED: Uses SkillConsistencyService for skill alignment
   */
  static async generateTaskBreakdownConsistent(
    tasks: RecurringTaskDB[],
    skillDisplayName: SkillType,
    period: string,
    skillMapping: Map<string, string>,
    clientResolutionMap?: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    try {
      const breakdown: ClientTaskDemand[] = [];

      console.log(`🔍 [CONSISTENT BREAKDOWN] Generating breakdown for skill "${skillDisplayName}" with consistent mapping`);

      // Derive month boundaries from period string for recurrence calculation
      const periodDate = new Date(`${period}-01`);
      const monthStart = startOfMonth(periodDate);
      const monthEnd = endOfMonth(periodDate);

      // Create enhanced skill mapping
      const enhancedMapping = this.createEnhancedSkillMapping(skillMapping, []);

      // If no pre-resolved map provided, create one
      let resolvedClientMap = clientResolutionMap;
      if (!resolvedClientMap) {
        const clientIds = new Set<string>();
        tasks.forEach(task => {
          if (task.client_id) {
            clientIds.add(task.client_id);
          }
        });
        resolvedClientMap = await ClientResolutionService.resolveClientIds(Array.from(clientIds));
      }

      // Build breakdown with consistent skill mapping
      for (const task of tasks) {
        try {
          if (!task || !Array.isArray(task.required_skills)) continue;
          
          // Check if task requires this skill using enhanced mapping
          let hasSkill = false;
          
          for (const taskSkillRef of task.required_skills) {
            const mappedSkillName = enhancedMapping.get(taskSkillRef);
            if (mappedSkillName === skillDisplayName) {
              hasSkill = true;
              console.log(`🎯 [CONSISTENT BREAKDOWN] Task ${task.id} matches skill "${skillDisplayName}" via mapping: ${taskSkillRef} -> ${mappedSkillName}`);
              break;
            }
          }

          if (hasSkill) {
            const clientId = task.client_id || 'unknown';
            const clientName = resolvedClientMap.get(clientId) || `Client ${clientId.substring(0, 8)}...`;

            // Calculate monthly recurrence for this task within the period
            const recurrence = RecurrenceCalculator.calculateMonthlyDemand(
              task,
              monthStart,
              monthEnd
            );

            // Use full task hours for consistent calculation
            const fullTaskHours = Math.max(0, task.estimated_hours || 0);
            const monthlyTaskHours = recurrence.monthlyOccurrences * fullTaskHours;

            const demandItem: ClientTaskDemand = {
              clientId: clientId,
              clientName: clientName,
              recurringTaskId: task.id,
              taskName: task.name || 'Unnamed Task',
              skillType: skillDisplayName,
              estimatedHours: fullTaskHours,
              recurrencePattern: {
                type: task.recurrence_type || 'Monthly',
                interval: task.recurrence_interval || 1,
                frequency: recurrence.monthlyOccurrences
              },
              monthlyHours: monthlyTaskHours
            };

            breakdown.push(demandItem);
            console.log(`✨ [CONSISTENT BREAKDOWN] Added task ${task.id} (${clientName}) with ${monthlyTaskHours}h`);
          }
        } catch (itemError) {
          console.warn(`Error creating consistent demand item for task ${task.id}:`, itemError);
        }
      }

      console.log(`📊 [CONSISTENT BREAKDOWN] Generated ${breakdown.length} items for skill "${skillDisplayName}" with consistent mapping`);
      return breakdown;
    } catch (error) {
      console.warn(`Error generating consistent task breakdown for ${skillDisplayName}:`, error);
      return [];
    }
  }

  /**
   * Create enhanced skill mapping that includes consistency normalization
   * This ensures both matrices use the same skill names
   */
  private static createEnhancedSkillMapping(
    baseMapping: Map<string, string>,
    demandItems: Array<{ skill: SkillType; hours: number }> = []
  ): Map<string, SkillType> {
    const enhancedMapping = new Map<string, SkillType>();

    // Add base mappings
    baseMapping.forEach((value, key) => {
      enhancedMapping.set(key, value as SkillType);
    });

    // Extract skills from demand items and normalize them
    const demandSkills = demandItems.map(item => item.skill);
    const normalizedSkills = SkillConsistencyService.normalizeSkillsForMatrixConsistency(demandSkills);

    // Add normalized mappings
    demandSkills.forEach((originalSkill, index) => {
      const normalizedSkill = normalizedSkills[index];
      enhancedMapping.set(originalSkill, normalizedSkill);
      enhancedMapping.set(normalizedSkill, normalizedSkill); // Self-mapping
    });

    console.log(`🔗 [CONSISTENT DEMAND] Created enhanced mapping with ${enhancedMapping.size} entries`);
    
    return enhancedMapping;
  }

  /**
   * Validate skill consistency between demand and capacity
   */
  static validateSkillConsistency(
    demandSkills: SkillType[],
    capacitySkills: SkillType[]
  ): { isConsistent: boolean; issues: string[]; fixedSkills?: SkillType[] } {
    const validation = SkillConsistencyService.validateMatrixSkillConsistency(
      demandSkills,
      capacitySkills
    );

    if (!validation.isConsistent) {
      // Attempt to fix by normalizing all skills to consistent format
      const allSkills = [...new Set([...demandSkills, ...capacitySkills])];
      const fixedSkills = SkillConsistencyService.normalizeSkillsForMatrixConsistency(allSkills);
      
      return {
        ...validation,
        fixedSkills
      };
    }

    return validation;
  }
}
