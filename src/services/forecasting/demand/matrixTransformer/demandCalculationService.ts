
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { ClientTaskDemand } from '@/types/demand';
import { ClientResolutionService } from '../clientResolutionService';
import { RecurrenceCalculator } from '../recurrenceCalculator';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Service responsible for calculating demand for skills and periods
 * FIXED: Now uses consistent full-hours-per-skill logic
 */
export class DemandCalculationService {
  /**
   * Calculate demand for skill period with mapping support
   * FIXED: Uses consistent logic for skill demand calculation
   */
  static calculateDemandForSkillPeriodWithMapping(
    period: ForecastData, 
    skill: SkillType, 
    skillMapping: Map<string, string>
  ): number {
    try {
      if (!period || !Array.isArray(period.demand)) {
        return 0;
      }

      console.log(`🔍 [DEMAND CALC] Calculating demand for skill "${skill}" in period ${period.period} (FIXED logic)`);
      console.log(`📋 [DEMAND CALC] Available demand items:`, period.demand.map(d => ({ skill: d.skill, hours: d.hours })));

      // Try direct match first
      let skillDemand = period.demand.find(d => d && d.skill === skill);
      
      // If no direct match, try mapping-based match
      if (!skillDemand) {
        for (const demandItem of period.demand) {
          if (demandItem && demandItem.skill) {
            const mappedSkill = skillMapping.get(demandItem.skill);
            if (mappedSkill === skill) {
              skillDemand = demandItem;
              console.log(`🎯 [DEMAND CALC] Found skill via mapping: ${demandItem.skill} -> ${mappedSkill}`);
              break;
            }
          }
        }
      }

      if (!skillDemand || typeof skillDemand.hours !== 'number') {
        console.log(`⚠️ [DEMAND CALC] No demand found for skill "${skill}"`);
        return 0;
      }

      const hours = Math.max(0, skillDemand.hours);
      console.log(`✅ [DEMAND CALC] Found ${hours}h demand for skill "${skill}" (FIXED: using full hours per skill)`);
      return hours;
    } catch (error) {
      console.warn(`Error calculating demand for skill ${skill}:`, error);
      return 0;
    }
  }

  /**
   * Generate task breakdown with consistent client resolution using pre-resolved client map
   * FIXED: Now uses full task hours per skill in breakdown generation
   */
  static async generateTaskBreakdownWithMapping(
    tasks: RecurringTaskDB[],
    skillDisplayName: SkillType,
    period: string,
    skillMapping: Map<string, string>,
    clientResolutionMap?: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    try {
      const breakdown: ClientTaskDemand[] = [];

      console.log(`🔍 [TASK BREAKDOWN] Generating breakdown for skill "${skillDisplayName}" with FIXED logic`);

      // Derive month boundaries from period string for recurrence calculation
      const periodDate = new Date(`${period}-01`);
      const monthStart = startOfMonth(periodDate);
      const monthEnd = endOfMonth(periodDate);

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

      // Build breakdown with pre-resolved client names
      for (const task of tasks) {
        try {
          if (!task || !Array.isArray(task.required_skills)) continue;
          
          // Check if task requires this skill using mapping
          let hasSkill = false;
          
          for (const taskSkillRef of task.required_skills) {
            const mappedSkillName = skillMapping.get(taskSkillRef);
            if (mappedSkillName === skillDisplayName) {
              hasSkill = true;
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

            // FIXED: Use full task hours for each skill (not divided)
            const fullTaskHours = Math.max(0, task.estimated_hours || 0);
            const monthlyTaskHours = recurrence.monthlyOccurrences * fullTaskHours;

            const demandItem: ClientTaskDemand = {
              clientId: clientId,
              clientName: clientName,
              recurringTaskId: task.id,
              taskName: task.name || 'Unnamed Task',
              skillType: skillDisplayName,
              estimatedHours: fullTaskHours, // FIXED: Full task hours
              recurrencePattern: {
                type: task.recurrence_type || 'Monthly',
                interval: task.recurrence_interval || 1,
                frequency: recurrence.monthlyOccurrences
              },
              monthlyHours: monthlyTaskHours // FIXED: Full monthly hours
            };

            breakdown.push(demandItem);
            console.log(`✨ [TASK BREAKDOWN] Added task ${task.id} (${clientName}) to breakdown for skill "${skillDisplayName}" with ${monthlyTaskHours}h (FIXED)`);
          }
        } catch (itemError) {
          console.warn(`Error creating demand item for task ${task.id}:`, itemError);
        }
      }

      console.log(`📊 [TASK BREAKDOWN] Generated ${breakdown.length} items for skill "${skillDisplayName}" with FIXED logic`);
      return breakdown;
    } catch (error) {
      console.warn(`Error generating task breakdown for ${skillDisplayName}:`, error);
      return [];
    }
  }
}
