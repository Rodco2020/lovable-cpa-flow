
import { FormattedTask } from '../types';
import { TaskMetricsService } from './taskMetricsService';

export interface TrendMetrics {
  skillTrends: SkillTrendData[];
  clientTrends: ClientTrendData[];
  priorityTrends: PriorityTrendData[];
  monthlyDistribution: MonthlyDistributionData[];
}

export interface SkillTrendData {
  skill: string;
  totalHours: number;
  taskCount: number;
  avgHoursPerTask: number;
  utilizationScore: number;
}

export interface ClientTrendData {
  clientName: string;
  taskCount: number;
  totalHours: number;
  avgPriority: number;
  skillDiversity: number;
}

export interface PriorityTrendData {
  priority: string;
  count: number;
  totalHours: number;
  avgHoursPerTask: number;
}

export interface MonthlyDistributionData {
  month: string;
  recurringTasks: number;
  adHocTasks: number;
  totalHours: number;
}

/**
 * Enhanced Metrics Service
 * 
 * Provides advanced metrics calculations including trend analysis,
 * comparative metrics, and skill utilization analysis
 */
export class EnhancedMetricsService {
  /**
   * Calculate comprehensive trend metrics from task data
   */
  static calculateTrendMetrics(tasks: FormattedTask[]): TrendMetrics {
    if (!tasks || tasks.length === 0) {
      return {
        skillTrends: [],
        clientTrends: [],
        priorityTrends: [],
        monthlyDistribution: []
      };
    }

    return {
      skillTrends: this.calculateSkillTrends(tasks),
      clientTrends: this.calculateClientTrends(tasks),
      priorityTrends: this.calculatePriorityTrends(tasks),
      monthlyDistribution: this.calculateMonthlyDistribution(tasks)
    };
  }

  /**
   * Calculate skill utilization trends and efficiency metrics
   */
  private static calculateSkillTrends(tasks: FormattedTask[]): SkillTrendData[] {
    const skillMap = new Map<string, {
      totalHours: number;
      taskCount: number;
      tasks: FormattedTask[];
    }>();

    // Aggregate data by skill
    tasks.forEach(task => {
      task.requiredSkills.forEach(skill => {
        if (!skillMap.has(skill)) {
          skillMap.set(skill, { totalHours: 0, taskCount: 0, tasks: [] });
        }
        const skillData = skillMap.get(skill)!;
        skillData.totalHours += task.estimatedHours;
        skillData.taskCount += 1;
        skillData.tasks.push(task);
      });
    });

    // Calculate trends and utilization scores
    return Array.from(skillMap.entries()).map(([skill, data]) => {
      const avgHoursPerTask = data.totalHours / data.taskCount;
      
      // Utilization score based on frequency and hour distribution
      const utilizationScore = Math.min(100, (data.taskCount * avgHoursPerTask) / 10);
      
      return {
        skill,
        totalHours: data.totalHours,
        taskCount: data.taskCount,
        avgHoursPerTask,
        utilizationScore
      };
    }).sort((a, b) => b.totalHours - a.totalHours);
  }

  /**
   * Calculate client engagement trends and metrics
   */
  private static calculateClientTrends(tasks: FormattedTask[]): ClientTrendData[] {
    const clientMap = new Map<string, {
      tasks: FormattedTask[];
      totalHours: number;
      priorities: string[];
      skills: Set<string>;
    }>();

    // Aggregate data by client
    tasks.forEach(task => {
      if (!clientMap.has(task.clientName)) {
        clientMap.set(task.clientName, {
          tasks: [],
          totalHours: 0,
          priorities: [],
          skills: new Set()
        });
      }
      const clientData = clientMap.get(task.clientName)!;
      clientData.tasks.push(task);
      clientData.totalHours += task.estimatedHours;
      clientData.priorities.push(task.priority);
      task.requiredSkills.forEach(skill => clientData.skills.add(skill));
    });

    // Calculate client trends
    return Array.from(clientMap.entries()).map(([clientName, data]) => {
      // Calculate average priority (convert to numeric for calculation)
      const priorityValues = data.priorities.map(p => {
        switch (p.toLowerCase()) {
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 2;
        }
      });
      const avgPriority = priorityValues.reduce((a, b) => a + b, 0) / priorityValues.length;

      return {
        clientName,
        taskCount: data.tasks.length,
        totalHours: data.totalHours,
        avgPriority,
        skillDiversity: data.skills.size
      };
    }).sort((a, b) => b.taskCount - a.taskCount);
  }

  /**
   * Calculate priority distribution trends
   */
  private static calculatePriorityTrends(tasks: FormattedTask[]): PriorityTrendData[] {
    const priorityMap = new Map<string, {
      count: number;
      totalHours: number;
    }>();

    // Aggregate data by priority
    tasks.forEach(task => {
      if (!priorityMap.has(task.priority)) {
        priorityMap.set(task.priority, { count: 0, totalHours: 0 });
      }
      const priorityData = priorityMap.get(task.priority)!;
      priorityData.count += 1;
      priorityData.totalHours += task.estimatedHours;
    });

    // Calculate priority trends
    return Array.from(priorityMap.entries()).map(([priority, data]) => ({
      priority,
      count: data.count,
      totalHours: data.totalHours,
      avgHoursPerTask: data.totalHours / data.count
    })).sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate monthly distribution of tasks (based on due dates)
   */
  private static calculateMonthlyDistribution(tasks: FormattedTask[]): MonthlyDistributionData[] {
    const monthMap = new Map<string, {
      recurringTasks: number;
      adHocTasks: number;
      totalHours: number;
    }>();

    // Aggregate data by month
    tasks.forEach(task => {
      if (!task.dueDate) return;
      
      const monthKey = task.dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { recurringTasks: 0, adHocTasks: 0, totalHours: 0 });
      }
      
      const monthData = monthMap.get(monthKey)!;
      if (task.taskType === 'Recurring') {
        monthData.recurringTasks += 1;
      } else {
        monthData.adHocTasks += 1;
      }
      monthData.totalHours += task.estimatedHours;
    });

    // Sort by month and return
    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        recurringTasks: data.recurringTasks,
        adHocTasks: data.adHocTasks,
        totalHours: data.totalHours
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }

  /**
   * Calculate comparative metrics (month-over-month, etc.)
   */
  static calculateComparativeMetrics(
    currentTasks: FormattedTask[],
    previousTasks?: FormattedTask[]
  ) {
    const current = TaskMetricsService.calculateTaskMetrics(currentTasks);
    
    if (!previousTasks || previousTasks.length === 0) {
      return {
        current,
        comparison: null
      };
    }

    const previous = TaskMetricsService.calculateTaskMetrics(previousTasks);
    
    const comparison = {
      totalTasksChange: ((current.totalTasks - previous.totalTasks) / previous.totalTasks) * 100,
      totalHoursChange: ((current.totalEstimatedHours - previous.totalEstimatedHours) / previous.totalEstimatedHours) * 100,
      avgHoursChange: ((current.averageHoursPerTask - previous.averageHoursPerTask) / previous.averageHoursPerTask) * 100
    };

    return {
      current,
      previous,
      comparison
    };
  }
}
