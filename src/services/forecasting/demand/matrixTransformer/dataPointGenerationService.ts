
import { DemandDataPoint } from '@/types/demand';
import { RevenueEnhancedDataPointContext } from './types';
import { debugLog } from '../../logger';

/**
 * Data Point Generation Service
 * Handles creation of matrix data points with revenue enhancement
 */
export class DataPointGenerationService {
  /**
   * Generate enhanced data points with revenue context
   */
  static generateRevenueEnhancedDataPoints(contexts: RevenueEnhancedDataPointContext[]): DemandDataPoint[] {
    try {
      return contexts.map(context => ({
        skillType: context.skillType,
        month: context.month,
        monthLabel: context.monthLabel,
        demandHours: context.demandHours,
        taskCount: context.taskCount,
        clientCount: context.clientCount,
        taskBreakdown: context.taskBreakdown
      }));
    } catch (error) {
      console.error('Error generating enhanced data points:', error);
      debugLog('Falling back to basic data point generation');
      return [];
    }
  }

  /**
   * Generate data points with skill mapping for matrix transformation
   */
  static async generateDataPointsWithSkillMapping(context: {
    forecastData: any[];
    tasks: any[];
    skills: string[];
    skillMapping: Map<string, string>;
  }): Promise<DemandDataPoint[]> {
    try {
      const { tasks, skills, skillMapping } = context;
      const dataPoints: DemandDataPoint[] = [];

      // Generate data points for each skill
      skills.forEach(skillName => {
        // Find tasks that require this skill
        const skillTasks = tasks.filter(task => {
          if (!Array.isArray(task.required_skills)) return false;
          
          return task.required_skills.some((skillRef: string) => {
            const resolvedName = skillMapping.get(skillRef);
            return resolvedName === skillName;
          });
        });

        if (skillTasks.length > 0) {
          // Create basic data point structure
          const taskBreakdown = skillTasks.map(task => ({
            clientId: task.client_id,
            clientName: task.clients?.legal_name || 'Unknown Client',
            recurringTaskId: task.id,
            taskName: task.name,
            skillType: skillName,
            estimatedHours: task.estimated_hours || 0,
            monthlyHours: task.estimated_hours || 0,
            recurrencePattern: {
              type: task.recurrence_type || 'Monthly',
              interval: task.recurrence_interval || 1,
              frequency: 1
            },
            preferredStaff: task.preferred_staff ? {
              staffId: task.preferred_staff.id,
              staffName: task.preferred_staff.full_name,
              roleTitle: task.preferred_staff.role_title,
              assignmentType: 'preferred' as const
            } : undefined
          }));

          const demandHours = taskBreakdown.reduce((sum, task) => sum + task.monthlyHours, 0);
          const uniqueClients = new Set(taskBreakdown.map(task => task.clientId));

          dataPoints.push({
            skillType: skillName,
            month: '2024-01',
            monthLabel: 'Jan 2024',
            demandHours,
            taskCount: taskBreakdown.length,
            clientCount: uniqueClients.size,
            taskBreakdown
          });
        }
      });

      return dataPoints;
    } catch (error) {
      console.error('Error generating data points with skill mapping:', error);
      return [];
    }
  }
}
