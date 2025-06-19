import { debugLog } from '../logger';
import { RecurringTaskDB } from '@/types/task';
import { SkillResolutionService } from './skillResolutionService';

/**
 * Enhanced Data Validator with detailed skill resolution tracking
 */
export class DataValidator {
  /**
   * Validate recurring tasks with comprehensive skill resolution logging
   */
  static async validateRecurringTasks(
    tasks: RecurringTaskDB[],
    options: { permissive?: boolean } = {}
  ): Promise<{
    validTasks: RecurringTaskDB[];
    invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }>;
    resolvedTasks: RecurringTaskDB[];
  }> {
    console.log('🔍 [DATA VALIDATOR] Starting task validation:', {
      totalTasks: tasks.length
    });

    const { permissive = false } = options;

    const validTasks: RecurringTaskDB[] = [];
    const invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }> = [];
    const resolvedTasks: RecurringTaskDB[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const errors: string[] = [];
      let taskToPush: RecurringTaskDB = task;

      console.log(`📋 [DATA VALIDATOR] Validating task ${i + 1}/${tasks.length}:`, {
        id: task.id,
        name: task.name,
        estimated_hours: task.estimated_hours,
        required_skills: task.required_skills,
        is_active: task.is_active
      });

      try {
        // Basic validation
        if (!task.id || typeof task.id !== 'string') {
          errors.push('Missing or invalid task ID');
        }

        if (!task.client_id || typeof task.client_id !== 'string') {
          errors.push('Missing or invalid client ID');
        }

        if (typeof task.estimated_hours !== 'number' || task.estimated_hours <= 0) {
          errors.push(`Invalid estimated hours: ${task.estimated_hours}`);
        }

        if (!task.recurrence_type || typeof task.recurrence_type !== 'string') {
          errors.push('Missing or invalid recurrence type');
        }

        if (task.is_active !== true) {
          errors.push('Task is not active');
        }

        // Enhanced skill validation with resolution
        if (!Array.isArray(task.required_skills)) {
          errors.push('Required skills is not an array');
        } else if (task.required_skills.length === 0) {
          errors.push('No required skills specified');
        } else {
          console.log(`🎯 [DATA VALIDATOR] Validating ${task.required_skills.length} skills for task ${task.id}:`, task.required_skills);

          // Check if skills need resolution (UUID format vs names)
          const skillsNeedResolution = task.required_skills.some(skill => 
            typeof skill === 'string' && skill.includes('-') && skill.length > 30
          );

          if (skillsNeedResolution) {
            console.log(`🔧 [DATA VALIDATOR] Task ${task.id} has UUID skills, attempting resolution...`);
            
            try {
              const { validSkills, invalidSkills } = await SkillResolutionService.resolveSkillReferences(task.required_skills);
              
              console.log(`✅ [DATA VALIDATOR] Skill resolution results for task ${task.id}:`, {
                originalSkills: task.required_skills,
                validSkills: validSkills,
                invalidSkills: invalidSkills
              });

              if (validSkills.length === 0) {
                errors.push(`No valid skills after resolution: ${invalidSkills.join(', ')}`);
              } else {
                // Update task with resolved skills for processing
                const taskWithResolvedSkills = {
                  ...task,
                  required_skills: validSkills
                };
                resolvedTasks.push(taskWithResolvedSkills);
                taskToPush = taskWithResolvedSkills;
                
                if (invalidSkills.length > 0) {
                  console.warn(`⚠️ [DATA VALIDATOR] Some skills could not be resolved for task ${task.id}:`, invalidSkills);
                }
              }
            } catch (resolutionError) {
              console.error(`❌ [DATA VALIDATOR] Skill resolution failed for task ${task.id}:`, resolutionError);
              errors.push(`Skill resolution failed: ${resolutionError}`);
            }
          } else {
            // Skills appear to be names, validate they're not empty
            const validSkillNames = task.required_skills.filter(skill => 
              typeof skill === 'string' && skill.trim().length > 0
            );
            
            if (validSkillNames.length === 0) {
              errors.push('No valid skill names found');
            } else {
              console.log(`✅ [DATA VALIDATOR] Task ${task.id} has valid skill names:`, validSkillNames);
            }
          }
        }

        if (errors.length === 0) {
          validTasks.push(taskToPush);
          console.log(`✅ [DATA VALIDATOR] Task ${task.id} passed validation`);
        } else {
          invalidTasks.push({ task, errors });
          console.warn(`❌ [DATA VALIDATOR] Task ${task.id} failed validation:`, errors);

          if (permissive) {
            console.warn(`ℹ️ [DATA VALIDATOR] Permissive mode enabled - keeping task ${task.id} despite errors`);
            validTasks.push(taskToPush);
          }
        }

      } catch (error) {
        console.error(`❌ [DATA VALIDATOR] Error validating task ${task.id}:`, error);
        errors.push(`Validation error: ${error}`);
        invalidTasks.push({ task, errors });
      }
    }

    const result = {
      validTasks,
      invalidTasks,
      resolvedTasks
    };

    console.log('📊 [DATA VALIDATOR] Validation summary:', {
      totalInput: tasks.length,
      validTasks: validTasks.length,
      invalidTasks: invalidTasks.length,
      resolvedTasks: resolvedTasks.length,
      validationRate: ((validTasks.length / tasks.length) * 100).toFixed(1) + '%'
    });

    return result;
  }

  /**
   * Sanitize array length to prevent excessive calculations
   */
  static sanitizeArrayLength(value: number, maxValue: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
      return 0;
    }
    return Math.min(Math.max(0, value), maxValue);
  }
}
