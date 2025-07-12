/**
 * Task interface for calculations
 */
interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
  monthlyDistribution?: Record<string, number>;
  totalHours?: number;
  recurringTaskId?: string;
  preferredStaffId?: string | null;
  preferredStaffName?: string;
}

/**
 * Client data interface for revenue calculations
 */
interface ClientData {
  id: string;
  legalName: string;
  expectedMonthlyRevenue: number;
}

/**
 * Detail Matrix Calculation Utilities - Phase 4 Extraction
 * 
 * Contains calculation helpers and utilities for the detail matrix:
 * - Task aggregation logic
 * - Client revenue data preparation
 * - Statistical calculations
 * - Data transformation utilities
 */
export class DetailMatrixCalculations {
  
  /**
   * Build client revenue data for calculations
   * Wrapper around the DetailTaskRevenueCalculator method for easier testing and reuse
   */
  static buildClientRevenueData(
    clients: ClientData[],
    tasks: Task[],
    monthCount: number = 1
  ) {
    // Transform client data to match calculator interface
    const transformedClients = clients.map(client => ({
      id: client.id,
      legal_name: client.legalName,
      expected_monthly_revenue: client.expectedMonthlyRevenue
    }));

    // Use the calculator's method
    const { DetailTaskRevenueCalculator } = require('@/services/forecasting/demand/calculators/detailTaskRevenueCalculator');
    return DetailTaskRevenueCalculator.buildClientRevenueData(
      transformedClients,
      tasks,
      monthCount
    );
  }

  /**
   * Calculate task statistics for summary display
   */
  static calculateTaskStatistics(tasks: Task[]): {
    totalTasks: number;
    totalHours: number;
    averageHoursPerTask: number;
    tasksBySkill: Map<string, number>;
    tasksByClient: Map<string, number>;
    tasksByPriority: Map<string, number>;
    tasksByCategory: Map<string, number>;
    tasksWithPreferredStaff: number;
    tasksWithoutPreferredStaff: number;
  } {
    if (!tasks || tasks.length === 0) {
      return {
        totalTasks: 0,
        totalHours: 0,
        averageHoursPerTask: 0,
        tasksBySkill: new Map(),
        tasksByClient: new Map(),
        tasksByPriority: new Map(),
        tasksByCategory: new Map(),
        tasksWithPreferredStaff: 0,
        tasksWithoutPreferredStaff: 0
      };
    }

    const stats = {
      totalTasks: tasks.length,
      totalHours: 0,
      averageHoursPerTask: 0,
      tasksBySkill: new Map<string, number>(),
      tasksByClient: new Map<string, number>(),
      tasksByPriority: new Map<string, number>(),
      tasksByCategory: new Map<string, number>(),
      tasksWithPreferredStaff: 0,
      tasksWithoutPreferredStaff: 0
    };

    tasks.forEach(task => {
      const hours = task.totalHours || task.monthlyHours || 0;
      stats.totalHours += hours;

      // Count by skill
      const currentSkillCount = stats.tasksBySkill.get(task.skillRequired) || 0;
      stats.tasksBySkill.set(task.skillRequired, currentSkillCount + 1);

      // Count by client
      const currentClientCount = stats.tasksByClient.get(task.clientName) || 0;
      stats.tasksByClient.set(task.clientName, currentClientCount + 1);

      // Count by priority
      const currentPriorityCount = stats.tasksByPriority.get(task.priority) || 0;
      stats.tasksByPriority.set(task.priority, currentPriorityCount + 1);

      // Count by category
      const currentCategoryCount = stats.tasksByCategory.get(task.category) || 0;
      stats.tasksByCategory.set(task.category, currentCategoryCount + 1);

      // Count staff assignments
      if (task.preferredStaffId && task.preferredStaffName) {
        stats.tasksWithPreferredStaff++;
      } else {
        stats.tasksWithoutPreferredStaff++;
      }
    });

    stats.averageHoursPerTask = stats.totalTasks > 0 ? stats.totalHours / stats.totalTasks : 0;

    return stats;
  }

  /**
   * Calculate filter statistics
   */
  static calculateFilterStatistics(
    originalTasks: Task[],
    filteredTasks: Task[],
    selectedSkills: string[],
    selectedClients: string[],
    selectedStaff: (string | number | null | undefined)[],
    monthRange: { start: number; end: number }
  ): {
    originalCount: number;
    filteredCount: number;
    reductionPercentage: number;
    skillsFiltered: number;
    clientsFiltered: number;
    staffFiltered: number;
    monthRangeFiltered: number;
    filterEfficiency: string;
  } {
    const originalCount = originalTasks.length;
    const filteredCount = filteredTasks.length;
    const reductionPercentage = originalCount > 0 
      ? ((originalCount - filteredCount) / originalCount) * 100 
      : 0;

    return {
      originalCount,
      filteredCount,
      reductionPercentage,
      skillsFiltered: selectedSkills.length,
      clientsFiltered: selectedClients.length,
      staffFiltered: selectedStaff.filter(s => s != null).length,
      monthRangeFiltered: monthRange.end - monthRange.start + 1,
      filterEfficiency: `${((filteredCount / originalCount) * 100).toFixed(1)}%`
    };
  }

