
/**
 * Performance Reporter Service
 * 
 * Generates performance reports for filtering operations
 */

import { DemandMatrixData } from '@/types/demand';

export interface PerformanceReport {
  filtering: {
    originalDataPoints: number;
    filteredDataPoints: number;
    reductionPercentage: number;
    appliedFilters: string[];
  };
  metrics: {
    originalTotalDemand: number;
    filteredTotalDemand: number;
    originalTotalTasks: number;
    filteredTotalTasks: number;
    originalTotalClients: number;
    filteredTotalClients: number;
  };
  efficiency: {
    dataReduction: string;
    filterComplexity: 'Low' | 'Medium' | 'High';
  };
}

export class PerformanceReporter {
  /**
   * Generate filtering performance report
   */
  static generatePerformanceReport(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData,
    filterConfig: any
  ): PerformanceReport {
    const reductionPercentage = originalData.dataPoints.length > 0 
      ? Math.round(((originalData.dataPoints.length - filteredData.dataPoints.length) / originalData.dataPoints.length) * 100)
      : 0;

    return {
      filtering: {
        originalDataPoints: originalData.dataPoints.length,
        filteredDataPoints: filteredData.dataPoints.length,
        reductionPercentage,
        appliedFilters: this.getAppliedFilters(filterConfig)
      },
      metrics: {
        originalTotalDemand: originalData.totalDemand,
        filteredTotalDemand: filteredData.totalDemand,
        originalTotalTasks: originalData.totalTasks,
        filteredTotalTasks: filteredData.totalTasks,
        originalTotalClients: originalData.totalClients,
        filteredTotalClients: filteredData.totalClients
      },
      efficiency: {
        dataReduction: reductionPercentage > 0 ? 'Effective' : 'No reduction',
        filterComplexity: this.calculateFilterComplexity(filterConfig)
      }
    };
  }

  /**
   * Get list of applied filters
   */
  private static getAppliedFilters(config: any): string[] {
    const applied: string[] = [];

    if (config.selectedSkills && config.selectedSkills.length > 0 && !config.isAllSkillsSelected) {
      applied.push('Skills');
    }

    if (config.selectedClients && config.selectedClients.length > 0 && !config.isAllClientsSelected) {
      applied.push('Clients');
    }

    if (config.preferredStaffFilterMode && config.preferredStaffFilterMode !== 'all') {
      applied.push(`Preferred Staff (${config.preferredStaffFilterMode})`);
    }

    return applied;
  }

  /**
   * Calculate filter complexity
   */
  private static calculateFilterComplexity(config: any): 'Low' | 'Medium' | 'High' {
    let complexity = 0;

    if (config.selectedSkills && config.selectedSkills.length > 0) complexity += 1;
    if (config.selectedClients && config.selectedClients.length > 0) complexity += 1;
    if (config.preferredStaffFilterMode && config.preferredStaffFilterMode !== 'all') complexity += 2;

    if (complexity <= 1) return 'Low';
    if (complexity <= 3) return 'Medium';
    return 'High';
  }
}
