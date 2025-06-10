
import { debugLog } from '../logger';
import { SkillHours } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { RecurrenceCalculator } from './recurrenceCalculator';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Skill Calculator with comprehensive diagnostic logging and annual task fix
 */
export class SkillCalculator {
  /**
   * Calculate monthly demand by skill with detailed tracing and annual task support
   */
  static async calculateMonthlyDemandBySkill(
    tasks: RecurringTaskDB[],
    monthStart: Date,
    monthEnd: Date
  ): Promise<SkillHours[]> {
    console.log('🔍 [SKILL CALCULATOR DEBUG] Starting calculation with:', {
      tasksCount: tasks.length,
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      monthNumber: monthStart.getMonth() // For annual task debugging
    });

    try {
      // Validate inputs with detailed logging
      if (!Array.isArray(tasks)) {
        console.error('❌ [SKILL CALCULATOR] Tasks parameter is not an array:', typeof tasks);
        return [];
      }

      if (!monthStart || !monthEnd || monthEnd <= monthStart) {
        console.error('❌ [SKILL CALCULATOR] Invalid date range:', { monthStart, monthEnd });
        return [];
      }

      // Log annual tasks for debugging
      const annualTasks = tasks.filter(task => 
        task.recurrence_type && task.recurrence_type.toLowerCase() === 'annually'
      );
      
      if (annualTasks.length > 0) {
        console.log('📅 [SKILL CALCULATOR] Annual tasks found:', 
          annualTasks.map(task => ({
            id: task.id,
            name: task.name,
            dueDate: task.due_date,
            dueDateMonth: task.due_date ? new Date(task.due_date).getMonth() : null,
            currentPeriodMonth: monthStart.getMonth(),
            shouldInclude: task.due_date ? new Date(task.due_date).getMonth() === monthStart.getMonth() : false
          }))
        );
      }

      console.log('📋 [SKILL CALCULATOR] Sample task data:', {
        firstTask: tasks[0] ? {
          id: tasks[0].id,
          name: tasks[0].name,
          estimated_hours: tasks[0].estimated_hours,
          required_skills: tasks[0].required_skills,
          recurrence_type: tasks[0].recurrence_type,
          due_date: tasks[0].due_date,
          is_active: tasks[0].is_active
        } : 'No tasks',
        totalTasks: tasks.length,
        annualTasksCount: annualTasks.length
      });

      // Enhanced validation and skill resolution tracking
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(tasks);
      
      console.log('✅ [SKILL CALCULATOR] Task validation results:', {
        totalInput: tasks.length,
        validTasks: validTasks.length,
        invalidTasks: invalidTasks.length,
        resolvedTasks: resolvedTasks.length,
        validationRate: ((validTasks.length / tasks.length) * 100).toFixed(1) + '%'
      });

      if (invalidTasks.length > 0) {
        console.warn('⚠️ [SKILL CALCULATOR] Invalid tasks sample:', 
          invalidTasks.slice(0, 3).map(({ task, errors }) => ({
            taskId: task.id,
            taskName: task.name,
            errors: errors
          }))
        );
      }

      if (validTasks.length === 0) {
        console.warn('❌ [SKILL CALCULATOR] No valid tasks after validation');
        return [];
      }

      // Group by skill and calculate demand with detailed tracking
      const skillDemandMap = new Map<SkillType, number>();
      const skillMetadata = new Map<SkillType, {
        taskCount: number;
        clientCount: number;
        taskIds: string[];
        clientIds: string[];
        totalEstimatedHours: number;
        totalCalculatedHours: number;
        annualTasksIncluded: number;
        annualTasksSkipped: number;
      }>();

      let processedTaskCount = 0;
      let totalHoursFromTasks = 0;
      let totalCalculatedHours = 0;
      let annualTasksProcessed = 0;
      let annualTasksIncluded = 0;

      console.log('🔄 [SKILL CALCULATOR] Processing tasks for skill demand...');

      for (const task of validTasks) {
        try {
          processedTaskCount++;
          totalHoursFromTasks += Number(task.estimated_hours) || 0;
          
          const isAnnualTask = task.recurrence_type && task.recurrence_type.toLowerCase() === 'annually';
          if (isAnnualTask) {
            annualTasksProcessed++;
          }

          console.log(`📝 [SKILL CALCULATOR] Processing task ${processedTaskCount}/${validTasks.length}:`, {
            taskId: task.id,
            taskName: task.name,
            estimatedHours: task.estimated_hours,
            requiredSkills: task.required_skills,
            recurrenceType: task.recurrence_type,
            recurrenceInterval: task.recurrence_interval,
            dueDate: task.due_date,
            isAnnualTask: isAnnualTask
          });

          // Calculate recurrence for this task within the month
          const recurrenceCalc = RecurrenceCalculator.calculateMonthlyDemand(
            task, 
            monthStart, 
            monthEnd
          );

          console.log(`⏰ [SKILL CALCULATOR] Recurrence calculation for task ${task.id}:`, {
            monthlyOccurrences: recurrenceCalc.monthlyOccurrences,
            monthlyHours: recurrenceCalc.monthlyHours,
            taskEstimatedHours: task.estimated_hours,
            calculationMethod: `${task.estimated_hours} × ${recurrenceCalc.monthlyOccurrences} = ${recurrenceCalc.monthlyHours}`,
            wasIncluded: recurrenceCalc.monthlyHours > 0,
            isAnnualTask: isAnnualTask
          });

          // Track annual task inclusion
          if (isAnnualTask && recurrenceCalc.monthlyHours > 0) {
            annualTasksIncluded++;
            console.log(`✅ [SKILL CALCULATOR] Annual task included: ${task.name} (${task.id})`);
          } else if (isAnnualTask) {
            console.log(`❌ [SKILL CALCULATOR] Annual task skipped: ${task.name} (${task.id})`);
          }

          totalCalculatedHours += recurrenceCalc.monthlyHours;

          // Process each required skill with validation
          if (Array.isArray(task.required_skills)) {
            console.log(`🎯 [SKILL CALCULATOR] Processing ${task.required_skills.length} skills for task ${task.id}:`, task.required_skills);

            for (const skillId of task.required_skills) {
              if (typeof skillId === 'string' && skillId.trim().length > 0) {
                const skill = skillId.trim();
                
                console.log(`🔧 [SKILL CALCULATOR] Adding hours for skill "${skill}":`, {
                  currentHours: skillDemandMap.get(skill) || 0,
                  additionalHours: recurrenceCalc.monthlyHours,
                  taskId: task.id,
                  isAnnualTask: isAnnualTask
                });

                // Add hours to skill total
                const currentHours = skillDemandMap.get(skill) || 0;
                const additionalHours = DataValidator.sanitizeArrayLength(recurrenceCalc.monthlyHours, 10000);
                const newTotal = currentHours + additionalHours;
                skillDemandMap.set(skill, newTotal);

                console.log(`✨ [SKILL CALCULATOR] Skill "${skill}" updated:`, {
                  previousTotal: currentHours,
                  added: additionalHours,
                  newTotal: newTotal,
                  fromAnnualTask: isAnnualTask
                });

                // Update metadata
                const metadata = skillMetadata.get(skill) || {
                  taskCount: 0,
                  clientCount: 0,
                  taskIds: [],
                  clientIds: [],
                  totalEstimatedHours: 0,
                  totalCalculatedHours: 0,
                  annualTasksIncluded: 0,
                  annualTasksSkipped: 0
                };

                metadata.taskCount++;
                metadata.totalEstimatedHours += Number(task.estimated_hours) || 0;
                metadata.totalCalculatedHours += additionalHours;

                if (isAnnualTask) {
                  if (additionalHours > 0) {
                    metadata.annualTasksIncluded++;
                  } else {
                    metadata.annualTasksSkipped++;
                  }
                }

                if (!metadata.taskIds.includes(task.id)) {
                  metadata.taskIds.push(task.id);
                }
                if (!metadata.clientIds.includes(task.client_id)) {
                  metadata.clientIds.push(task.client_id);
                  metadata.clientCount++;
                }

                skillMetadata.set(skill, metadata);
              } else {
                console.warn(`⚠️ [SKILL CALCULATOR] Invalid skill ID for task ${task.id}:`, {
                  skillId,
                  type: typeof skillId,
                  length: skillId?.length
                });
              }
            }
          } else {
            console.warn(`⚠️ [SKILL CALCULATOR] Task ${task.id} has invalid required_skills:`, {
              required_skills: task.required_skills,
              type: typeof task.required_skills
            });
          }
        } catch (taskError) {
          console.error(`❌ [SKILL CALCULATOR] Error processing task ${task.id}:`, taskError);
          // Continue with other tasks
        }
      }

      console.log('📊 [SKILL CALCULATOR] Processing summary:', {
        processedTasks: processedTaskCount,
        totalTaskEstimatedHours: totalHoursFromTasks,
        totalCalculatedHours: totalCalculatedHours,
        uniqueSkills: skillDemandMap.size,
        annualTasksProcessed: annualTasksProcessed,
        annualTasksIncluded: annualTasksIncluded,
        annualTasksSkipped: annualTasksProcessed - annualTasksIncluded,
        skillTotals: Object.fromEntries(skillDemandMap.entries())
      });

      // Convert to SkillHours array with enhanced metadata
      const skillHours: SkillHours[] = Array.from(skillDemandMap.entries())
        .map(([skill, hours]) => {
          const metadata = skillMetadata.get(skill);
          
          console.log(`📈 [SKILL CALCULATOR] Creating skill hours entry for "${skill}":`, {
            totalHours: hours,
            taskCount: metadata?.taskCount || 0,
            clientCount: metadata?.clientCount || 0,
            avgHoursPerTask: metadata?.taskCount ? (hours / metadata.taskCount).toFixed(2) : 0,
            annualTasksIncluded: metadata?.annualTasksIncluded || 0,
            annualTasksSkipped: metadata?.annualTasksSkipped || 0
          });

          return {
            skill,
            hours: Math.max(0, hours), // Ensure non-negative
            metadata: {
              staffCount: 0, // Not applicable for demand
              staffIds: [],
              hoursBreakdown: {},
              calculationNotes: `Demand from ${metadata?.taskCount || 0} tasks across ${metadata?.clientCount || 0} clients (${metadata?.totalEstimatedHours || 0}h estimated × recurrence = ${hours}h calculated). Annual tasks: ${metadata?.annualTasksIncluded || 0} included, ${metadata?.annualTasksSkipped || 0} skipped.`
            }
          };
        })
        .filter(sh => {
          const includeSkill = sh.hours > 0;
          if (!includeSkill) {
            console.log(`🚫 [SKILL CALCULATOR] Filtering out skill "${sh.skill}" with 0 hours`);
          }
          return includeSkill;
        })
        .sort((a, b) => b.hours - a.hours); // Sort by hours descending

      console.log('🎯 [SKILL CALCULATOR] Final results with annual task fix:', {
        skillsWithDemand: skillHours.length,
        totalDemandHours: skillHours.reduce((sum, sh) => sum + sh.hours, 0),
        annualTasksProcessed: annualTasksProcessed,
        annualTasksIncluded: annualTasksIncluded,
        topSkills: skillHours.slice(0, 5).map(sh => ({ skill: sh.skill, hours: sh.hours }))
      });

      if (skillHours.length === 0) {
        console.error('❌ [SKILL CALCULATOR] CRITICAL: No skills with demand hours found!');
        console.error('🔍 [SKILL CALCULATOR] Debugging info:', {
          inputTasks: tasks.length,
          validTasks: validTasks.length,
          skillMapSize: skillDemandMap.size,
          skillMapEntries: Array.from(skillDemandMap.entries())
        });
      }

      debugLog(`Calculated demand for ${skillHours.length} skills with annual task fix`);
      return skillHours;

    } catch (error) {
      console.error('❌ [SKILL CALCULATOR] Critical error in calculateMonthlyDemandBySkill:', error);
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
