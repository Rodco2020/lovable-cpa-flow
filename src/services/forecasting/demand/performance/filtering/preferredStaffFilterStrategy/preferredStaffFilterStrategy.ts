
import { DemandMatrixData, DemandDataPoint } from '@/types/demand';
import { SkillSummaryUtils } from '../utils/skillSummaryUtils';

export interface PreferredStaffFilterOptions {
  preferredStaffIds: string[];
  includeUnassigned?: boolean;
  strictMode?: boolean;
}

export interface PreferredStaffFilterResult {
  filteredData: DemandMatrixData;
  filteredDataPoints: number;
  matchedStaffIds: string[];
  executionTime: number;
}

/**
 * Preferred Staff Filter Strategy
 * 
 * Implements filtering logic for preferred staff assignments in demand matrix data
 */
export class PreferredStaffFilterStrategy {
  
  /**
   * Apply preferred staff filtering to demand matrix data
   */
  static applyFilter(
    data: DemandMatrixData,
    options: PreferredStaffFilterOptions
  ): PreferredStaffFilterResult {
    const startTime = performance.now();
    
    // Filter data points based on preferred staff
    const filteredDataPoints = data.dataPoints.filter(dataPoint => {
      if (!dataPoint.taskBreakdown) {
        return options.includeUnassigned || false;
      }
      
      return dataPoint.taskBreakdown.some(task => {
        if (!task.preferredStaffId) {
          return options.includeUnassigned || false;
        }
        
        return options.preferredStaffIds.includes(String(task.preferredStaffId));
      });
    });
    
    // Collect matched staff IDs
    const matchedStaffIds = new Set<string>();
    filteredDataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          if (task.preferredStaffId && options.preferredStaffIds.includes(String(task.preferredStaffId))) {
            matchedStaffIds.add(String(task.preferredStaffId));
          }
        });
      }
    });
    
    // Recalculate totals
    const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    
    // Recalculate skill summary
    const skillSummary: Record<string, any> = {};
    data.skills.forEach(skill => {
      const skillDataPoints = filteredDataPoints.filter(dp => dp.skillType === skill);
      skillSummary[skill] = SkillSummaryUtils.mergeSkillSummaries(
        skillDataPoints.map(dp => ({
          totalHours: dp.totalHours,
          demandHours: dp.demandHours,
          taskCount: dp.taskCount,
          clientCount: dp.clientCount
        }))
      );
    });
    
    // Calculate unique clients
    const uniqueClients = new Set(
      filteredDataPoints.flatMap(dp => 
        dp.taskBreakdown?.map(task => task.clientId) || []
      )
    );
    
    const filteredData: DemandMatrixData = {
      ...data,
      dataPoints: filteredDataPoints,
      totalDemand,
      totalTasks,
      totalClients: uniqueClients.size,
      skillSummary
    };
    
    const executionTime = performance.now() - startTime;
    
    return {
      filteredData,
      filteredDataPoints: filteredDataPoints.length,
      matchedStaffIds: Array.from(matchedStaffIds),
      executionTime
    };
  }
}
