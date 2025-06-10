
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { ClientTaskDemand } from '@/types/demand';
import { ClientResolutionService } from '../clientResolutionService';

/**
 * Service responsible for calculating demand for skills and periods
 */
export class DemandCalculationService {
  /**
   * Calculate demand for skill period with mapping support
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

      console.log(`🔍 [DEMAND CALC] Calculating demand for skill "${skill}" in period ${period.period}`);
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
      console.log(`✅ [DEMAND CALC] Found ${hours}h demand for skill "${skill}"`);
      return hours;
    } catch (error) {
      console.warn(`Error calculating demand for skill ${skill}:`, error);
      return 0;
    }
  }

  /**
   * Generate task breakdown with consistent client resolution
   */
  static async generateTaskBreakdownWithMapping(
    tasks: RecurringTaskDB[],
    skillDisplayName: SkillType,
    period: string,
    skillMapping: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    try {
      const breakdown: ClientTaskDemand[] = [];

      console.log(`🔍 [TASK BREAKDOWN] Generating breakdown for skill "${skillDisplayName}" with client resolution`);

      // Collect all unique client IDs first
      const clientIds = new Set<string>();
      const tasksForSkill: RecurringTaskDB[] = [];

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
            tasksForSkill.push(task);
            if (task.client_id) {
              clientIds.add(task.client_id);
            }
          }
        } catch (taskError) {
          console.warn(`Error processing task ${task.id} for skill matching:`, taskError);
        }
      }

      // Resolve all client IDs to names in one batch
      const clientIdArray = Array.from(clientIds);
      const clientResolutionMap = await ClientResolutionService.resolveClientIds(clientIdArray);

      console.log(`🏢 [TASK BREAKDOWN] Resolved ${clientResolutionMap.size} client names for skill "${skillDisplayName}"`);

      // Build breakdown with resolved client names
      for (const task of tasksForSkill) {
        try {
          const clientId = task.client_id || 'unknown';
          const clientName = clientResolutionMap.get(clientId) || `Client ${clientId.substring(0, 8)}...`;
          
          const demandItem: ClientTaskDemand = {
            clientId: clientId,
            clientName: clientName,
            recurringTaskId: task.id,
            taskName: task.name || 'Unnamed Task',
            skillType: skillDisplayName,
            estimatedHours: Math.max(0, task.estimated_hours || 0),
            recurrencePattern: {
              type: task.recurrence_type || 'Monthly',
              interval: task.recurrence_interval || 1,
              frequency: 1
            },
            monthlyHours: Math.max(0, task.estimated_hours || 0)
          };

          breakdown.push(demandItem);
          console.log(`✨ [TASK BREAKDOWN] Added task ${task.id} (${clientName}) to breakdown for skill "${skillDisplayName}"`);
        } catch (itemError) {
          console.warn(`Error creating demand item for task ${task.id}:`, itemError);
        }
      }

      console.log(`📊 [TASK BREAKDOWN] Generated ${breakdown.length} items for skill "${skillDisplayName}"`);
      return breakdown.slice(0, 100);
    } catch (error) {
      console.warn(`Error generating task breakdown for ${skillDisplayName}:`, error);
      return [];
    }
  }
}
