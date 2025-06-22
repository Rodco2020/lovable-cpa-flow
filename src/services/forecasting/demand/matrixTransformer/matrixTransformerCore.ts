
import { DemandMatrixData } from '@/types/demand';
import { debugLog } from '../../logger';
import { format, parse } from 'date-fns';
import { SkillResolutionService } from '../skillResolutionService';

/**
 * Matrix Transformer Core with Enhanced Skill Resolution
 * Core logic for transforming forecast and task data into matrix format
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast and task data to matrix data format
   */
  static async transformToMatrixData(forecastData: any[], tasks: any[]): Promise<DemandMatrixData> {
    debugLog('Transforming data to matrix format with skill resolution', {
      forecastPeriods: forecastData.length,
      tasksCount: tasks.length
    });

    try {
      // Extract months from forecast data
      const months = forecastData.map(period => ({
        key: period.period,
        label: period.periodLabel || format(parse(period.period, 'yyyy-MM', new Date()), 'MMM yyyy')
      }));

      // Extract and resolve skills from tasks
      const allSkillReferences = new Set<string>();
      
      tasks.forEach(task => {
        if (Array.isArray(task.required_skills)) {
          task.required_skills.forEach((skill: string) => {
            if (skill && typeof skill === 'string') {
              allSkillReferences.add(skill.trim());
            }
          });
        }
      });

      debugLog('Collected skill references from tasks:', Array.from(allSkillReferences));

      // Resolve skill UUIDs to names
      const skillRefsArray = Array.from(allSkillReferences);
      const resolvedSkillNames = await SkillResolutionService.getSkillNames(skillRefsArray);
      
      // Create mapping for quick lookup
      const skillMapping = new Map<string, string>();
      for (let i = 0; i < skillRefsArray.length; i++) {
        skillMapping.set(skillRefsArray[i], resolvedSkillNames[i]);
      }

      const uniqueSkills = Array.from(new Set(resolvedSkillNames)).filter(name => name && name.length > 0);

      debugLog('Skill resolution complete:', {
        originalRefs: skillRefsArray.length,
        resolvedNames: resolvedSkillNames.length,
        uniqueSkills: uniqueSkills.length,
        skillMapping: Object.fromEntries(Array.from(skillMapping.entries()).slice(0, 5))
      });

      // Generate data points for each skill-month combination
      const dataPoints: any[] = [];
      
      uniqueSkills.forEach(skillName => {
        months.forEach(month => {
          // Find tasks that require this skill (by checking resolved names)
          const skillTasks = tasks.filter(task => {
            if (!Array.isArray(task.required_skills)) return false;
            
            return task.required_skills.some((skillRef: string) => {
              const resolvedName = skillMapping.get(skillRef);
              return resolvedName === skillName;
            });
          });

          // Calculate monthly hours for each task based on recurrence
          const taskBreakdown = skillTasks.map(task => {
            const monthlyHours = this.calculateMonthlyHours(task, month.key);
            
            return {
              clientId: task.client_id,
              clientName: task.clients?.legal_name || 'Unknown Client',
              recurringTaskId: task.id,
              taskName: task.name,
              skillType: skillName, // Use resolved skill name
              estimatedHours: task.estimated_hours || 0,
              recurrencePattern: this.extractRecurrencePattern(task),
              monthlyHours,
              preferredStaff: task.preferred_staff ? {
                staffId: task.preferred_staff.id,
                staffName: task.preferred_staff.full_name,
                roleTitle: task.preferred_staff.role_title
              } : undefined
            };
          }).filter(task => task.monthlyHours > 0);

          const demandHours = taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
          const taskCount = taskBreakdown.length;
          const uniqueClients = new Set(taskBreakdown.map(task => task.clientId));

          if (demandHours > 0 || taskCount > 0) {
            dataPoints.push({
              skillType: skillName,
              month: month.key,
              monthLabel: month.label,
              demandHours,
              taskCount,
              clientCount: uniqueClients.size,
              taskBreakdown
            });
          }
        });
      });

      // Calculate totals
      const totalDemand = dataPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const totalTasks = dataPoints.reduce((sum, point) => sum + point.taskCount, 0);
      const allClientIds = new Set<string>();
      dataPoints.forEach(point => {
        point.taskBreakdown.forEach((task: any) => allClientIds.add(task.clientId));
      });

      const matrixData: DemandMatrixData = {
        months,
        skills: uniqueSkills,
        dataPoints,
        totalDemand,
        totalTasks,
        totalClients: allClientIds.size,
        skillSummary: this.generateSkillSummary(dataPoints, uniqueSkills)
      };

      debugLog('Matrix transformation complete with skill resolution:', {
        monthsCount: months.length,
        skillsCount: uniqueSkills.length,
        dataPointsCount: dataPoints.length,
        totalDemand,
        totalTasks,
        totalClients: allClientIds.size
      });

      return matrixData;

    } catch (error) {
      console.error('Error in matrix transformation:', error);
      
      // Return minimal data structure to prevent crashes
      return {
        months: forecastData.map(period => ({
          key: period.period,
          label: period.periodLabel || format(parse(period.period, 'yyyy-MM', new Date()), 'MMM yyyy')
        })),
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
   * Calculate monthly hours for a task based on its recurrence pattern
   */
  private static calculateMonthlyHours(task: any, monthKey: string): number {
    const estimatedHours = task.estimated_hours || 0;
    
    if (!task.recurrence_type || task.recurrence_type === 'None') {
      return 0; // Ad-hoc tasks don't contribute to monthly recurring demand
    }

    const interval = task.recurrence_interval || 1;
    
    switch (task.recurrence_type) {
      case 'Daily':
        return estimatedHours * 30 / interval; // Approximate 30 days per month
      case 'Weekly':
        return estimatedHours * 4 / interval; // Approximate 4 weeks per month
      case 'Monthly':
        return estimatedHours / interval;
      case 'Quarterly':
        return interval === 3 ? estimatedHours / 3 : 0; // Every 3 months
      case 'Annually':
        return interval === 12 ? estimatedHours / 12 : 0; // Every 12 months
      default:
        return estimatedHours; // Default to estimated hours
    }
  }

  /**
   * Extract recurrence pattern information from task
   */
  private static extractRecurrencePattern(task: any): any {
    return {
      type: task.recurrence_type || 'None',
      interval: task.recurrence_interval || 1,
      frequency: this.calculateFrequency(task.recurrence_type, task.recurrence_interval)
    };
  }

  /**
   * Calculate frequency per month for recurrence pattern
   */
  private static calculateFrequency(recurrenceType: string, interval: number): number {
    switch (recurrenceType) {
      case 'Daily':
        return 30 / (interval || 1);
      case 'Weekly':
        return 4 / (interval || 1);
      case 'Monthly':
        return 1 / (interval || 1);
      case 'Quarterly':
        return 1 / ((interval || 1) * 3);
      case 'Annually':
        return 1 / ((interval || 1) * 12);
      default:
        return 0;
    }
  }

  /**
   * Generate skill summary statistics
   */
  private static generateSkillSummary(dataPoints: any[], skills: string[]): Record<string, any> {
    const skillSummary: Record<string, any> = {};

    skills.forEach(skill => {
      const skillPoints = dataPoints.filter(point => point.skillType === skill);
      const totalDemand = skillPoints.reduce((sum, point) => sum + point.demandHours, 0);
      const totalTasks = skillPoints.reduce((sum, point) => sum + point.taskCount, 0);
      const totalClients = new Set(
        skillPoints.flatMap(point => point.taskBreakdown.map((task: any) => task.clientId))
      ).size;

      skillSummary[skill] = {
        totalDemand,
        totalTasks,
        totalClients,
        averageDemandPerMonth: skillPoints.length > 0 ? totalDemand / skillPoints.length : 0
      };
    });

    return skillSummary;
  }
}
