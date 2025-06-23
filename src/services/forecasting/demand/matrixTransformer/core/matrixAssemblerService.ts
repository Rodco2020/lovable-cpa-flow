
/**
 * Matrix Assembly Service
 * Handles the final assembly of matrix data structure
 */

import { DemandMatrixData } from '@/types/demand';
import { MatrixRevenueTotals } from './revenueCalculatorService';

export interface MatrixAssemblyContext {
  months: Array<{ key: string; label: string }>;
  skills: string[];
  dataPoints: any[];
  skillSummary: any;
  staffSummary: any;
  clientMaps: {
    clientTotals: Map<string, number>;
    clientRevenue: Map<string, number>;
    clientHourlyRates: Map<string, number>;
    clientSuggestedRevenue: Map<string, number>;
    clientExpectedLessSuggested: Map<string, number>;
  };
  revenueTotals: MatrixRevenueTotals;
  staffInformation: any[];
}

export class MatrixAssemblerService {
  /**
   * Assemble final matrix data structure
   */
  static assembleMatrixData(context: MatrixAssemblyContext): DemandMatrixData {
    const {
      months,
      skills,
      dataPoints,
      skillSummary,
      staffSummary,
      clientMaps,
      revenueTotals,
      staffInformation
    } = context;

    return {
      months,
      skills,
      dataPoints,
      totalDemand: dataPoints.reduce((sum, dp) => sum + dp.demandHours, 0),
      totalTasks: dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0),
      totalClients: new Set(dataPoints.flatMap(dp => 
        dp.taskBreakdown?.map((task: any) => task.clientId) || []
      )).size,
      skillSummary,
      clientTotals: clientMaps.clientTotals,
      clientRevenue: clientMaps.clientRevenue,
      clientHourlyRates: clientMaps.clientHourlyRates,
      clientSuggestedRevenue: clientMaps.clientSuggestedRevenue,
      clientExpectedLessSuggested: clientMaps.clientExpectedLessSuggested,
      skillFeeRates: new Map(), // Will be populated by RevenueEnhancer
      revenueTotals,
      staffSummary,
      availableStaff: staffInformation
    };
  }

  /**
   * Create empty matrix data structure for error cases
   */
  static createEmptyMatrix(): DemandMatrixData {
    return {
      months: [],
      skills: [],
      dataPoints: [],
      totalDemand: 0,
      totalTasks: 0,
      totalClients: 0,
      skillSummary: {},
      clientTotals: new Map(),
      clientRevenue: new Map(),
      clientHourlyRates: new Map(),
      clientSuggestedRevenue: new Map(),
      clientExpectedLessSuggested: new Map(),
      skillFeeRates: new Map(),
      revenueTotals: {
        totalSuggestedRevenue: 0,
        totalExpectedRevenue: 0,
        totalExpectedLessSuggested: 0
      },
      staffSummary: {},
      availableStaff: []
    };
  }
}
