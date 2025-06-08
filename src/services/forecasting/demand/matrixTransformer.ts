
import { format } from 'date-fns';
import { debugLog } from '../logger';
import { DemandMatrixData, DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { DataValidator } from './dataValidator';

/**
 * Enhanced Matrix Transformer with validation and error handling
 */
export class MatrixTransformer {
  /**
   * Transform forecast data to matrix format with comprehensive validation
   */
  static transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): DemandMatrixData {
    debugLog('Transforming forecast data to matrix', { 
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

      // Validate and filter tasks
      const { validTasks } = DataValidator.validateRecurringTasks(tasks);

      // Generate months from forecast data
      const months = this.generateMonthsFromForecast(forecastData);
      
      // Extract unique skills from forecast data and tasks
      const skills = this.extractUniqueSkills(forecastData, validTasks);
      
      // Generate data points
      const dataPoints = this.generateDataPoints(forecastData, validTasks, skills);
      
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

      // Validate the final matrix data
      const validationErrors = DataValidator.validateMatrixData(matrixData);
      if (validationErrors.length > 0) {
        console.warn('Matrix data validation issues:', validationErrors);
        // Continue with potentially corrected data rather than failing completely
      }

      debugLog(`Generated matrix with ${months.length} months, ${skills.length} skills, ${dataPoints.length} data points`);
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
   * Extract unique skills with validation
   */
  private static extractUniqueSkills(forecastData: ForecastData[], tasks: RecurringTaskDB[]): SkillType[] {
    try {
      const skillsSet = new Set<SkillType>();

      // Extract from forecast data
      forecastData.forEach(period => {
        if (period && Array.isArray(period.demand)) {
          period.demand.forEach(demandItem => {
            if (demandItem && typeof demandItem.skill === 'string' && demandItem.skill.trim().length > 0) {
              skillsSet.add(demandItem.skill.trim());
            }
          });
        }
      });

      // Extract from tasks
      tasks.forEach(task => {
        if (task && Array.isArray(task.required_skills)) {
          task.required_skills.forEach(skill => {
            if (typeof skill === 'string' && skill.trim().length > 0) {
              skillsSet.add(skill.trim());
            }
          });
        }
      });

      const skills = Array.from(skillsSet).slice(0, 100); // Reasonable limit
      return skills;
    } catch (error) {
      console.error('Error extracting unique skills:', error);
      return [];
    }
  }

  /**
   * Generate data points with comprehensive error handling
   */
  private static generateDataPoints(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skills: SkillType[]
  ): DemandDataPoint[] {
    try {
      const dataPoints: DemandDataPoint[] = [];

      for (const skill of skills) {
        for (const period of forecastData) {
          try {
            if (!period || !period.period) continue;

            const demandHours = this.calculateDemandForSkillPeriod(period, skill);
            const taskBreakdown = this.generateTaskBreakdown(tasks, skill, period.period);
            
            // Calculate derived metrics safely
            const taskCount = DataValidator.sanitizeArrayLength(taskBreakdown.length);
            const clientIds = new Set(taskBreakdown.map(t => t.clientId).filter(id => typeof id === 'string'));
            const clientCount = DataValidator.sanitizeArrayLength(clientIds.size);

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
            // Continue with other data points
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
   * Generate task breakdown for drill-down functionality
   */
  private static generateTaskBreakdown(
    tasks: RecurringTaskDB[],
    skill: SkillType,
    period: string
  ): ClientTaskDemand[] {
    try {
      const breakdown: ClientTaskDemand[] = [];

      for (const task of tasks) {
        try {
          if (!task || !Array.isArray(task.required_skills)) continue;
          
          if (task.required_skills.includes(skill)) {
            // Get client name safely
            const clientName = task.clients?.legal_name || 'Unknown Client';
            
            breakdown.push({
              clientId: task.client_id || 'unknown',
              clientName: clientName,
              recurringTaskId: task.id,
              taskName: task.name || 'Unnamed Task',
              skillType: skill,
              estimatedHours: Math.max(0, task.estimated_hours || 0),
              recurrencePattern: {
                type: task.recurrence_type || 'Monthly',
                interval: task.recurrence_interval || 1,
                frequency: 1 // Simplified for now
              },
              monthlyHours: Math.max(0, task.estimated_hours || 0) // Simplified calculation
            });
          }
        } catch (taskError) {
          console.warn(`Error processing task ${task.id} for breakdown:`, taskError);
          // Continue with other tasks
        }
      }

      return breakdown.slice(0, 100); // Limit to prevent performance issues
    } catch (error) {
      console.warn(`Error generating task breakdown for ${skill}:`, error);
      return [];
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
