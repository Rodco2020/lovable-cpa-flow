
import { debugLog } from '../logger';
import { SkillHours } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { RecurrenceCalculator } from './recurrenceCalculator';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Skill Calculator with robust error handling and validation
 */
export class SkillCalculator {
  /**
   * Calculate monthly demand by skill with comprehensive validation
   */
  static async calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): Promise<SkillHours[]> {
    debugLog('Calculating monthly demand by skill', { 
      tasksCount: tasks.length, 
      monthStart: monthStart.toISOString(), 
      monthEnd: monthEnd.toISOString() 
    });

    try {
      // Validate inputs
      if (!Array.isArray(tasks)) {
        console.warn('Tasks parameter is not an array');
        return [];
      }

      if (!monthStart || !monthEnd || monthEnd <= monthStart) {
        console.warn('Invalid date range for skill calculation');
        return [];
      }

      // Validate and filter tasks - await the Promise
      const { validTasks } = await DataValidator.validateRecurringTasks(tasks);
      
      if (validTasks.length === 0) {
        debugLog('No valid tasks for skill calculation');
        return [];
      }

      // Group by skill and calculate demand
      const skillDemandMap = new Map<SkillType, number>();
      const skillMetadata = new Map<SkillType, {
        taskCount: number;
        clientCount: number;
        taskIds: string[];
        clientIds: string[];
      }>();

      for (const task of validTasks) {
        try {
          // Calculate recurrence for this task within the month
          const recurrenceCalc = RecurrenceCalculator.calculateMonthlyDemand(
            task, 
            monthStart, 
            monthEnd
          );

          // Process each required skill
          if (Array.isArray(task.required_skills)) {
            for (const skillId of task.required_skills) {
              if (typeof skillId === 'string' && skillId.trim().length > 0) {
                const skill = skillId.trim();
                
                // Add hours to skill total
                const currentHours = skillDemandMap.get(skill) || 0;
                const additionalHours = DataValidator.sanitizeArrayLength(recurrenceCalc.monthlyHours, 10000);
                skillDemandMap.set(skill, currentHours + additionalHours);

                // Update metadata
                const metadata = skillMetadata.get(skill) || {
                  taskCount: 0,
                  clientCount: 0,
                  taskIds: [],
                  clientIds: []
                };

                metadata.taskCount++;
                if (!metadata.taskIds.includes(task.id)) {
                  metadata.taskIds.push(task.id);
                }
                if (!metadata.clientIds.includes(task.client_id)) {
                  metadata.clientIds.push(task.client_id);
                  metadata.clientCount++;
                }

                skillMetadata.set(skill, metadata);
              }
            }
          }
        } catch (taskError) {
          console.warn(`Error processing task ${task.id}:`, taskError);
          // Continue with other tasks
        }
      }

      // Convert to SkillHours array with metadata
      const skillHours: SkillHours[] = Array.from(skillDemandMap.entries())
        .map(([skill, hours]) => {
          const metadata = skillMetadata.get(skill);
          return {
            skill,
            hours: Math.max(0, hours), // Ensure non-negative
            metadata: {
              staffCount: 0, // Not applicable for demand
              staffIds: [],
              hoursBreakdown: {},
              calculationNotes: `Demand from ${metadata?.taskCount || 0} tasks across ${metadata?.clientCount || 0} clients`
            }
          };
        })
        .filter(sh => sh.hours > 0) // Only include skills with actual demand
        .sort((a, b) => b.hours - a.hours); // Sort by hours descending

      debugLog(`Calculated demand for ${skillHours.length} skills`);
      return skillHours;

    } catch (error) {
      console.error('Error in calculateMonthlyDemandBySkill:', error);
      return [];
    }
  }

  /**
   * Aggregate skill hours across multiple periods
   */
  static aggregateSkillHours(skillHoursArray: SkillHours[][]): SkillHours[] {
    try {
      if (!Array.isArray(skillHoursArray) || skillHoursArray.length === 0) {
        return [];
      }

      const aggregatedMap = new Map<SkillType, number>();
      
      for (const periodSkillHours of skillHoursArray) {
        if (Array.isArray(periodSkillHours)) {
          for (const skillHour of periodSkillHours) {
            if (skillHour && typeof skillHour.skill === 'string' && typeof skillHour.hours === 'number') {
              const current = aggregatedMap.get(skillHour.skill) || 0;
              aggregatedMap.set(skillHour.skill, current + Math.max(0, skillHour.hours));
            }
          }
        }
      }

      return Array.from(aggregatedMap.entries())
        .map(([skill, hours]) => ({
          skill,
          hours,
          metadata: {
            calculationNotes: 'Aggregated across multiple periods'
          }
        }))
        .filter(sh => sh.hours > 0)
        .sort((a, b) => b.hours - a.hours);

    } catch (error) {
      console.error('Error aggregating skill hours:', error);
      return [];
    }
  }
}
