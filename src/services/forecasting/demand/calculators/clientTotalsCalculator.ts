
import { DemandDataPoint } from '@/types/demand';

/**
 * Client Totals Calculator Service
 * 
 * Calculates client-specific totals from demand data points
 */
export class ClientTotalsCalculator {
  
  /**
   * Calculate client totals from demand data points
   */
  static calculateClientTotals(dataPoints: DemandDataPoint[]): Map<string, number> {
    const clientTotals = new Map<string, number>();
    
    dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          const currentTotal = clientTotals.get(task.clientId) || 0;
          clientTotals.set(task.clientId, currentTotal + task.monthlyHours);
        });
      }
    });
    
    return clientTotals;
  }
  
  /**
   * Calculate client totals by skill type
   */
  static calculateClientTotalsBySkill(dataPoints: DemandDataPoint[]): Map<string, Map<string, number>> {
    const clientSkillTotals = new Map<string, Map<string, number>>();
    
    dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          if (!clientSkillTotals.has(task.clientId)) {
            clientSkillTotals.set(task.clientId, new Map());
          }
          
          const skillTotals = clientSkillTotals.get(task.clientId)!;
          const currentTotal = skillTotals.get(task.skillType) || 0;
          skillTotals.set(task.skillType, currentTotal + task.monthlyHours);
        });
      }
    });
    
    return clientSkillTotals;
  }
}
