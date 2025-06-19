
import { debugLog } from '../logger';
import { RecurringTaskDB } from '@/types/task';
import { SkillResolutionService } from './skillResolutionService';

/**
 * Enhanced Data Validator - Phase 4: Skill Resolution Pipeline Integration
 * 
 * PIPELINE IMPROVEMENTS:
 * - Comprehensive skill resolution tracking and diagnostics
 * - Non-blocking validation with detailed error reporting
 * - Integration with enhanced SkillResolutionService
 */
export class DataValidator {
  /**
   * Enhanced task validation with comprehensive skill resolution pipeline integration
   */
  static async validateRecurringTasks(
    tasks: RecurringTaskDB[],
    options: { permissive?: boolean } = {}
  ): Promise<{
    validTasks: RecurringTaskDB[];
    invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }>;
    resolvedTasks: RecurringTaskDB[];
    skillResolutionStats?: Record<string, any>;
  }> {
    console.log('🔍 [DATA VALIDATOR] Enhanced validation starting:', {
      totalTasks: tasks.length,
      permissiveMode: options.permissive || false,
      timestamp: new Date().toISOString()
    });

    const { permissive = false } = options;
    const validTasks: RecurringTaskDB[] = [];
    const invalidTasks: Array<{ task: RecurringTaskDB; errors: string[] }> = [];
    const resolvedTasks: RecurringTaskDB[] = [];

    // Enhanced skill resolution tracking
    const skillResolutionStats = {
      totalTasks: tasks.length,
      tasksWithSkills: 0,
      tasksRequiringResolution: 0,
      successfulResolutions: 0,
      failedResolutions: 0,
      resolutionAttempts: 0,
      cacheHits: 0,
      databaseLookups: 0,
      errors: []
    };

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const errors: string[] = [];
      let taskToPush: RecurringTaskDB = task;

      console.log(`📋 [DATA VALIDATOR] Enhanced validation for task ${i + 1}/${tasks.length}:`, {
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

        // PIPELINE FIX: Enhanced skill validation with comprehensive resolution tracking
        if (!Array.isArray(task.required_skills)) {
          errors.push('Required skills is not an array');
        } else if (task.required_skills.length === 0) {
          errors.push('No required skills specified');
        } else {
          skillResolutionStats.tasksWithSkills++;

          console.log(`🎯 [DATA VALIDATOR] Enhanced skill validation for task ${task.id}:`, {
            skills: task.required_skills,
            skillCount: task.required_skills.length
          });

          // Check if skills need resolution (UUID format vs names)
          const skillsNeedResolution = task.required_skills.some(skill => 
            typeof skill === 'string' && skill.includes('-') && skill.length > 30
          );

          if (skillsNeedResolution) {
            skillResolutionStats.tasksRequiringResolution++;
            skillResolutionStats.resolutionAttempts++;

            console.log(`🔧 [DATA VALIDATOR] Task ${task.id} requires skill resolution...`);
            
            try {
              // PIPELINE FIX: Use enhanced validation with comprehensive diagnostics
              const { valid, invalid, resolved, diagnostics } = await SkillResolutionService.validateSkillReferences(task.required_skills);
              
              // Update stats from diagnostics
              skillResolutionStats.cacheHits += diagnostics.cacheHits || 0;
              skillResolutionStats.databaseLookups += diagnostics.validUuids - diagnostics.cacheHits || 0;
              
              console.log(`✅ [DATA VALIDATOR] Enhanced skill resolution for task ${task.id}:`, {
                originalSkills: task.required_skills,
                validSkills: valid,
                invalidSkills: invalid,
                resolvedSkills: resolved,
                diagnostics: diagnostics
              });

              if (resolved.length === 0) {
                // PIPELINE FIX: Non-blocking error handling
                const errorMsg = `No valid skills after enhanced resolution: ${invalid.join(', ')}`;
                errors.push(errorMsg);
                skillResolutionStats.failedResolutions++;
                skillResolutionStats.errors.push(`Task ${task.id}: ${errorMsg}`);
                
                if (!permissive) {
                  console.warn(`❌ [DATA VALIDATOR] Task ${task.id} rejected due to skill resolution failure`);
                }
              } else {
                // Success - create task with resolved skills
                const taskWithResolvedSkills = {
                  ...task,
                  required_skills: resolved
                };
                resolvedTasks.push(taskWithResolvedSkills);
                taskToPush = taskWithResolvedSkills;
                skillResolutionStats.successfulResolutions++;
                
                console.log(`🎉 [DATA VALIDATOR] Task ${task.id} skill resolution successful`);
                
                if (invalid.length > 0) {
                  console.warn(`⚠️ [DATA VALIDATOR] Some skills unresolved for task ${task.id}:`, invalid);
                  skillResolutionStats.errors.push(`Task ${task.id}: Partial resolution - ${invalid.length} skills unresolved`);
                }
              }
            } catch (resolutionError) {
              // PIPELINE FIX: Non-blocking error handling with detailed tracking
              const errorMsg = `Enhanced skill resolution failed: ${resolutionError}`;
              console.error(`❌ [DATA VALIDATOR] ${errorMsg} for task ${task.id}`);
              errors.push(errorMsg);
              skillResolutionStats.failedResolutions++;
              skillResolutionStats.errors.push(`Task ${task.id}: ${errorMsg}`);
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

        // Final validation decision with enhanced logging
        if (errors.length === 0) {
          validTasks.push(taskToPush);
          console.log(`✅ [DATA VALIDATOR] Task ${task.id} passed enhanced validation`);
        } else {
          invalidTasks.push({ task, errors });
          console.warn(`❌ [DATA VALIDATOR] Task ${task.id} failed enhanced validation:`, errors);

          if (permissive) {
            console.warn(`ℹ️ [DATA VALIDATOR] Permissive mode - keeping task ${task.id} despite errors`);
            validTasks.push(taskToPush);
          }
        }

      } catch (error) {
        console.error(`❌ [DATA VALIDATOR] Critical error validating task ${task.id}:`, error);
        const errorMsg = `Validation error: ${error}`;
        errors.push(errorMsg);
        invalidTasks.push({ task, errors });
        skillResolutionStats.errors.push(`Task ${task.id}: ${errorMsg}`);
      }
    }

    // Comprehensive results with enhanced skill resolution analytics
    const result = {
      validTasks,
      invalidTasks,
      resolvedTasks,
      skillResolutionStats: {
        ...skillResolutionStats,
        resolutionSuccessRate: skillResolutionStats.resolutionAttempts > 0 
          ? `${((skillResolutionStats.successfulResolutions / skillResolutionStats.resolutionAttempts) * 100).toFixed(1)}%`
          : 'N/A',
        skillPipelineHealthy: skillResolutionStats.errors.length === 0,
        timestamp: new Date().toISOString()
      }
    };

    console.log('📊 [DATA VALIDATOR] Enhanced validation summary:', {
      totalInput: tasks.length,
      validTasks: validTasks.length,
      invalidTasks: invalidTasks.length,
      resolvedTasks: resolvedTasks.length,
      validationRate: ((validTasks.length / tasks.length) * 100).toFixed(1) + '%',
      skillResolutionStats: result.skillResolutionStats
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
