
/**
 * Revenue Calculation Service
 * Extracted from matrixTransformerCore.ts for better maintainability
 */

export interface ClientRevenueMetrics {
  clientSuggestedRevenue: Map<string, number>;
  clientExpectedLessSuggested: Map<string, number>;
}

export interface MatrixRevenueTotals {
  totalSuggestedRevenue: number;
  totalExpectedRevenue: number;
  totalExpectedLessSuggested: number;
}

export class RevenueCalculatorService {
  /**
   * Calculate client-level revenue metrics
   */
  static async calculateClientRevenueMetrics(
    clientTotals: Map<string, number>,
    clientRevenue: Map<string, number>,
    skillFeeRates: Map<string, number>,
    dataPoints: any[]
  ): Promise<ClientRevenueMetrics> {
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
      console.error('❌ Error calculating client revenue metrics:', error);
      return { clientSuggestedRevenue, clientExpectedLessSuggested };
    }
  }

  /**
   * Calculate matrix-level revenue totals
   */
  static calculateMatrixRevenueTotals(
    dataPoints: any[],
    clientRevenue: Map<string, number>,
    clientSuggestedRevenue: Map<string, number>
  ): MatrixRevenueTotals {
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
  ): any {
    const enhancedSummary = { ...skillSummary };

    Object.keys(enhancedSummary).forEach(skillName => {
      const skillData = enhancedSummary[skillName];
      const feeRate = skillFeeRates.get(skillName) || 75.00;

      // Calculate total suggested revenue for this skill
      const totalSuggestedRevenue = skillData.totalHours * feeRate;
      
      // Calculate expected less suggested (simplified for now)
      const totalExpectedLessSuggested = 0;

      skillData.totalSuggestedRevenue = totalSuggestedRevenue;
      skillData.totalExpectedLessSuggested = totalExpectedLessSuggested;
      skillData.averageFeeRate = feeRate;
    });

    return enhancedSummary;
  }
}
