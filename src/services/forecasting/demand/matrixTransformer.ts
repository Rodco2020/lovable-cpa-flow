
import { format, endOfMonth } from 'date-fns';
import { ForecastData, SkillHours } from '@/types/forecasting';
import { DemandMatrixData, DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { RecurringTaskDB, SkillType } from '@/types/task';
import { RecurrenceCalculator } from './recurrenceCalculator';

/**
 * Matrix Transformer Service
 * Handles transformation of forecast data into matrix format
 */
export class MatrixTransformer {
  /**
   * Transform demand forecast into matrix format
   */
  static transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): DemandMatrixData {
    const months = forecastData.map(data => ({
      key: data.period,
      label: format(new Date(data.period + '-01'), 'MMM yyyy')
    }));

    const skillsSet = new Set<SkillType>();
    const dataPoints: DemandDataPoint[] = [];
    let totalDemand = 0;
    let totalTasks = tasks.length;
    
    // Get unique clients
    const clientsSet = new Set(tasks.map(task => task.client_id));
    const totalClients = clientsSet.size;

    // Process each period
    forecastData.forEach(periodData => {
      const month = periodData.period;
      const monthLabel = format(new Date(month + '-01'), 'MMM yyyy');

      periodData.demand.forEach(skillHours => {
        skillsSet.add(skillHours.skill);
        totalDemand += skillHours.hours;

        // Create task breakdown for this skill/month
        const taskBreakdown = this.createTaskBreakdown(
          tasks,
          skillHours.skill,
          month
        );

        dataPoints.push({
          skillType: skillHours.skill,
          month,
          monthLabel,
          demandHours: skillHours.hours,
          taskCount: taskBreakdown.length,
          clientCount: new Set(taskBreakdown.map(t => t.clientId)).size,
          taskBreakdown
        });
      });
    });

    // Create skill summary
    const skillSummary: Record<SkillType, any> = {};
    Array.from(skillsSet).forEach(skill => {
      const skillPoints = dataPoints.filter(p => p.skillType === skill);
      skillSummary[skill] = {
        totalHours: skillPoints.reduce((sum, p) => sum + p.demandHours, 0),
        taskCount: new Set(
          skillPoints.flatMap(p => p.taskBreakdown.map(t => t.recurringTaskId))
        ).size,
        clientCount: new Set(
          skillPoints.flatMap(p => p.taskBreakdown.map(t => t.clientId))
        ).size
      };
    });

    return {
      months,
      skills: Array.from(skillsSet).sort(),
      dataPoints,
      totalDemand,
      totalTasks,
      totalClients,
      skillSummary
    };
  }

  /**
   * Create detailed task breakdown for drill-down functionality
   */
  private static createTaskBreakdown(
    tasks: RecurringTaskDB[],
    skillType: SkillType,
    month: string
  ): ClientTaskDemand[] {
    return tasks
      .filter(task => task.required_skills.includes(skillType))
      .map(task => {
        const calculation = RecurrenceCalculator.calculateMonthlyDemand(
          task,
          new Date(month + '-01'),
          endOfMonth(new Date(month + '-01'))
        );

        return {
          clientId: task.client_id,
          clientName: (task as any).clients?.legal_name || 'Unknown Client',
          recurringTaskId: task.id,
          taskName: task.name,
          skillType,
          estimatedHours: task.estimated_hours,
          recurrencePattern: {
            type: task.recurrence_type,
            interval: task.recurrence_interval,
            frequency: calculation.monthlyOccurrences
          },
          monthlyHours: calculation.monthlyHours / task.required_skills.length
        };
      });
  }
}
