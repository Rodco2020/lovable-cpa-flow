
import { addMonths, startOfMonth, endOfMonth, format, differenceInMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from './logger';
import { 
  DemandForecastParameters, 
  DemandMatrixData, 
  DemandDataPoint, 
  ClientTaskDemand,
  RecurrenceCalculation,
  DemandFilters
} from '@/types/demand';
import { RecurringTask, SkillType } from '@/types/task';
import { ForecastData, SkillHours } from '@/types/forecasting';

/**
 * Demand Data Service
 * Handles fetching and processing client-assigned recurring tasks for demand forecasting
 */
export class DemandDataService {
  /**
   * Fetch all client-assigned recurring tasks with filtering
   */
  static async fetchClientAssignedTasks(filters?: DemandFilters): Promise<RecurringTask[]> {
    debugLog('Fetching client-assigned recurring tasks', { filters });

    try {
      let query = supabase
        .from('recurring_tasks')
        .select(`
          *,
          clients!inner(id, legal_name)
        `)
        .eq('is_active', true);

      // Apply client filters if specified
      if (filters?.clients && filters.clients.length > 0 && !filters.clients.includes('all')) {
        query = query.in('client_id', filters.clients);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching client-assigned tasks:', error);
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      let tasks = data || [];

      // Apply skill filters if specified
      if (filters?.skills && filters.skills.length > 0) {
        tasks = tasks.filter(task => 
          task.required_skills.some((skill: SkillType) => 
            filters.skills.includes(skill)
          )
        );
      }

      // Include inactive tasks if requested
      if (!filters?.includeInactive) {
        tasks = tasks.filter(task => task.is_active);
      }

      debugLog(`Found ${tasks.length} client-assigned tasks`);
      return tasks as RecurringTask[];
    } catch (error) {
      console.error('Error in fetchClientAssignedTasks:', error);
      throw error;
    }
  }

  /**
   * Calculate monthly demand from recurrence patterns
   */
  static calculateMonthlyDemand(
    task: RecurringTask,
    startDate: Date,
    endDate: Date
  ): RecurrenceCalculation {
    const monthlyOccurrences = this.calculateRecurrenceFrequency(task);
    const monthlyHours = monthlyOccurrences * task.estimated_hours;

    return {
      taskId: task.id,
      monthlyOccurrences,
      monthlyHours,
      nextDueDates: this.generateOccurrenceDates(task, startDate, endDate)
    };
  }

  /**
   * Calculate how many times a task occurs per month based on recurrence pattern
   */
  private static calculateRecurrenceFrequency(task: RecurringTask): number {
    const { recurrence_type, recurrence_interval = 1 } = task;

    switch (recurrence_type) {
      case 'Daily':
        return 30 / recurrence_interval; // Approximate monthly occurrences
      case 'Weekly':
        return 4 / recurrence_interval; // Approximate weekly to monthly
      case 'Monthly':
        return 1 / recurrence_interval;
      case 'Quarterly':
        return (1 / recurrence_interval) / 3; // Convert quarterly to monthly
      case 'Annually':
        return (1 / recurrence_interval) / 12; // Convert annually to monthly
      default:
        return 1; // Default to monthly
    }
  }

  /**
   * Generate specific occurrence dates for a task within the forecast period
   */
  private static generateOccurrenceDates(
    task: RecurringTask,
    startDate: Date,
    endDate: Date
  ): Date[] {
    const dates: Date[] = [];
    const { recurrence_type, recurrence_interval = 1, due_date } = task;
    
    if (!due_date) return dates;

    let currentDate = new Date(due_date);
    
    // Ensure we start within the forecast period
    while (currentDate < startDate) {
      currentDate = this.getNextOccurrence(currentDate, recurrence_type, recurrence_interval);
    }

    // Generate dates within the period
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = this.getNextOccurrence(currentDate, recurrence_type, recurrence_interval);
    }

    return dates;
  }

  /**
   * Calculate the next occurrence date based on recurrence pattern
   */
  private static getNextOccurrence(
    currentDate: Date,
    recurrenceType: string,
    interval: number
  ): Date {
    switch (recurrenceType) {
      case 'Daily':
        return addMonths(currentDate, 0); // For daily, we'll use monthly approximation
      case 'Weekly':
        return addMonths(currentDate, interval * 0.25); // Weekly to monthly approximation
      case 'Monthly':
        return addMonths(currentDate, interval);
      case 'Quarterly':
        return addMonths(currentDate, interval * 3);
      case 'Annually':
        return addMonths(currentDate, interval * 12);
      default:
        return addMonths(currentDate, 1);
    }
  }

  /**
   * Generate demand forecast data for 12-month matrix display
   */
  static async generateDemandForecast(
    parameters: DemandForecastParameters
  ): Promise<ForecastData[]> {
    debugLog('Generating demand forecast', { parameters });

    const { dateRange, includeSkills, includeClients } = parameters;
    
    // Create filters from parameters
    const filters: DemandFilters = {
      skills: includeSkills === 'all' ? [] : includeSkills,
      clients: includeClients === 'all' ? [] : includeClients,
      timeHorizon: dateRange
    };

    // Fetch client-assigned tasks
    const tasks = await this.fetchClientAssignedTasks(filters);

    // Generate monthly periods
    const months = this.generateMonthlyPeriods(dateRange.startDate, dateRange.endDate);
    
    // Process each month
    const forecastData: ForecastData[] = months.map(month => {
      const monthStart = new Date(month.start);
      const monthEnd = new Date(month.end);
      
      // Calculate demand for this month
      const demandBySkill = this.calculateMonthlyDemandBySkill(
        tasks,
        monthStart,
        monthEnd
      );

      return {
        period: format(monthStart, 'yyyy-MM'),
        demand: demandBySkill,
        capacity: [], // Demand-only forecast
        demandHours: demandBySkill.reduce((sum, skill) => sum + skill.hours, 0),
        capacityHours: 0
      };
    });

    debugLog(`Generated demand forecast with ${forecastData.length} periods`);
    return forecastData;
  }

  /**
   * Calculate demand by skill for a specific month
   */
  private static calculateMonthlyDemandBySkill(
    tasks: RecurringTask[],
    monthStart: Date,
    monthEnd: Date
  ): SkillHours[] {
    const skillDemandMap = new Map<SkillType, number>();

    tasks.forEach(task => {
      const calculation = this.calculateMonthlyDemand(task, monthStart, monthEnd);
      
      // Distribute hours across required skills
      task.required_skills.forEach((skill: SkillType) => {
        const currentHours = skillDemandMap.get(skill) || 0;
        // Divide hours by number of skills if task requires multiple skills
        const hoursPerSkill = calculation.monthlyHours / task.required_skills.length;
        skillDemandMap.set(skill, currentHours + hoursPerSkill);
      });
    });

    // Convert map to SkillHours array
    return Array.from(skillDemandMap.entries()).map(([skill, hours]) => ({
      skill,
      hours: Math.round(hours * 100) / 100 // Round to 2 decimal places
    }));
  }

  /**
   * Generate monthly periods for the forecast range
   */
  private static generateMonthlyPeriods(startDate: Date, endDate: Date) {
    const periods = [];
    let currentDate = startOfMonth(startDate);
    
    while (currentDate <= endDate) {
      periods.push({
        start: currentDate,
        end: endOfMonth(currentDate),
        key: format(currentDate, 'yyyy-MM'),
        label: format(currentDate, 'MMM yyyy')
      });
      currentDate = addMonths(currentDate, 1);
    }
    
    return periods;
  }

  /**
   * Transform demand forecast into matrix format
   */
  static transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTask[]
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
    tasks: RecurringTask[],
    skillType: SkillType,
    month: string
  ): ClientTaskDemand[] {
    return tasks
      .filter(task => task.required_skills.includes(skillType))
      .map(task => {
        const calculation = this.calculateMonthlyDemand(
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
