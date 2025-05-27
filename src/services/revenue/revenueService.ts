
/**
 * Revenue Calculation Service - Core Implementation
 * 
 * Orchestrates revenue calculations with proper business logic,
 * caching, and validation
 */

import { logError } from '@/services/errorLoggingService';
import { RevenueDataAccess } from './dataAccess';
import { RevenueCalculator } from './calculator';
import { RevenueCacheManager } from './cache';
import { RevenueValidator } from './validator';
import { 
  RevenueCalculation, 
  TaskRevenueBreakdown, 
  RevenueProjection,
  RevenueValidationResult,
  RevenueConfig 
} from './types';

export class RevenueService {
  private dataAccess: RevenueDataAccess;
  private calculator: RevenueCalculator;
  private cache: RevenueCacheManager;
  private validator: RevenueValidator;
  private config: RevenueConfig;

  constructor(config: Partial<RevenueConfig> = {}) {
    this.config = {
      defaultHourlyRate: 150,
      defaultProfitMargin: 0.3,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
      ...config
    };

    this.dataAccess = new RevenueDataAccess();
    this.calculator = new RevenueCalculator(this.config);
    this.cache = new RevenueCacheManager(this.config.cacheTTL);
    this.validator = new RevenueValidator(this.dataAccess);
  }

  /**
   * Calculate comprehensive revenue metrics for a client
   */
  async calculateClientRevenue(clientId: string): Promise<RevenueCalculation> {
    const cacheKey = `client-revenue:${clientId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const startTime = performance.now();

      // Get all required data
      const [client, recurringTasks, taskInstances, skillRates] = await Promise.all([
        this.dataAccess.getClient(clientId),
        this.dataAccess.getRecurringTasks(clientId),
        this.dataAccess.getTaskInstances(clientId),
        this.dataAccess.getSkillRates()
      ]);

      if (!client) {
        throw new Error(`Client not found: ${clientId}`);
      }

      const calculation = this.calculator.calculateClientRevenue(
        client,
        recurringTasks,
        taskInstances,
        skillRates
      );

      const duration = performance.now() - startTime;
      console.log(`Revenue calculation completed in ${duration.toFixed(2)}ms`);

      this.cache.set(cacheKey, calculation);
      return calculation;
    } catch (error) {
      logError('Revenue calculation failed', 'error', {
        component: 'RevenueService',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: { clientReference: clientId }
      });
      throw error;
    }
  }

  /**
   * Calculate task-level revenue breakdown
   */
  async calculateTaskRevenue(clientId: string): Promise<TaskRevenueBreakdown[]> {
    const cacheKey = `task-revenue:${clientId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const [recurringTasks, taskInstances, skillRates] = await Promise.all([
        this.dataAccess.getRecurringTasks(clientId),
        this.dataAccess.getTaskInstances(clientId),
        this.dataAccess.getSkillRates()
      ]);

      const breakdown = this.calculator.calculateTaskBreakdown(
        [...recurringTasks, ...taskInstances],
        skillRates
      );

      this.cache.set(cacheKey, breakdown);
      return breakdown;
    } catch (error) {
      logError('Task revenue calculation failed', 'error', {
        component: 'RevenueService',
        details: error instanceof Error ? error.message : 'Unknown error',
        data: { clientReference: clientId }
      });
      throw error;
    }
  }

  /**
   * Calculate revenue projections based on capacity and demand
   */
  async calculateRevenueProjections(timeframeMonths: number = 12): Promise<RevenueProjection> {
    try {
      const clients = await this.dataAccess.getActiveClients();
      return this.calculator.calculateProjections(clients, timeframeMonths);
    } catch (error) {
      logError('Revenue projection calculation failed', 'error', {
        component: 'RevenueService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Validate revenue data consistency
   */
  async validateRevenueData(clientId: string): Promise<RevenueValidationResult> {
    return this.validator.validateRevenueData(clientId);
  }

  /**
   * Clear revenue calculation cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
