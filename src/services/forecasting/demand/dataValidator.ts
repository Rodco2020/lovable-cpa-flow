
import { debugLog } from '../logger';
import { RecurringTaskDB } from '@/types/task';
import { SkillResolutionService } from './skillResolutionService';

/**
 * Enhanced Data Validator with staff data validation
 * Phase 1: Database Analysis and Backend Preparation
 */
export class DataValidator {
  /**
   * ENHANCED: Validate recurring tasks with staff data validation
   */
  static async validateRecurringTasks(tasks: RecurringTaskDB[]): Promise<{
    validTasks: RecurringTaskDB[];
    invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }>;
    resolvedTasks: RecurringTaskDB[];
  }> {
    console.log('🔍 [DATA VALIDATOR] Starting enhanced task validation with staff data:', {
      totalTasks: tasks.length
    });

    const validTasks: RecurringTaskDB[] = [];
    const invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }> = [];
    const resolvedTasks: RecurringTaskDB[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const errors: string[] = [];

      console.log(`📋 [DATA VALIDATOR] Validating task ${i + 1}/${tasks.length}:`, {
        id: task.id,
        name: task.name,
        estimated_hours: task.estimated_hours,
        required_skills: task.required_skills,
        preferred_staff_id: task.preferred_staff_id, // NEW: Log preferred staff
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

        // NEW: Enhanced staff validation
        if (task.preferred_staff_id !== null && task.preferred_staff_id !== undefined) {
          if (typeof task.preferred_staff_id === 'string') {
            if (task.preferred_staff_id.trim().length === 0) {
              console.warn(`⚠️ [DATA VALIDATOR] Task ${task.id} has empty preferred staff ID`);
              // Don't treat as error, just clear the value
              task.preferred_staff_id = null;
            } else {
              // Validate UUID format for staff ID
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
              if (!uuidRegex.test(task.preferred_staff_id)) {
                console.warn(`⚠️ [DATA VALIDATOR] Task ${task.id} has invalid staff ID format: ${task.preferred_staff_id}`);
                // Don't treat as error, but log for investigation
              } else {
                console.log(`✅ [DATA VALIDATOR] Task ${task.id} has valid preferred staff ID: ${task.preferred_staff_id}`);
              }
            }
          } else {
            console.warn(`⚠️ [DATA VALIDATOR] Task ${task.id} has non-string preferred staff ID`);
            task.preferred_staff_id = null;
          }
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

        // NEW: Validate staff information if present
        if ((task as any).staff_info) {
          const staffInfo = (task as any).staff_info;
          if (!staffInfo.id || !staffInfo.full_name) {
            console.warn(`⚠️ [DATA VALIDATOR] Task ${task.id} has incomplete staff information`);
          } else {
            console.log(`✅ [DATA VALIDATOR] Task ${task.id} has valid staff information:`, staffInfo.full_name);
          }
        }

        if (errors.length === 0) {
          validTasks.push(task);
          console.log(`✅ [DATA VALIDATOR] Task ${task.id} passed validation`);
        } else {
          invalidTasks.push({ task, errors });
          console.warn(`❌ [DATA VALIDATOR] Task ${task.id} failed validation:`, errors);
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

    console.log('📊 [DATA VALIDATOR] Enhanced validation summary:', {
      totalInput: tasks.length,
      validTasks: validTasks.length,
      invalidTasks: invalidTasks.length,
      resolvedTasks: resolvedTasks.length,
      validationRate: ((validTasks.length / tasks.length) * 100).toFixed(1) + '%',
      tasksWithStaffInfo: validTasks.filter(task => (task as any).staff_info).length,
      tasksWithPreferredStaff: validTasks.filter(task => task.preferred_staff_id).length
    });

    return result;
  }

  /**
   * NEW: Validate staff data quality
   */
  static validateStaffData(staffData: Array<{ id: string; name: string; }>): {
    validStaff: Array<{ id: string; name: string; }>;
    invalidStaff: Array<{ staff: any; errors: string[] }>;
  } {
    console.log('🔍 [DATA VALIDATOR] Validating staff data:', {
      totalStaff: staffData.length
    });

    const validStaff: Array<{ id: string; name: string; }> = [];
    const invalidStaff: Array<{ staff: any; errors: string[] }> = [];

    staffData.forEach((staff, index) => {
      const errors: string[] = [];

      if (!staff.id || typeof staff.id !== 'string' || staff.id.trim().length === 0) {
        errors.push('Missing or invalid staff ID');
      }

      if (!staff.name || typeof staff.name !== 'string' || staff.name.trim().length === 0) {
        errors.push('Missing or invalid staff name');
      }

      // Validate UUID format for staff ID
      if (staff.id && typeof staff.id === 'string') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(staff.id)) {
          errors.push('Invalid staff ID format');
        }
      }

      if (errors.length === 0) {
        validStaff.push({
          id: staff.id.trim(),
          name: staff.name.trim()
        });
      } else {
        invalidStaff.push({ staff, errors });
      }
    });

    console.log('📊 [DATA VALIDATOR] Staff validation summary:', {
      totalInput: staffData.length,
      validStaff: validStaff.length,
      invalidStaff: invalidStaff.length,
      validationRate: ((validStaff.length / staffData.length) * 100).toFixed(1) + '%'
    });

    return { validStaff, invalidStaff };
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
