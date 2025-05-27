
import { supabase } from '@/lib/supabaseClient';
import { logError } from '@/services/errorLoggingService';

/**
 * Revenue Calculation Service
 * 
 * Handles all revenue calculations with proper business logic,
 * caching, and validation
 */

export interface RevenueCalculation {
  clientId: string;
  expectedMonthlyRevenue: number;
  projectedAnnualRevenue: number;
  actualRevenueToDate: number;
  taskBasedRevenue: number;
  hourlyRateRevenue: number;
  averageHourlyRate: number;
  utilizationRate: number;
  profitMargin: number;
}

export interface TaskRevenueBreakdown {
  taskId: string;
  taskName: string;
  estimatedRevenue: number;
  actualRevenue: number;
  hourlyRate: number;
  estimatedHours: number;
  actualHours: number;
  profitMargin: number;
}

class RevenueCalculationService {
  private readonly DEFAULT_HOURLY_RATE = 150;
  private readonly DEFAULT_PROFIT_MARGIN = 0.3; // 30%
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes for revenue data

  /**
   * Calculate comprehensive revenue metrics for a client
   */
  async calculateClientRevenue(clientId: string): Promise<RevenueCalculation> {
    const cacheKey = `client-revenue:${clientId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const startTime = performance.now();

      // Get client data with revenue expectations
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id, legal_name, expected_monthly_revenue')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        throw new Error(`Client not found: ${clientId}`);
      }

      // Get all tasks for revenue calculation
      const [recurringTasks, taskInstances, skills] = await Promise.all([
        this.getRecurringTasks(clientId),
        this.getTaskInstances(clientId),
        this.getSkillRates()
      ]);

      const calculation = this.performRevenueCalculation(
        client,
        recurringTasks,
        taskInstances,
        skills
      );

      const duration = performance.now() - startTime;
      console.log(`Revenue calculation completed in ${duration.toFixed(2)}ms`);

      this.setCache(cacheKey, calculation);
      return calculation;
    } catch (error) {
      logError('Revenue calculation failed', 'error', {
        component: 'RevenueCalculationService',
        clientId,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Calculate task-level revenue breakdown
   */
  async calculateTaskRevenue(clientId: string): Promise<TaskRevenueBreakdown[]> {
    const cacheKey = `task-revenue:${clientId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const [recurringTasks, taskInstances, skills] = await Promise.all([
        this.getRecurringTasks(clientId),
        this.getTaskInstances(clientId),
        this.getSkillRates()
      ]);

      const breakdown = this.calculateTaskBreakdown(
        [...recurringTasks, ...taskInstances],
        skills
      );

      this.setCache(cacheKey, breakdown);
      return breakdown;
    } catch (error) {
      logError('Task revenue calculation failed', 'error', {
        component: 'RevenueCalculationService',
        clientId,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Calculate revenue projections based on capacity and demand
   */
  async calculateRevenueProjections(timeframeMonths: number = 12): Promise<{
    projectedRevenue: number;
    confidenceLevel: number;
    factors: string[];
  }> {
    try {
      // Get all active clients and their expected revenue
      const { data: clients, error } = await supabase
        .from('clients')
        .select('expected_monthly_revenue, status')
        .eq('status', 'Active');

      if (error) throw error;

      const totalMonthlyRevenue = clients?.reduce(
        (sum, client) => sum + (client.expected_monthly_revenue || 0),
        0
      ) || 0;

      const projectedRevenue = totalMonthlyRevenue * timeframeMonths;
      
      // Calculate confidence based on data quality
      const confidenceFactors = this.calculateConfidenceFactors(clients || []);
      
      return {
        projectedRevenue,
        confidenceLevel: confidenceFactors.confidence,
        factors: confidenceFactors.factors
      };
    } catch (error) {
      logError('Revenue projection calculation failed', 'error', {
        component: 'RevenueCalculationService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async getRecurringTasks(clientId: string) {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  private async getTaskInstances(clientId: string) {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    return data || [];
  }

  private async getSkillRates() {
    const { data, error } = await supabase
      .from('skills')
      .select('name, cost_per_hour');

    if (error) throw error;
    
    const skillMap = new Map();
    data?.forEach(skill => {
      skillMap.set(skill.name, skill.cost_per_hour || this.DEFAULT_HOURLY_RATE);
    });
    
    return skillMap;
  }

  private performRevenueCalculation(
    client: any,
    recurringTasks: any[],
    taskInstances: any[],
    skillRates: Map<string, number>
  ): RevenueCalculation {
    const expectedMonthlyRevenue = client.expected_monthly_revenue || 0;
    const allTasks = [...recurringTasks, ...taskInstances];
    
    // Calculate task-based revenue
    let taskBasedRevenue = 0;
    let totalEstimatedHours = 0;
    let weightedHourlyRate = 0;

    allTasks.forEach(task => {
      const estimatedHours = task.estimated_hours || 0;
      const primarySkill = Array.isArray(task.required_skills) && task.required_skills.length > 0 
        ? task.required_skills[0] 
        : null;
      
      const hourlyRate = primarySkill 
        ? skillRates.get(primarySkill) || this.DEFAULT_HOURLY_RATE
        : this.DEFAULT_HOURLY_RATE;

      taskBasedRevenue += estimatedHours * hourlyRate;
      totalEstimatedHours += estimatedHours;
      weightedHourlyRate += hourlyRate * estimatedHours;
    });

    const averageHourlyRate = totalEstimatedHours > 0 
      ? weightedHourlyRate / totalEstimatedHours 
      : this.DEFAULT_HOURLY_RATE;

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

  private calculateTaskBreakdown(tasks: any[], skillRates: Map<string, number>): TaskRevenueBreakdown[] {
    return tasks.map(task => {
      const estimatedHours = task.estimated_hours || 0;
      const primarySkill = Array.isArray(task.required_skills) && task.required_skills.length > 0 
        ? task.required_skills[0] 
        : null;
      
      const hourlyRate = primarySkill 
        ? skillRates.get(primarySkill) || this.DEFAULT_HOURLY_RATE
        : this.DEFAULT_HOURLY_RATE;

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
        profitMargin: this.DEFAULT_PROFIT_MARGIN
      };
    });
  }

  private calculateUtilizationRate(tasks: any[]): number {
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    return tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  }

  private calculateProfitMargin(revenue: number, hourlyRate: number): number {
    // Simplified profit margin calculation
    const cost = revenue * (1 - this.DEFAULT_PROFIT_MARGIN);
    return revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
  }

  private calculateConfidenceFactors(clients: any[]): { confidence: number; factors: string[] } {
    const factors: string[] = [];
    let confidence = 100;

    // Check for missing revenue data
    const clientsWithRevenue = clients.filter(c => c.expected_monthly_revenue > 0);
    if (clientsWithRevenue.length < clients.length) {
      confidence -= 20;
      factors.push('Some clients missing revenue expectations');
    }

    // Check for data recency (would require additional queries in real implementation)
    if (clients.length === 0) {
      confidence -= 50;
      factors.push('No active clients');
    }

    return {
      confidence: Math.max(confidence, 0),
      factors
    };
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear revenue calculation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Validate revenue data consistency
   */
  async validateRevenueData(clientId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const { data: client } = await supabase
        .from('clients')
        .select('expected_monthly_revenue')
        .eq('id', clientId)
        .single();

      if (!client?.expected_monthly_revenue || client.expected_monthly_revenue <= 0) {
        issues.push('Client has no expected monthly revenue set');
      }

      // Additional validation logic would go here

      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push('Failed to validate revenue data');
      return {
        isValid: false,
        issues
      };
    }
  }
}

export const revenueCalculationService = new RevenueCalculationService();
export default revenueCalculationService;
