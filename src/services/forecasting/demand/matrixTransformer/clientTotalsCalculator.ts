
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';

/**
 * Client Totals Calculator
 * Calculates total demand hours per client across all months and skills
 */
export class ClientTotalsCalculator {
  /**
   * Calculate client totals from data points
   */
  static calculateClientTotals(dataPoints: DemandDataPoint[]): Map<string, number> {
    const clientTotals = new Map<string, number>();

    dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach(task => {
          const currentTotal = clientTotals.get(task.clientName) || 0;
          clientTotals.set(task.clientName, currentTotal + task.monthlyHours);
        });
      }
    });

    console.log(`📊 [CLIENT TOTALS] Calculated totals for ${clientTotals.size} clients`);
    return clientTotals;
  }

  /**
   * Get sorted client list by total hours (descending)
   */
  static getSortedClientsByTotal(clientTotals: Map<string, number>): Array<{ name: string; total: number }> {
    return Array.from(clientTotals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Calculate grand total across all clients
   */
  static calculateGrandTotal(clientTotals: Map<string, number>): number {
    return Array.from(clientTotals.values()).reduce((sum, total) => sum + total, 0);
  }
}