  /**
   * Group tasks by a specified field
   */
  static groupTasksBy<K extends keyof Task>(
    tasks: Task[],
    groupByField: K
  ): Map<Task[K], Task[]> {
    const groups = new Map<Task[K], Task[]>();

    tasks.forEach(task => {
      const key = task[groupByField];
      const existingGroup = groups.get(key) || [];
      existingGroup.push(task);
      groups.set(key, existingGroup);
    });

    return groups;
  }

  /**
   * Calculate hours distribution across months
   */
  static calculateMonthlyDistribution(tasks: Task[]): Map<string, number> {
    const distribution = new Map<string, number>();

    tasks.forEach(task => {
      if (task.monthlyDistribution) {
        // Use aggregated monthly distribution
        Object.entries(task.monthlyDistribution).forEach(([month, hours]) => {
          const currentHours = distribution.get(month) || 0;
          distribution.set(month, currentHours + hours);
        });
      } else {
        // Fallback to single month
        const currentHours = distribution.get(task.month) || 0;
        distribution.set(task.month, currentHours + (task.totalHours || task.monthlyHours || 0));
      }
    });

    return distribution;
  }

  /**
   * Validate task data for calculations
   */
  static validateTaskData(tasks: Task[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(tasks)) {
      errors.push('Tasks must be an array');
      return { isValid: false, errors, warnings };
    }

    tasks.forEach((task, index) => {
      if (!task.id) {
        errors.push(`Task at index ${index} missing required field: id`);
      }
      if (!task.taskName) {
        errors.push(`Task at index ${index} missing required field: taskName`);
      }
      if (!task.clientName) {
        errors.push(`Task at index ${index} missing required field: clientName`);
      }
      if (!task.skillRequired) {
        errors.push(`Task at index ${index} missing required field: skillRequired`);
      }
      if (typeof task.monthlyHours !== 'number' || task.monthlyHours < 0) {
        errors.push(`Task at index ${index} has invalid monthlyHours: ${task.monthlyHours}`);
      }

      // Warnings for optional but important fields
      if (!task.recurringTaskId) {
        warnings.push(`Task at index ${index} (${task.taskName}) missing recurringTaskId - may affect aggregation`);
      }
      if (task.totalHours && task.totalHours !== task.monthlyHours && !task.monthlyDistribution) {
        warnings.push(`Task at index ${index} (${task.taskName}) has totalHours different from monthlyHours but no monthlyDistribution`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate top performers by various metrics
   */
  static calculateTopPerformers(tasks: Task[]): {
    topSkillsByTaskCount: Array<{ skill: string; count: number; percentage: number }>;
    topClientsByTaskCount: Array<{ client: string; count: number; percentage: number }>;
    topSkillsByHours: Array<{ skill: string; hours: number; percentage: number }>;
    topClientsByHours: Array<{ client: string; hours: number; percentage: number }>;
  } {
    const tasksBySkill = this.groupTasksBy(tasks, 'skillRequired');
    const tasksByClient = this.groupTasksBy(tasks, 'clientName');
    const totalTasks = tasks.length;
    const totalHours = tasks.reduce((sum, task) => sum + (task.totalHours || task.monthlyHours || 0), 0);

    // Top skills by task count
    const topSkillsByTaskCount = Array.from(tasksBySkill.entries())
      .map(([skill, skillTasks]) => ({
        skill,
        count: skillTasks.length,
        percentage: (skillTasks.length / totalTasks) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top clients by task count
    const topClientsByTaskCount = Array.from(tasksByClient.entries())
      .map(([client, clientTasks]) => ({
        client,
        count: clientTasks.length,
        percentage: (clientTasks.length / totalTasks) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top skills by hours
    const topSkillsByHours = Array.from(tasksBySkill.entries())
      .map(([skill, skillTasks]) => {
        const hours = skillTasks.reduce((sum, task) => sum + (task.totalHours || task.monthlyHours || 0), 0);
        return {
          skill,
          hours,
          percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10);

    // Top clients by hours
    const topClientsByHours = Array.from(tasksByClient.entries())
      .map(([client, clientTasks]) => {
        const hours = clientTasks.reduce((sum, task) => sum + (task.totalHours || task.monthlyHours || 0), 0);
        return {
          client,
          hours,
          percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10);

    return {
      topSkillsByTaskCount,
      topClientsByTaskCount,
      topSkillsByHours,
      topClientsByHours
    };
  }
}