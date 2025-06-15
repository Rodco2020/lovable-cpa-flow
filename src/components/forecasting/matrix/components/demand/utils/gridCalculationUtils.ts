
/**
 * Grid Calculation Utilities for Demand Matrix
 * 
 * Handles grand total calculations and revenue computations
 */

import { roundToDecimals } from '@/lib/numberUtils';
import { ClientTotalsCalculator } from '@/services/forecasting/demand/matrixTransformer/clientTotalsCalculator';
import { ClientRevenueCalculator } from '@/services/forecasting/demand/matrixTransformer/clientRevenueCalculator';

export interface GrandTotals {
  grandTotalHours: number;
  grandTotalRevenue: number;
  grandAverageRate: number;
  grandTotalSuggestedRevenue: number;
  grandTotalExpectedLessSuggested: number;
}

/**
 * Calculate grand totals for client mode
 */
export const calculateGrandTotals = (
  clientTotals: Map<string, number>,
  clientRevenue: Map<string, number>,
  clientSuggestedRevenue: Map<string, number>,
  clientExpectedLessSuggested: Map<string, number>
): GrandTotals => {
  const grandTotalHours = roundToDecimals(ClientTotalsCalculator.calculateGrandTotal(clientTotals), 1);
  const grandTotalRevenue = roundToDecimals(ClientRevenueCalculator.calculateGrandTotalRevenue(clientRevenue), 0);
  const grandAverageRate = roundToDecimals(ClientRevenueCalculator.calculateWeightedAverageRate(clientTotals, clientRevenue), 2);
  const grandTotalSuggestedRevenue = roundToDecimals(Array.from(clientSuggestedRevenue.values()).reduce((sum, val) => sum + val, 0), 0);
  const grandTotalExpectedLessSuggested = roundToDecimals(Array.from(clientExpectedLessSuggested.values()).reduce((sum, val) => sum + val, 0), 0);

  return {
    grandTotalHours,
    grandTotalRevenue,
    grandAverageRate,
    grandTotalSuggestedRevenue,
    grandTotalExpectedLessSuggested
  };
};

/**
 * Get client-specific values with consistent rounding
 */
export const getClientValues = (
  clientName: string,
  clientTotals: Map<string, number>,
  clientRevenue: Map<string, number>,
  clientHourlyRates: Map<string, number>,
  clientSuggestedRevenue: Map<string, number>,
  clientExpectedLessSuggested: Map<string, number>
) => ({
  totalHours: roundToDecimals(clientTotals.get(clientName) || 0, 1),
  totalRevenue: roundToDecimals(clientRevenue.get(clientName) || 0, 0),
  hourlyRate: roundToDecimals(clientHourlyRates.get(clientName) || 0, 2),
  suggestedRevenue: roundToDecimals(clientSuggestedRevenue.get(clientName) || 0, 0),
  expectedLessSuggested: roundToDecimals(clientExpectedLessSuggested.get(clientName) || 0, 0)
});
