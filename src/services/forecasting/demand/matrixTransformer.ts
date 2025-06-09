import { format } from 'date-fns';
import { debugLog } from '../logger';
import { DemandMatrixData, DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { DataValidator } from './dataValidator';
import { SkillResolutionService } from './skillResolutionService';

/**
 * Enhanced Matrix Transformer with fixed skill resolution and demand calculation
 */
export class MatrixTransformer {
  /**
   * Transform forecast data to matrix format with fixed skill matching
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    debugLog('Transforming forecast data to matrix with fixed skill resolution', { 
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
      
      // Extract unique skills with proper resolution mapping
      const { skills, skillMapping } = await this.extractUniqueSkillsWithMapping(forecastData, validTasks);
      
      // Generate data points with corrected skill matching
      const dataPoints = await this.generateDataPointsWithSkillMapping(forecastData, validTasks, skills, skillMapping);
      
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

      const successMessage = `Generated matrix: ${months.length} months, ${skills.length} skills, ${dataPoints.length} data points, total demand: ${totals.totalDemand}h`;
      debugLog(successMessage);

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
   * Extract unique skills with bidirectional mapping for consistent matching
   */
  private static async extractUniqueSkillsWithMapping(
    forecastData: ForecastData[], 
    tasks: RecurringTaskDB[]
  ): Promise<{ skills: SkillType[]; skillMapping: Map<string, string> }> {
    try {
      const skillRefsSet = new Set<string>();
      const skillMapping = new Map<string, string>(); // UUID -> Display Name

      console.log('🔍 [MATRIX TRANSFORMER] Extracting skills with mapping...');

      // Extract from forecast data (these should be display names already)
      forecastData.forEach(period => {
        if (period && Array.isArray(period.demand)) {
          period.demand.forEach(demandItem => {
            if (demandItem && typeof demandItem.skill === 'string' && demandItem.skill.trim().length > 0) {
              skillRefsSet.add(demandItem.skill.trim());
            }
          });
        }
      });

      // Extract from validated tasks and build mapping
      for (const task of tasks) {
        if (task && Array.isArray(task.required_skills)) {
          for (const skillRef of task.required_skills) {
            if (typeof skillRef === 'string' && skillRef.trim().length > 0) {
              skillRefsSet.add(skillRef.trim());
            }
          }
        }
      }

      const allSkillRefs = Array.from(skillRefsSet);
      console.log('🎯 [MATRIX TRANSFORMER] Collected skill references:', allSkillRefs);

      if (allSkillRefs.length === 0) {
        console.warn('⚠️ [MATRIX TRANSFORMER] No skill references found');
        return { skills: [], skillMapping: new Map() };
      }

      // Build comprehensive skill mapping
      for (const skillRef of allSkillRefs) {
        if (this.isUUID(skillRef)) {
          // It's a UUID - resolve to display name
          const displayNames = await SkillResolutionService.getSkillNames([skillRef]);
          const displayName = displayNames[0] || skillRef;
          skillMapping.set(skillRef, displayName);
          skillMapping.set(displayName, displayName); // Self-mapping for consistency
        } else {
          // It's already a display name
          skillMapping.set(skillRef, skillRef);
        }
      }

      // Get unique display names
      const uniqueSkillNames = Array.from(new Set(Array.from(skillMapping.values())))
        .filter(name => name && name.length > 0)
        .slice(0, 100); // Reasonable limit
      
      console.log(`📊 [MATRIX TRANSFORMER] Final skills with mapping:`, {
        uniqueSkills: uniqueSkillNames,
        mappingSize: skillMapping.size,
        sampleMapping: Array.from(skillMapping.entries()).slice(0, 5)
      });
      
      return { skills: uniqueSkillNames, skillMapping };
    } catch (error) {
      console.error('❌ [MATRIX TRANSFORMER] Error extracting skills with mapping:', error);
      return { skills: [], skillMapping: new Map() };
    }
  }

  /**
   * Generate data points with correct skill mapping for demand calculation
   */
  private static async generateDataPointsWithSkillMapping(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[],
    skills: SkillType[],
    skillMapping: Map<string, string>
  ): Promise<DemandDataPoint[]> {
    try {
      const dataPoints: DemandDataPoint[] = [];

      console.log('🔄 [MATRIX TRANSFORMER] Generating data points with skill mapping...');

      for (const skill of skills) {
        for (const period of forecastData) {
          try {
            if (!period || !period.period) continue;

            // Calculate demand using both direct match and mapping
            const demandHours = this.calculateDemandForSkillPeriodWithMapping(period, skill, skillMapping);
            const taskBreakdown = await this.generateTaskBreakdownWithMapping(tasks, skill, period.period, skillMapping);
            
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
              demandHours: Math.max(0, demandHours),
              taskCount,
              clientCount,
              taskBreakdown
            };

            dataPoints.push(dataPoint);

            console.log(`✅ [MATRIX TRANSFORMER] Generated data point for ${skill} in ${period.period}:`, {
              demandHours,
              taskCount,
              clientCount
            });

          } catch (pointError) {
            console.warn(`Error generating data point for ${skill} in ${period.period}:`, pointError);
          }
        }
      }

      console.log(`📊 [MATRIX TRANSFORMER] Generated ${dataPoints.length} total data points`);
      return dataPoints;
    } catch (error) {
      console.error('Error generating data points with skill mapping:', error);
      return [];
    }
  }

  /**
   * Calculate demand for skill period with mapping support
   */
  private static calculateDemandForSkillPeriodWithMapping(
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
   * Generate task breakdown with skill mapping
   */
  private static async generateTaskBreakdownWithMapping(
    tasks: RecurringTaskDB[],
    skillDisplayName: SkillType,
    period: string,
    skillMapping: Map<string, string>
  ): Promise<ClientTaskDemand[]> {
    try {
      const breakdown: ClientTaskDemand[] = [];

      console.log(`🔍 [TASK BREAKDOWN] Generating breakdown for skill "${skillDisplayName}" with mapping support`);

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
            const clientName = task.clients?.legal_name || 'Unknown Client';
            
            const demandItem: ClientTaskDemand = {
              clientId: task.client_id || 'unknown',
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
            console.log(`✨ [TASK BREAKDOWN] Added task ${task.id} to breakdown for skill "${skillDisplayName}"`);
          }
        } catch (taskError) {
          console.warn(`Error processing task ${task.id} for breakdown:`, taskError);
        }
      }

      console.log(`📊 [TASK BREAKDOWN] Generated ${breakdown.length} items for skill "${skillDisplayName}"`);
      return breakdown.slice(0, 100);
    } catch (error) {
      console.warn(`Error generating task breakdown for ${skillDisplayName}:`, error);
      return [];
    }
  }

  /**
   * Check if a string is a UUID
   */
  private static isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
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
