
import { DemandMatrixData } from '@/types/demand';

/**
 * Demand Matrix Service
 * 
 * Provides utilities for working with demand matrix data
 */
export class DemandMatrixService {
  
  /**
   * Validate demand matrix data structure
   */
  static validateDemandMatrix(data: DemandMatrixData): boolean {
    if (!data) return false;
    
    // Check required properties
    if (!data.months || !Array.isArray(data.months)) return false;
    if (!data.skills || !Array.isArray(data.skills)) return false;
    if (!data.dataPoints || !Array.isArray(data.dataPoints)) return false;
    if (typeof data.totalDemand !== 'number') return false;
    if (typeof data.totalTasks !== 'number') return false;
    if (typeof data.totalClients !== 'number') return false;
    if (!data.skillSummary || typeof data.skillSummary !== 'object') return false;
    if (!data.clientTotals || !(data.clientTotals instanceof Map)) return false;
    
    return true;
  }
  
  /**
   * Get filtered demand matrix data
   */
  static getFilteredData(
    data: DemandMatrixData,
    filters: {
      skills?: string[];
      clients?: string[];
      months?: string[];
    }
  ): DemandMatrixData {
    if (!this.validateDemandMatrix(data)) {
      throw new Error('Invalid demand matrix data');
    }
    
    let filteredDataPoints = data.dataPoints;
    
    // Apply skill filter
    if (filters.skills && filters.skills.length > 0) {
      filteredDataPoints = filteredDataPoints.filter(dp => 
        filters.skills!.includes(dp.skillType)
      );
    }
    
    // Apply month filter
    if (filters.months && filters.months.length > 0) {
      filteredDataPoints = filteredDataPoints.filter(dp => 
        filters.months!.includes(dp.month)
      );
    }
    
    // Apply client filter
    if (filters.clients && filters.clients.length > 0) {
      filteredDataPoints = filteredDataPoints.filter(dp => {
        if (!dp.taskBreakdown) return false;
        return dp.taskBreakdown.some(task => 
          filters.clients!.includes(task.clientId)
        );
      });
    }
    
    // Recalculate totals for filtered data
    const totalDemand = filteredDataPoints.reduce((sum, dp) => sum + dp.demandHours, 0);
    const totalTasks = filteredDataPoints.reduce((sum, dp) => sum + dp.taskCount, 0);
    const uniqueClients = new Set(
      filteredDataPoints.flatMap(dp => 
        dp.taskBreakdown?.map(task => task.clientId) || []
      )
    );
    
    return {
      ...data,
      dataPoints: filteredDataPoints,
      totalDemand,
      totalTasks,
      totalClients: uniqueClients.size
    };
  }
}
