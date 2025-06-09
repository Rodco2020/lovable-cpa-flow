import { format } from 'date-fns';
import { debugLog } from '../logger';
import { DemandMatrixData, DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { DataValidator } from './dataValidator';
import { SkillResolutionService } from './skillResolutionService';

/**
 * Enhanced Matrix Transformer with skill resolution and robust error handling
 */
export class MatrixTransformer {
  /**
   * Transform forecast data to matrix format with comprehensive validation and skill resolution
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    debugLog('Transforming forecast data to matrix with skill resolution', { 
      periodsCount: forecastData.length, 
      tasksCount: tasks.length 
    });

    try {
      // Validate inputs
      if (!Array.isArray(forecastData)) {
        console.warn('Forecast data is not an array');
        forecastData = [];
      }

      if (!Array.isArray(tasks)) {
        console.warn('Tasks data is not an array');
        tasks = [];
      }

      // Enhanced validation and cleaning with skill resolution
      const { validTasks, invalidTasks, resolvedTasks } = await DataValidator.validateRecurringTasks(tasks);

      // Log resolution results
      if (resolvedTasks.length > 0) {
        console.log(`Resolved skills for ${resolvedTasks.length} tasks`);
        debugLog('Skill resolution results', { resolvedTasks });
      }

      if (invalidTasks.length > 0) {
        console.warn(`Excluded ${invalidTasks.length} invalid tasks from matrix generation`);
        invalidTasks.slice(0, 3).forEach(({ task, errors }) => {
          console.warn(`Task ${task.id}:`, errors.slice(0, 2)); // Limit error spam
        });
      }

      // Generate months from forecast data
      const months = this.generateMonthsFromForecast(forecastData);
      
      // Extract unique skills from forecast data and validated tasks
      const skills = await this.extractUniqueSkillsWithResolution(forecastData, validTasks);
      
      // Generate data points with error resilience
      const dataPoints = await this.generateDataPointsRobust(forecastData, validTasks, skills);
      
      // Calculate totals safely
      const totals = this.calculateTotals(dataPoints);
      
      // Generate skill summary
      const skillSummary = this.generateSkillSummary(dataPoints);

      const matrixData: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand: totals.totalDemand,
        totalTasks: totals.totalTasks,
        totalClients: totals.totalClients,
        skillSummary
      };

      const successMessage = `Generated matrix: ${months.length} months, ${skills.length} skills, ${dataPoints.length} data points`;
      if (resolvedTasks.length > 0) {
        debugLog(`${successMessage} (resolved skills for ${resolvedTasks.length} tasks)`);
      } else {
        debugLog(successMessage);
      }

      return matrixData;

    } catch (error) {
      console.error('Error transforming to matrix data:', error);
      
      // Return a minimal valid structure to prevent cascade failures
      return {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: {}
      };
    }
  }

  /**
   * Extract unique skills with skill resolution for consistent display names
   */
  private static async extractUniqueSkillsWithResolution(
    forecastData: ForecastData[], 
    tasks: RecurringTaskDB[]
  ): Promise<SkillType[]> {
    try {
      const skillRefsSet = new Set<string>();

      console.log('🔍 [MATRIX TRANSFORMER] Extracting skills from forecast data and tasks...');

      // Extract from forecast data
      forecastData.forEach(period => {
        if (period && Array.isArray(period.demand)) {
          period.demand.forEach(demandItem => {
            if (demandItem && typeof demandItem.skill === 'string' && demandItem.skill.trim().length > 0) {
              skillRefsSet.add(demandItem.skill.trim());
            }
          });
        }
      });

      // Extract from validated tasks (these may be UUIDs or names)
      tasks.forEach(task => {
        if (task && Array.isArray(task.required_skills)) {
          task.required_skills.forEach(skill => {
            if (typeof skill === 'string' && skill.trim().length > 0) {
              skillRefsSet.add(skill.trim());
            }
          });
        }
      });

      const allSkillRefs = Array.from(skillRefsSet);
      console.log('🎯 [MATRIX TRANSFORMER] Collected skill references:', allSkillRefs);

      if (allSkillRefs.length === 0) {
        console.warn('⚠️ [MATRIX TRANSFORMER] No skill references found');
        return [];
      }

      // Convert UUIDs to display names using skill resolution service
      const displayNames = await SkillResolutionService.getSkillNames(allSkillRefs);
      console.log('✅ [MATRIX TRANSFORMER] Resolved skill display names:', displayNames);
      
      const uniqueSkillNames = Array.from(new Set(displayNames))
        .filter(name => name && name.length > 0)
        .slice(0, 100); // Reasonable limit
      
      console.log(`📊 [MATRIX TRANSFORMER] Final unique skill names (${uniqueSkillNames.length}):`, uniqueSkillNames);
      
      return uniqueSkillNames;
    } catch (error) {
      console.error('❌ [MATRIX TRANSFORMER] Error extracting unique skills:', error);
      return [];
    }
  }

  /**
   * Generate months array from forecast data with validation
   */
  private static generateMonthsFromForecast(forecastData: ForecastData[]): Array<{ key: string; label: string }> {
    try {
      const months = forecastData
        .map(period => {
          if (!period || !period.period) {
            return null;
          }
          
          try {
            // Validate period format (should be YYYY-MM)
            if (!/^\d{4}-\d{2}$/.test(period.period)) {
              console.warn(`Invalid period format: ${period.period}`);
              return null;
            }
            
            const date = new Date(period.period + '-01');
            if (isNaN(date.getTime())) {
              console.warn(`Invalid date from period: ${period.period}`);
              return null;
            }
            
            return {
              key: period.period,
              label: format(date, 'MMM yyyy')
            };
          } catch (error) {
            console.warn(`Error processing period ${period.period}:`, error);
            return null;
          }
        })
        .filter((month): month is { key: string; label: string } => month !== null)
        .slice(0, 24); // Limit to prevent performance issues

      return months;
    } catch (error) {
      console.error('Error generating months from forecast:', error);
      return [];
    }
  }

  /**
   * Generate data points with enhanced error handling and skill resolution
   */
  private static async generateDataPointsRobust(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skills: SkillType[]
  ): Promise<DemandDataPoint[]> {
    try {
      const dataPoints: DemandDataPoint[] = [];

      for (const skill of skills) {
        for (const period of forecastData) {
          try {
            if (!period || !period.period) continue;

            const demandHours = this.calculateDemandForSkillPeriod(period, skill);
            const taskBreakdown = await this.generateTaskBreakdownWithResolution(tasks, skill, period.period);
            
            // Calculate derived metrics safely
            const taskCount = DataValidator.sanitizeArrayLength(taskBreakdown.length, 1000);
            const clientIds = new Set(
              taskBreakdown
                .map(t => t.clientId)
                .filter(id => typeof id === 'string' && id.length > 0)
            );
            const clientCount = DataValidator.sanitizeArrayLength(clientIds.size, 1000);

            const dataPoint: DemandDataPoint = {
              skillType: skill,
              month: period.period,
              monthLabel: this.getMonthLabel(period.period),
              demandHours: Math.max(0, demandHours), // Ensure non-negative
              taskCount,
              clientCount,
              taskBreakdown
            };

            dataPoints.push(dataPoint);
          } catch (pointError) {
            console.warn(`Error generating data point for ${skill} in ${period.period}:`, pointError);
            // Continue with other data points - don't let one error break everything
          }
        }
      }

      return dataPoints;
    } catch (error) {
      console.error('Error generating data points:', error);
      return [];
    }
  }

  /**
   * Generate task breakdown with skill resolution for consistent matching
   */
  private static async generateTaskBreakdownWithResolution(
    tasks: RecurringTaskDB[],
    skillDisplayName: SkillType,
    period: string
  ): Promise<ClientTaskDemand[]> {
    try {
      const breakdown: ClientTaskDemand[] = [];

      console.log(`🔍 [TASK BREAKDOWN] Generating breakdown for skill "${skillDisplayName}" in period ${period}`);

      for (const task of tasks) {
        try {
          if (!task || !Array.isArray(task.required_skills)) continue;
          
          console.log(`📋 [TASK BREAKDOWN] Checking task ${task.id} with skills:`, task.required_skills);
          
          // Convert task's skill UUIDs to display names for comparison
          const taskSkillDisplayNames = await SkillResolutionService.getSkillNames(task.required_skills);
          console.log(`🎯 [TASK BREAKDOWN] Task ${task.id} skill display names:`, taskSkillDisplayNames);
          
          // Check if this task requires the skill by comparing display names
          const hasSkill = taskSkillDisplayNames.some(taskSkillName => 
            taskSkillName.toLowerCase().trim() === skillDisplayName.toLowerCase().trim()
          );

          console.log(`✅ [TASK BREAKDOWN] Task ${task.id} has skill "${skillDisplayName}":`, hasSkill);

          if (hasSkill) {
            // Get client name safely
            const clientName = task.clients?.legal_name || 'Unknown Client';
            
            const demandItem: ClientTaskDemand = {
              clientId: task.client_id || 'unknown',
              clientName: clientName,
              recurringTaskId: task.id,
              taskName: task.name || 'Unnamed Task',
              skillType: skillDisplayName, // Use the display name
              estimatedHours: Math.max(0, task.estimated_hours || 0),
              recurrencePattern: {
                type: task.recurrence_type || 'Monthly',
                interval: task.recurrence_interval || 1,
                frequency: 1 // Simplified for now
              },
              monthlyHours: Math.max(0, task.estimated_hours || 0) // Simplified calculation
            };

            breakdown.push(demandItem);
            console.log(`✨ [TASK BREAKDOWN] Added task ${task.id} to breakdown for skill "${skillDisplayName}"`);
          }
        } catch (taskError) {
          console.warn(`Error processing task ${task.id} for breakdown:`, taskError);
          // Continue with other tasks
        }
      }

      console.log(`📊 [TASK BREAKDOWN] Generated ${breakdown.length} items for skill "${skillDisplayName}"`);
      return breakdown.slice(0, 100); // Limit to prevent performance issues
    } catch (error) {
      console.warn(`Error generating task breakdown for ${skillDisplayName}:`, error);
      return [];
    }
  }

  /**
   * Calculate demand for specific skill in specific period
   */
  private static calculateDemandForSkillPeriod(period: ForecastData, skill: SkillType): number {
    try {
      if (!period || !Array.isArray(period.demand)) {
        return 0;
      }

      const skillDemand = period.demand.find(d => d && d.skill === skill);
      if (!skillDemand || typeof skillDemand.hours !== 'number') {
        return 0;
      }

      return Math.max(0, skillDemand.hours);
    } catch (error) {
      console.warn(`Error calculating demand for skill ${skill}:`, error);
      return 0;
    }
  }

  /**
   * Get month label safely
   */
  private static getMonthLabel(period: string): string {
    try {
      if (!period || !/^\d{4}-\d{2}$/.test(period)) {
        return 'Invalid Date';
      }
      
      const date = new Date(period + '-01');
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.warn(`Error formatting month label for ${period}:`, error);
      return 'Invalid Date';
    }
  }

  /**
   * Calculate totals safely
   */
  private static calculateTotals(dataPoints: DemandDataPoint[]): {
    totalDemand: number;
    totalTasks: number;
    totalClients: number;
  } {
    try {
      if (!Array.isArray(dataPoints)) {
        return { totalDemand: 0, totalTasks: 0, totalClients: 0 };
      }

      const totalDemand = dataPoints.reduce((sum, point) => {
        const hours = typeof point.demandHours === 'number' ? point.demandHours : 0;
        return sum + Math.max(0, hours);
      }, 0);

      const totalTasks = dataPoints.reduce((sum, point) => {
        const tasks = typeof point.taskCount === 'number' ? point.taskCount : 0;
        return sum + Math.max(0, tasks);
      }, 0);

      const allClientIds = new Set<string>();
      dataPoints.forEach(point => {
        if (Array.isArray(point.taskBreakdown)) {
          point.taskBreakdown.forEach(task => {
            if (task && typeof task.clientId === 'string') {
              allClientIds.add(task.clientId);
            }
          });
        }
      });

      const totalClients = allClientIds.size;

      return { totalDemand, totalTasks, totalClients };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { totalDemand: 0, totalTasks: 0, totalClients: 0 };
    }
  }

  /**
   * Generate skill summary safely
   */
  private static generateSkillSummary(dataPoints: DemandDataPoint[]): Record<SkillType, {
    totalHours: number;
    taskCount: number;
    clientCount: number;
  }> {
    try {
      const summary: Record<SkillType, { totalHours: number; taskCount: number; clientCount: number }> = {};

      for (const point of dataPoints) {
        if (!point || typeof point.skillType !== 'string') continue;

        const skill = point.skillType;
        if (!summary[skill]) {
          summary[skill] = { totalHours: 0, taskCount: 0, clientCount: 0 };
        }

        summary[skill].totalHours += Math.max(0, point.demandHours || 0);
        summary[skill].taskCount += Math.max(0, point.taskCount || 0);
        summary[skill].clientCount += Math.max(0, point.clientCount || 0);
      }

      return summary;
    } catch (error) {
      console.error('Error generating skill summary:', error);
      return {};
    }
  }
}
