
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixExportService, DemandMatrixExportOptions } from '@/services/export/demandMatrixExportService';
import { debugLog } from '../logger';

/**
 * Export Integration Service
 * Centralizes all export functionality for the demand matrix with revenue columns
 */
export class ExportIntegrationService {
  /**
   * Export demand matrix with enhanced revenue support
   */
  static async exportDemandMatrix(
    demandData: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    groupingMode: 'skill' | 'client',
    options: {
      format: 'pdf' | 'excel' | 'csv';
      includeRevenueColumns?: boolean;
      includeTaskBreakdown?: boolean;
      includeClientSummary?: boolean;
      customTitle?: string;
    }
  ): Promise<void> {
    debugLog('Starting enhanced demand matrix export', {
      format: options.format,
      groupingMode,
      includeRevenueColumns: options.includeRevenueColumns,
      selectedSkills: selectedSkills.length,
      selectedClients: selectedClients.length,
      monthRange
    });

    try {
      // Validate export parameters
      this.validateExportParameters(demandData, selectedSkills, selectedClients, monthRange);

      // Prepare export options
      const exportOptions: DemandMatrixExportOptions = {
        format: options.format,
        groupingMode,
        includeRevenueColumns: options.includeRevenueColumns && groupingMode === 'client',
        includeTaskBreakdown: options.includeTaskBreakdown ?? true,
        includeClientSummary: options.includeClientSummary ?? (groupingMode === 'client'),
        customTitle: options.customTitle || this.generateDefaultTitle(groupingMode, options.includeRevenueColumns)
      };

      // Execute export
      await DemandMatrixExportService.exportMatrix(
        demandData,
        selectedSkills,
        selectedClients,
        monthRange,
        exportOptions
      );

      debugLog('Export completed successfully', {
        format: options.format,
        groupingMode,
        includeRevenueColumns: exportOptions.includeRevenueColumns
      });

    } catch (error) {
      console.error('❌ [EXPORT] Export failed:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available export formats based on data and configuration
   */
  static getAvailableExportFormats(
    demandData: DemandMatrixData,
    groupingMode: 'skill' | 'client'
  ): Array<{
    format: 'pdf' | 'excel' | 'csv';
    label: string;
    description: string;
    supportsRevenue: boolean;
    recommended: boolean;
  }> {
    const hasRevenueData = groupingMode === 'client' && 
      demandData.clientRevenue && 
      demandData.clientSuggestedRevenue &&
      demandData.clientRevenue.size > 0;

    return [
      {
        format: 'excel',
        label: 'Excel (.xlsx)',
        description: 'Best for detailed analysis and pivot tables',
        supportsRevenue: true,
        recommended: hasRevenueData
      },
      {
        format: 'csv',
        label: 'CSV',
        description: 'Universal format for data import/export',
        supportsRevenue: true,
        recommended: false
      },
      {
        format: 'pdf',
        label: 'PDF',
        description: 'Formatted reports for printing and sharing',
        supportsRevenue: true,
        recommended: !hasRevenueData
      }
    ];
  }

  /**
   * Estimate export file size
   */
  static estimateExportSize(
    demandData: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    options: {
      format: 'pdf' | 'excel' | 'csv';
      includeRevenueColumns?: boolean;
      includeTaskBreakdown?: boolean;
    }
  ): {
    estimate: string;
    breakdown: {
      baseData: number;
      taskBreakdown: number;
      revenueColumns: number;
      total: number;
    };
  } {
    const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);
    const dataPointsCount = selectedSkills.length * filteredMonths.length;
    
    // Base size estimation (bytes)
    const formatMultiplier = {
      'csv': 100,
      'excel': 200,
      'pdf': 150
    };
    
    const baseData = dataPointsCount * formatMultiplier[options.format];
    
    const taskBreakdownSize = options.includeTaskBreakdown ? 
      demandData.dataPoints.reduce((sum, point) => sum + (point.taskBreakdown?.length || 0), 0) * 150 : 0;
    
    const revenueColumnsSize = options.includeRevenueColumns ? dataPointsCount * 50 : 0;
    
    const total = baseData + taskBreakdownSize + revenueColumnsSize;
    
    const formatBytes = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return {
      estimate: formatBytes(total),
      breakdown: {
        baseData,
        taskBreakdown: taskBreakdownSize,
        revenueColumns: revenueColumnsSize,
        total
      }
    };
  }

  /**
   * Validate export parameters
   */
  private static validateExportParameters(
    demandData: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number }
  ): void {
    if (!demandData) {
      throw new Error('Demand data is required');
    }

    if (selectedSkills.length === 0) {
      throw new Error('At least one skill must be selected');
    }

    if (monthRange.start < 0 || monthRange.end >= demandData.months.length || monthRange.start > monthRange.end) {
      throw new Error('Invalid month range');
    }

    if (demandData.dataPoints.length === 0) {
      throw new Error('No data available for export');
    }
  }

  /**
   * Generate default export title
   */
  private static generateDefaultTitle(groupingMode: 'skill' | 'client', includeRevenue?: boolean): string {
    const baseTitle = `Demand Matrix - ${groupingMode === 'skill' ? 'Skill Analysis' : 'Client Analysis'}`;
    const revenueTitle = includeRevenue ? ' with Revenue Analysis' : '';
    return baseTitle + revenueTitle;
  }

  /**
   * Get export recommendations based on data characteristics
   */
  static getExportRecommendations(
    demandData: DemandMatrixData,
    groupingMode: 'skill' | 'client'
  ): {
    recommendedFormat: 'pdf' | 'excel' | 'csv';
    recommendations: string[];
    warnings: string[];
  } {
    const recommendations: string[] = [];
    const warnings: string[] = [];
    let recommendedFormat: 'pdf' | 'excel' | 'csv' = 'excel';

    // Data size considerations
    const totalDataPoints = demandData.dataPoints.length;
    if (totalDataPoints > 1000) {
      recommendations.push('Consider using CSV format for large datasets');
      warnings.push('Large dataset detected - PDF export may be truncated');
      recommendedFormat = 'csv';
    }

    // Revenue data considerations
    if (groupingMode === 'client' && demandData.clientRevenue && demandData.clientSuggestedRevenue) {
      recommendations.push('Excel format recommended for revenue analysis features');
      recommendations.push('Enable revenue columns for comprehensive financial insights');
      if (recommendedFormat !== 'csv') {
        recommendedFormat = 'excel';
      }
    }

    // Task breakdown considerations
    const hasTaskBreakdown = demandData.dataPoints.some(dp => dp.taskBreakdown && dp.taskBreakdown.length > 0);
    if (hasTaskBreakdown) {
      recommendations.push('Include task breakdown for detailed analysis');
    }

    return {
      recommendedFormat,
      recommendations,
      warnings
    };
  }
}
