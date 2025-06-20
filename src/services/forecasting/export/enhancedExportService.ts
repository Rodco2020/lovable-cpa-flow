
/**
 * Phase 5: Enhanced Export Service
 *
 * Integrates advanced filtering context into export functionality
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';

export interface ExportOptions {
  format: 'csv' | 'json';
  includeMetadata: boolean;
  includeTaskBreakdown: boolean;
  includePreferredStaffInfo: boolean;
  includeFilteringModeDetails: boolean;
  validateDataIntegrity: boolean;
}

// Export the alias for backward compatibility
export interface EnhancedExportOptions extends ExportOptions {}

export interface ExportResult {
  success: boolean;
  exportedFileName?: string;
  metadata?: any;
  errors?: string[];
}

export class EnhancedExportService {
  private static detectFilteringMode(filters: DemandFilters): any {
    const mode: any = {
      skills: filters.skills ? 'specific' : 'all',
      clients: filters.clients ? 'specific' : 'all',
      preferredStaff: 'all',
      timeHorizon: filters.timeHorizon ? 'specific' : 'all'
    };

    if (filters.preferredStaff) {
      if (filters.preferredStaff.showOnlyPreferred) {
        mode.preferredStaff = 'unassigned-only';
      } else if (filters.preferredStaff.staffIds && filters.preferredStaff.staffIds.length > 0) {
        mode.preferredStaff = 'specific';
      }
    }

    return mode;
  }

  private static validateDataIntegrity(demandData: DemandMatrixData): { validated: boolean; errors?: string[] } {
    if (!demandData) {
      return { validated: false, errors: ['Demand data is missing'] };
    }

    if (!demandData.dataPoints || demandData.dataPoints.length === 0) {
      return { validated: false, errors: ['No data points to export'] };
    }

    return { validated: true };
  }

  private static generateJSONExport(
    demandData: DemandMatrixData,
    currentFilters: DemandFilters,
    options: ExportOptions,
    filteringMode: any
  ): any {
    const exportData = {
      metadata: {
        exportTimestamp: new Date().toISOString(),
        filteringMode,
        options
      },
      filters: currentFilters,
      data: demandData.dataPoints
    };

    return exportData;
  }

  private static downloadFile(data: string, filename: string, type: string) {
    const file = new Blob([data], { type: type });
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  static async exportWithFilteringContext(
    demandData: DemandMatrixData,
    currentFilters: DemandFilters,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    options: ExportOptions
  ): Promise<ExportResult> {
    const startTime = performance.now();

    try {
      console.log('🚀 [ENHANCED EXPORT] Starting Phase 5 export with filtering context:', {
        filteringMode: this.detectFilteringMode(currentFilters),
        selectedSkills: selectedSkills.length,
        selectedClients: selectedClients.length,
        monthRange,
        options
      });

      // Validate data integrity if requested
      if (options.validateDataIntegrity) {
        const validationResult = this.validateDataIntegrity(demandData);
        if (!validationResult.validated) {
          return {
            success: false,
            errors: validationResult.errors || ['Data validation failed']
          };
        }
      }

      // Generate export data based on format
      let exportData: string;
      let fileName: string;

      const exportTimestamp = new Date().toISOString();
      const filteringMode = this.detectFilteringMode(currentFilters);

      if (options.format === 'json') {
        const jsonData = this.generateJSONExport(demandData, currentFilters, options, filteringMode);
        exportData = JSON.stringify(jsonData, null, 2);
        fileName = `demand-matrix-${filteringMode.preferredStaff}-${exportTimestamp.slice(0, 10)}.json`;
      } else {
        const csvData = this.generateCSVExport(demandData, currentFilters, options, filteringMode);
        exportData = csvData;
        fileName = `demand-matrix-${filteringMode.preferredStaff}-${exportTimestamp.slice(0, 10)}.csv`;
      }

      // Trigger download
      this.downloadFile(exportData, fileName, options.format === 'json' ? 'application/json' : 'text/csv');

      const processingTime = performance.now() - startTime;

      return {
        success: true,
        exportedFileName: fileName,
        metadata: {
          exportTimestamp,
          filteringMode: {
            preferredStaff: filteringMode.preferredStaff,
            skills: selectedSkills.length > 0 ? `${selectedSkills.length} selected` : 'all',
            clients: selectedClients.length > 0 ? `${selectedClients.length} selected` : 'all',
            timeHorizon: monthRange ? `months ${monthRange.start}-${monthRange.end}` : 'all'
          },
          dataIntegrity: {
            validated: options.validateDataIntegrity || false,
            totalDataPoints: demandData.dataPoints.length,
            filteredDataPoints: demandData.dataPoints.length,
            reductionPercentage: 0
          },
          performanceMetrics: {
            filteringTime: 0,
            exportTime: processingTime,
            totalProcessingTime: processingTime
          },
          version: 'Phase5-Enhanced'
        }
      };

    } catch (error) {
      console.error('❌ [ENHANCED EXPORT] Export failed:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Export failed']
      };
    }
  }

  private static generateCSVExport(
    demandData: DemandMatrixData,
    currentFilters: DemandFilters,
    options: ExportOptions,
    filteringMode: any
  ): string {
    const headers = ['Skill Type', 'Month', 'Demand Hours', 'Client Count'];
    
    if (options.includeTaskBreakdown) {
      headers.push('Client Name', 'Monthly Hours');
    }
    
    if (options.includePreferredStaffInfo) {
      headers.push('Preferred Staff', 'Staff Role');
    }

    const rows = [headers.join(',')];

    demandData.dataPoints.forEach(dataPoint => {
      if (dataPoint.taskBreakdown && options.includeTaskBreakdown) {
        dataPoint.taskBreakdown.forEach(task => {
          const row = [
            `"${dataPoint.skillType}"`,
            `"${dataPoint.monthLabel}"`,
            dataPoint.demandHours.toString(),
            dataPoint.clientCount.toString(),
            `"${task.clientName || ''}"`,
            task.monthlyHours.toString()
          ];

          if (options.includePreferredStaffInfo) {
            row.push(`"${task.preferredStaff?.staffName || 'Unassigned'}"`);
            row.push(`"${task.preferredStaff?.roleTitle || ''}"`);
          }

          rows.push(row.join(','));
        });
      } else {
        const row = [
          `"${dataPoint.skillType}"`,
          `"${dataPoint.monthLabel}"`,
          dataPoint.demandHours.toString(),
          dataPoint.clientCount.toString()
        ];

        if (options.includeTaskBreakdown) {
          row.push('', ''); // Empty client name and monthly hours
        }

        if (options.includePreferredStaffInfo) {
          row.push('', ''); // Empty preferred staff info
        }

        rows.push(row.join(','));
      }
    });

    // Add metadata if requested
    if (options.includeMetadata) {
      rows.push('');
      rows.push('=== METADATA ===');
      rows.push(`Export Timestamp,${new Date().toISOString()}`);
      rows.push(`Filtering Mode,${filteringMode.preferredStaff}`);
      rows.push(`Total Data Points,${demandData.dataPoints.length}`);
      rows.push(`Phase,Phase5-Enhanced`);
    }

    return rows.join('\n');
  }
}
