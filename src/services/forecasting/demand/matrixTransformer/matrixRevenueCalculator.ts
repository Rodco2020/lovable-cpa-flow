
import { debugLog } from '../../logger';
import { ClientTotalsCalculator } from './clientTotalsCalculator';
import { ClientRevenueCalculator } from './clientRevenueCalculator';
import { DataFetcher } from '../dataFetcher';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';

/**
 * Matrix Revenue Calculator
 * 
 * Focused service for handling all revenue-related calculations
 * in the matrix transformation process. Extracted from matrixTransformerCore
 * to improve maintainability and separation of concerns.
 */
export class MatrixRevenueCalculator {
  /**
   * Calculate comprehensive revenue metrics for the matrix
   */
  static async calculateMatrixRevenue(
    dataPoints: any[],
    months: any[]
  ): Promise<{
    clientRevenue: Map<string, number>;
    clientHourlyRates: Map<string, number>;
    clientSuggestedRevenue: Map<string, number>;
    clientExpectedLessSuggested: Map<string, number>;
    revenueTotals: {
      totalSuggestedRevenue: number;
      totalExpectedRevenue: number;
      totalExpectedLessSuggested: number;
    };
    skillFeeRates: Map<string, number>;
  }> {
    console.log('💰 [MATRIX REVENUE] Starting comprehensive revenue calculations...');

    try {
      // Calculate client totals from data points
      const clientTotals = ClientTotalsCalculator.calculateClientTotals(dataPoints);

      // Fetch skill fee rates for revenue calculations
      let skillFeeRates = new Map<string, number>();
      try {
        console.log('💰 [MATRIX REVENUE] Fetching skill fee rates...');
        skillFeeRates = await getSkillFeeRatesMap();
        console.log(`💰 [MATRIX REVENUE] Loaded ${skillFeeRates.size} skill fee rates`);
      } catch (error) {
        console.warn('⚠️ [MATRIX REVENUE] Error fetching skill fee rates:', error);
        // Continue without fee rates - calculations will use fallback values
      }

      // Initialize revenue maps
      let clientRevenue = new Map<string, number>();
      let clientHourlyRates = new Map<string, number>();
      let clientSuggestedRevenue = new Map<string, number>();
      let clientExpectedLessSuggested = new Map<string, number>();

      // Fetch client revenue data and calculate revenue metrics
      try {
        console.log('💰 [MATRIX REVENUE] Fetching client revenue data...');
        const clientsWithRevenue = await DataFetcher.fetchClientsWithRevenue();
        
        if (clientsWithRevenue.length > 0) {
          // Build client revenue map
          const clientRevenueMap = ClientRevenueCalculator.buildClientRevenueMap(clientsWithRevenue);
          
          // Calculate total expected revenue per client
          const monthCount = months.length;
          clientRevenue = ClientRevenueCalculator.calculateClientRevenue(
            clientTotals,
            clientRevenueMap,
            monthCount
          );
          
          // Calculate expected hourly rates per client
          clientHourlyRates = ClientRevenueCalculator.calculateClientHourlyRates(
            clientTotals,
            clientRevenue
          );

          // Calculate suggested revenue and expected less suggested per client
          const revenueCalculationResult = await this.calculateClientRevenueMetrics(
            clientTotals,
            clientRevenue,
            skillFeeRates,
            dataPoints
          );

          clientSuggestedRevenue = revenueCalculationResult.clientSuggestedRevenue;
          clientExpectedLessSuggested = revenueCalculationResult.clientExpectedLessSuggested;
          
          console.log(`💰 [MATRIX REVENUE] Revenue calculations complete: ${clientRevenue.size} clients processed`);
        } else {
          console.warn('⚠️ [MATRIX REVENUE] No client revenue data available');
        }
      } catch (revenueError) {
        console.error('❌ [MATRIX REVENUE] Error calculating client revenue:', revenueError);
        // Continue without revenue data rather than failing the entire operation
      }

      // Calculate matrix-level revenue totals
      const revenueTotals = this.calculateMatrixRevenueTotals(
        dataPoints,
        clientRevenue,
        clientSuggestedRevenue
      );

      console.log('✅ [MATRIX REVENUE] Revenue calculations completed successfully');

      return {
        clientRevenue,
        clientHourlyRates,
        clientSuggestedRevenue,
        clientExpectedLessSuggested,
        revenueTotals,
        skillFeeRates
      };

    } catch (error) {
      console.error('❌ [MATRIX REVENUE] Critical error in revenue calculations:', error);
      
      // Return empty but valid structure
      return {
        clientRevenue: new Map(),
        clientHourlyRates: new Map(),
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        },
        skillFeeRates: new Map()
      };
    }
  }

  /**
   * Calculate client-level revenue metrics
   */
  private static async calculateClientRevenueMetrics(
    clientTotals: Map<string, number>,
    clientRevenue: Map<string, number>,
    skillFeeRates: Map<string, number>,
    dataPoints: any[]
  ): Promise<{
    clientSuggestedRevenue: Map<string, number>;
    clientExpectedLessSuggested: Map<string, number>;
  }> {
    const clientSuggestedRevenue = new Map<string, number>();
    const clientExpectedLessSuggested = new Map<string, number>();

    try {
      // Group data points by client for revenue calculation
      const clientDataPoints = new Map<string, any[]>();
      
      dataPoints.forEach(point => {
        if (point.taskBreakdown) {
          point.taskBreakdown.forEach((task: any) => {
            if (!clientDataPoints.has(task.clientName)) {
              clientDataPoints.set(task.clientName, []);
            }
            clientDataPoints.get(task.clientName)!.push({
              ...point,
              clientSpecificHours: task.monthlyHours || point.demandHours
            });
          });
        }
      });

      // Calculate suggested revenue for each client
      for (const [clientName, points] of clientDataPoints) {
        let totalSuggestedRevenue = 0;

        for (const point of points) {
          const feeRate = skillFeeRates.get(point.skillType) || 75.00; // Fallback rate
          const suggestedRevenue = (point.clientSpecificHours || point.demandHours) * feeRate;
          totalSuggestedRevenue += suggestedRevenue;
        }

        const expectedRevenue = clientRevenue.get(clientName) || 0;
        const expectedLessSuggested = expectedRevenue - totalSuggestedRevenue;

        clientSuggestedRevenue.set(clientName, totalSuggestedRevenue);
        clientExpectedLessSuggested.set(clientName, expectedLessSuggested);

        console.log(`💰 [CLIENT REVENUE] ${clientName}: Expected $${expectedRevenue}, Suggested $${totalSuggestedRevenue.toFixed(2)}, Difference $${expectedLessSuggested.toFixed(2)}`);
      }

      return { clientSuggestedRevenue, clientExpectedLessSuggested };
    } catch (error) {
      console.error('❌ [MATRIX REVENUE] Error calculating client revenue metrics:', error);
      return { 
        clientSuggestedRevenue: new Map(), 
        clientExpectedLessSuggested: new Map() 
      };
    }
  }

  /**
   * Calculate matrix-level revenue totals
   */
  private static calculateMatrixRevenueTotals(
    dataPoints: any[],
    clientRevenue: Map<string, number>,
    clientSuggestedRevenue: Map<string, number>
  ) {
    const totalSuggestedRevenue = Array.from(clientSuggestedRevenue.values())
      .reduce((sum, revenue) => sum + revenue, 0);
    
    const totalExpectedRevenue = Array.from(clientRevenue.values())
      .reduce((sum, revenue) => sum + revenue, 0);
    
    const totalExpectedLessSuggested = totalExpectedRevenue - totalSuggestedRevenue;

    return {
      totalSuggestedRevenue,
      totalExpectedRevenue,
      totalExpectedLessSuggested
    };
  }

  /**
   * Enhance skill summary with revenue information
   */
  static enhanceSkillSummaryWithRevenue(
    skillSummary: any,
    skillFeeRates: Map<string, number>,
    dataPoints: any[]
  ) {
    const enhancedSummary = { ...skillSummary };

    Object.keys(enhancedSummary).forEach(skillName => {
      const skillData = enhancedSummary[skillName];
      const feeRate = skillFeeRates.get(skillName) || 75.00;

      // Calculate total suggested revenue for this skill
      const totalSuggestedRevenue = skillData.totalHours * feeRate;
      
      // Calculate expected less suggested (this would need client allocation logic)
      const totalExpectedLessSuggested = 0; // Simplified for now

      skillData.totalSuggestedRevenue = totalSuggestedRevenue;
      skillData.totalExpectedLessSuggested = totalExpectedLessSuggested;
      skillData.averageFeeRate = feeRate;
    });

    return enhancedSummary;
  }
}
