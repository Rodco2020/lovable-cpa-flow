
/**
 * Revenue Calculation Engine
 * 
 * Handles all revenue calculation logic
 */

import { 
  RevenueCalculation, 
  TaskRevenueBreakdown, 
  ClientData, 
  TaskData, 
  SkillRateMap,
  RevenueConfig 
} from './types';

export class RevenueCalculator {
  private config: RevenueConfig;

  constructor(config: RevenueConfig) {
    this.config = config;
  }

  /**
   * Perform comprehensive revenue calculation for a client
   */
  calculateClientRevenue(
    client: ClientData,
    recurringTasks: TaskData[],
    taskInstances: TaskData[],
    skillRates: SkillRateMap
  ): RevenueCalculation {
    const expectedMonthlyRevenue = client.expected_monthly_revenue || 0;
    const allTasks = [...recurringTasks, ...taskInstances];
    
    // Calculate task-based revenue
    let taskBasedRevenue = 0;
    let totalEstimatedHours = 0;
    let weightedHourlyRate = 0;

    allTasks.forEach(task => {
      const estimatedHours = task.estimated_hours || 0;
      const hourlyRate = this.getTaskHourlyRate(task, skillRates);

      taskBasedRevenue += estimatedHours * hourlyRate;
      totalEstimatedHours += estimatedHours;
      weightedHourlyRate += hourlyRate * estimatedHours;
    });

    const averageHourlyRate = totalEstimatedHours > 0 
      ? weightedHourlyRate / totalEstimatedHours 
      : this.config.defaultHourlyRate;

    // Calculate utilization and profit margins
    const utilizationRate = this.calculateUtilizationRate(allTasks);
    const profitMargin = this.calculateProfitMargin(taskBasedRevenue, averageHourlyRate);

    return {
      clientId: client.id,
      expectedMonthlyRevenue,
      projectedAnnualRevenue: expectedMonthlyRevenue * 12,
      actualRevenueToDate: 0, // Would be calculated from actual billing data
      taskBasedRevenue,
      hourlyRateRevenue: taskBasedRevenue,
      averageHourlyRate,
      utilizationRate,
      profitMargin
    };
  }

  /**
   * Calculate task-level revenue breakdown
   */
  calculateTaskBreakdown(tasks: TaskData[], skillRates: SkillRateMap): TaskRevenueBreakdown[] {
    return tasks.map(task => {
      const estimatedHours = task.estimated_hours || 0;
      const hourlyRate = this.getTaskHourlyRate(task, skillRates);
      const estimatedRevenue = estimatedHours * hourlyRate;
      const actualRevenue = task.status === 'Completed' ? estimatedRevenue : 0;

      return {
        taskId: task.id,
        taskName: task.name,
        estimatedRevenue,
        actualRevenue,
        hourlyRate,
        estimatedHours,
        actualHours: task.status === 'Completed' ? estimatedHours : 0,
        profitMargin: this.config.defaultProfitMargin * 100
      };
    });
  }

  /**
   * Calculate revenue projections
   */
  calculateProjections(clients: ClientData[], timeframeMonths: number): {
    projectedRevenue: number;
    confidenceLevel: number;
    factors: string[];
  } {
    const totalMonthlyRevenue = clients.reduce(
      (sum, client) => sum + (client.expected_monthly_revenue || 0),
      0
    );

    const projectedRevenue = totalMonthlyRevenue * timeframeMonths;
    const confidenceFactors = this.calculateConfidenceFactors(clients);
    
    return {
      projectedRevenue,
      confidenceLevel: confidenceFactors.confidence,
      factors: confidenceFactors.factors
    };
  }

  /**
   * Get hourly rate for a task based on skills
   */
  private getTaskHourlyRate(task: TaskData, skillRates: SkillRateMap): number {
    const primarySkill = Array.isArray(task.required_skills) && task.required_skills.length > 0 
      ? task.required_skills[0] 
      : null;
    
    return primarySkill 
      ? skillRates.get(primarySkill) || this.config.defaultHourlyRate
      : this.config.defaultHourlyRate;
  }

  /**
   * Calculate utilization rate
   */
  private calculateUtilizationRate(tasks: TaskData[]): number {
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    return tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  }

  /**
   * Calculate profit margin
   */
  private calculateProfitMargin(revenue: number, hourlyRate: number): number {
    const cost = revenue * (1 - this.config.defaultProfitMargin);
    return revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
  }

  /**
   * Calculate confidence factors for projections
   */
  private calculateConfidenceFactors(clients: ClientData[]): { confidence: number; factors: string[] } {
    const factors: string[] = [];
    let confidence = 100;

    // Check for missing revenue data
    const clientsWithRevenue = clients.filter(c => c.expected_monthly_revenue > 0);
    if (clientsWithRevenue.length < clients.length) {
      confidence -= 20;
      factors.push('Some clients missing revenue expectations');
    }

    // Check for data availability
    if (clients.length === 0) {
      confidence -= 50;
      factors.push('No active clients');
    }

    return {
      confidence: Math.max(confidence, 0),
      factors
    };
  }
}
