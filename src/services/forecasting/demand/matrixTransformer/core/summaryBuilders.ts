
import { DemandDataPoint } from '@/types/demand';
import { ClientMaps, RevenueTotals } from './types';
import { MATRIX_TRANSFORMER_CONFIG } from './constants';

/**
 * Summary Builders for Matrix Data
 * Handles creation of various summary data structures
 */
export class SummaryBuilders {
  /**
   * Build skill summary from data points
   */
  static buildSkillSummary(dataPoints: DemandDataPoint[]): { [key: string]: any } {
    const skillSummary: { [key: string]: any } = {};
    
    dataPoints.forEach(dataPoint => {
      const skill = dataPoint.skillType;
      
      if (!skillSummary[skill]) {
        skillSummary[skill] = {
          totalHours: 0,
          taskCount: 0,
          clientCount: new Set<string>(),
          totalSuggestedRevenue: 0,
          totalExpectedLessSuggested: 0
        };
      }
      
      skillSummary[skill].totalHours += dataPoint.demandHours;
      skillSummary[skill].taskCount += dataPoint.taskCount;
      skillSummary[skill].totalSuggestedRevenue += dataPoint.suggestedRevenue || 0;
      skillSummary[skill].totalExpectedLessSuggested += dataPoint.expectedLessSuggested || 0;
      
      dataPoint.taskBreakdown?.forEach(task => {
        skillSummary[skill].clientCount.add(task.clientId);
      });
    });
    
    // Convert client count sets to numbers and calculate averages
    Object.keys(skillSummary).forEach(skill => {
      const summary = skillSummary[skill];
      summary.clientCount = summary.clientCount.size;
      summary.averageFeeRate = summary.totalHours > 0 ? 
        summary.totalSuggestedRevenue / summary.totalHours : 0;
    });
    
    return skillSummary;
  }

  /**
   * Build staff summary from data points
   */
  static buildStaffSummary(dataPoints: DemandDataPoint[]): { [key: string]: any } {
    const staffSummary: { [key: string]: any } = {};
    
    dataPoints.forEach(dataPoint => {
      dataPoint.taskBreakdown?.forEach(task => {
        if (task.preferredStaffId && task.preferredStaffName) {
          const staffKey = task.preferredStaffId;
          
          if (!staffSummary[staffKey]) {
            staffSummary[staffKey] = {
              staffId: task.preferredStaffId,
              staffName: task.preferredStaffName,
              totalHours: 0,
              taskCount: 0,
              clientCount: new Set<string>()
            };
          }
          
          staffSummary[staffKey].totalHours += task.monthlyHours;
          staffSummary[staffKey].taskCount += 1;
          staffSummary[staffKey].clientCount.add(task.clientId);
        }
      });
    });
    
    // Convert client count sets to numbers
    Object.keys(staffSummary).forEach(staffKey => {
      const clientCountSet = staffSummary[staffKey].clientCount;
      staffSummary[staffKey].clientCount = clientCountSet.size;
    });
    
    console.log(`👥 [STAFF SUMMARY] Built staff summary:`, {
      staffCount: Object.keys(staffSummary).length,
      sampleStaffEntry: Object.values(staffSummary)[0]
    });
    
    return staffSummary;
  }

  /**
   * Build client maps from data points
   */
  static buildClientMaps(dataPoints: DemandDataPoint[]): ClientMaps {
    const clientTotals = new Map<string, number>();
    const clientRevenue = new Map<string, number>();
    const clientHourlyRates = new Map<string, number>();
    const clientSuggestedRevenue = new Map<string, number>();
    const clientExpectedLessSuggested = new Map<string, number>();
    
    dataPoints.forEach(dataPoint => {
      dataPoint.taskBreakdown?.forEach(task => {
        const clientId = task.clientId;
        const currentHours = clientTotals.get(clientId) || 0;
        const currentSuggested = clientSuggestedRevenue.get(clientId) || 0;
        const taskSuggested = task.suggestedRevenue || 0;
        
        clientTotals.set(clientId, currentHours + task.monthlyHours);
        clientSuggestedRevenue.set(clientId, currentSuggested + taskSuggested);
      });
    });
    
    return {
      clientTotals,
      clientRevenue,
      clientHourlyRates,
      clientSuggestedRevenue,
      clientExpectedLessSuggested
    };
  }

  /**
   * Calculate revenue totals from data points
   */
  static calculateRevenueTotals(dataPoints: DemandDataPoint[]): RevenueTotals {
    const totalSuggestedRevenue = dataPoints.reduce((sum, dp) => sum + (dp.suggestedRevenue || 0), 0);
    const totalExpectedLessSuggested = dataPoints.reduce((sum, dp) => sum + (dp.expectedLessSuggested || 0), 0);
    const totalExpectedRevenue = totalSuggestedRevenue + totalExpectedLessSuggested;
    
    return {
      totalSuggestedRevenue,
      totalExpectedRevenue,
      totalExpectedLessSuggested
    };
  }
}
