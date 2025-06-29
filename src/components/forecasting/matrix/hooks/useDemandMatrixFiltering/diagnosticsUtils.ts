
import { DemandMatrixData } from '@/types/demand';
import { DiagnosticsData, FallbackDataset } from './types';

export class FilteringDiagnostics {
  static createDiagnosticsData(
    startTime: number,
    endTime: number,
    originalCount: number,
    filteredCount: number,
    steps: string[]
  ): DiagnosticsData {
    return {
      filteringSteps: steps,
      performanceMetrics: {
        startTime,
        endTime,
        duration: endTime - startTime
      },
      dataStats: {
        originalDataPoints: originalCount,
        filteredDataPoints: filteredCount,
        filterEfficiency: originalCount > 0 ? (filteredCount / originalCount) * 100 : 0
      }
    };
  }

  static createFallbackDataset(reason: string, data: DemandMatrixData | null = null): FallbackDataset {
    return {
      isEmpty: !data || data.dataPoints.length === 0,
      reason,
      fallbackData: data
    };
  }

  static logFilteringPerformance(diagnostics: DiagnosticsData): void {
    console.log('🔍 [FILTERING DIAGNOSTICS]', {
      duration: `${diagnostics.performanceMetrics.duration.toFixed(2)}ms`,
      efficiency: `${diagnostics.dataStats.filterEfficiency.toFixed(1)}%`,
      dataPoints: `${diagnostics.dataStats.filteredDataPoints}/${diagnostics.dataStats.originalDataPoints}`,
      steps: diagnostics.filteringSteps
    });
  }
}
