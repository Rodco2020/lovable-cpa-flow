
/**
 * Phase 5: Enhanced Export Service
 * 
 * Integrates with Phase 4 three-mode filtering system to provide comprehensive
 * export functionality with filtering mode metadata and data integrity validation.
 */

import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { FilteringValidator, AdvancedFilteringEngine } from '../demand/performance';
import { debugLog } from '../logger';

export interface EnhancedExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeMetadata: boolean;
  includeTaskBreakdown: boolean;
  includePreferredStaffInfo: boolean;
  includeFilteringModeDetails: boolean;
  validateDataIntegrity?: boolean;
  customTitle?: string;
}

export interface ExportMetadata {
  exportTimestamp: string;
  filteringMode: {
    preferredStaff: 'all' | 'specific' | 'none';
    skills: string;
    clients: string;
    timeHorizon: string;
  };
  dataIntegrity: {
    validated: boolean;
    totalDataPoints: number;
    filteredDataPoints: number;
    reductionPercentage: number;
  };
  performanceMetrics: {
    filteringTime: number;
    exportTime: number;
    totalProcessingTime: number;
  };
  version: string;
}

export class EnhancedExportService {
  /**
   * Phase 5: Enhanced export with three-mode filtering support
   */
  static async exportWithFilteringContext(
    originalData: DemandMatrixData,
    filters: DemandFilters,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    options: EnhancedExportOptions
  ): Promise<{
    success: boolean;
    exportedFileName?: string;
    metadata?: ExportMetadata;
    errors?: string[];
  }> {
    const startTime = performance.now();
    
    console.log(`🚀 [PHASE 5 EXPORT] Starting enhanced export:`, {
      format: options.format,
      includeMetadata: options.includeMetadata,
      includeFilteringModeDetails: options.includeFilteringModeDetails,
      dataPoints: originalData.dataPoints.length,
      timestamp: new Date().toISOString()
    });

    try {
      // Step 1: Apply Phase 4 filtering with validation
      const filteringStartTime = performance.now();
      const filteringResult = await AdvancedFilteringEngine.executeFiltering(originalData, filters);
      const filteringTime = performance.now() - filteringStartTime;

      // Step 2: Validate data integrity if requested
      let validationResult;
      if (options.validateDataIntegrity) {
        validationResult = FilteringValidator.validateFilteringResult(
          originalData,
          filters,
          filteringResult
        );

        if (!validationResult.isValid) {
          console.warn(`⚠️ [PHASE 5 EXPORT] Data integrity issues detected:`, {
            criticalErrors: validationResult.errors.filter(e => e.severity === 'critical').length,
            totalErrors: validationResult.errors.length
          });
        }
      }

      // Step 3: Generate export metadata
      const metadata = this.generateExportMetadata(
        originalData,
        filteringResult.filteredData,
        filters,
        filteringTime,
        performance.now() - startTime,
        validationResult
      );

      // Step 4: Generate export content
      const exportContent = this.generateExportContent(
        filteringResult.filteredData,
        selectedSkills,
        selectedClients,
        monthRange,
        metadata,
        options
      );

      // Step 5: Download/save the export
      const fileName = this.generateFileName(options.format, filters, metadata);
      this.downloadExport(exportContent, fileName, options.format);

      const totalTime = performance.now() - startTime;
      
      console.log(`✅ [PHASE 5 EXPORT] Export completed successfully:`, {
        fileName,
        format: options.format,
        totalProcessingTime: `${totalTime.toFixed(2)}ms`,
        filteringMode: metadata.filteringMode,
        dataIntegrityValidated: !!validationResult?.isValid
      });

      return {
        success: true,
        exportedFileName: fileName,
        metadata
      };

    } catch (error) {
      console.error(`❌ [PHASE 5 EXPORT] Export failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        format: options.format
      });

      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown export error']
      };
    }
  }

  /**
   * Generate comprehensive export metadata
   */
  private static generateExportMetadata(
    originalData: DemandMatrixData,
    filteredData: DemandMatrixData,
    filters: DemandFilters,
    filteringTime: number,
    totalTime: number,
    validationResult?: any
  ): ExportMetadata {
    // Determine preferred staff filtering mode
    let preferredStaffMode: 'all' | 'specific' | 'none' = 'all';
    if (filters.preferredStaff) {
      const { staffIds = [], showOnlyPreferred = false } = filters.preferredStaff;
      if (showOnlyPreferred && staffIds.length === 0) {
        preferredStaffMode = 'none';
      } else if (staffIds.length > 0) {
        preferredStaffMode = 'specific';
      }
    }

    // Calculate data reduction
    const reductionPercentage = originalData.dataPoints.length > 0 
      ? ((originalData.dataPoints.length - filteredData.dataPoints.length) / originalData.dataPoints.length) * 100
      : 0;

    return {
      exportTimestamp: new Date().toISOString(),
      filteringMode: {
        preferredStaff: preferredStaffMode,
        skills: filters.skills && filters.skills.length > 0 
          ? `${filters.skills.length} selected` 
          : 'all',
        clients: filters.clients && filters.clients.length > 0 
          ? `${filters.clients.length} selected` 
          : 'all',
        timeHorizon: filters.timeHorizon 
          ? `${filters.timeHorizon.start.toISOString().split('T')[0]} to ${filters.timeHorizon.end.toISOString().split('T')[0]}`
          : 'all'
      },
      dataIntegrity: {
        validated: !!validationResult,
        totalDataPoints: originalData.dataPoints.length,
        filteredDataPoints: filteredData.dataPoints.length,
        reductionPercentage: Number(reductionPercentage.toFixed(1))
      },
      performanceMetrics: {
        filteringTime: Number(filteringTime.toFixed(2)),
        exportTime: Number((totalTime - filteringTime).toFixed(2)),
        totalProcessingTime: Number(totalTime.toFixed(2))
      },
      version: 'Phase5-Enhanced'
    };
  }

  /**
   * Generate export content based on format
   */
  private static generateExportContent(
    filteredData: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    metadata: ExportMetadata,
    options: EnhancedExportOptions
  ): string {
    switch (options.format) {
      case 'csv':
        return this.generateEnhancedCSV(filteredData, selectedSkills, selectedClients, monthRange, metadata, options);
      case 'json':
        return this.generateEnhancedJSON(filteredData, selectedSkills, selectedClients, monthRange, metadata, options);
      case 'excel':
        // For now, generate CSV-like format - in production would use actual Excel library
        return this.generateEnhancedCSV(filteredData, selectedSkills, selectedClients, monthRange, metadata, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Generate enhanced CSV with Phase 5 filtering metadata
   */
  private static generateEnhancedCSV(
    data: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    metadata: ExportMetadata,
    options: EnhancedExportOptions
  ): string {
    let csvContent = '';

    // Metadata section
    if (options.includeMetadata) {
      csvContent += '# DEMAND MATRIX EXPORT METADATA\n';
      csvContent += `# Export Timestamp,${metadata.exportTimestamp}\n`;
      csvContent += `# Version,${metadata.version}\n`;
      csvContent += `# Filtering Mode - Preferred Staff,${metadata.filteringMode.preferredStaff}\n`;
      csvContent += `# Filtering Mode - Skills,${metadata.filteringMode.skills}\n`;
      csvContent += `# Filtering Mode - Clients,${metadata.filteringMode.clients}\n`;
      csvContent += `# Filtering Mode - Time Horizon,${metadata.filteringMode.timeHorizon}\n`;
      csvContent += `# Data Integrity Validated,${metadata.dataIntegrity.validated}\n`;
      csvContent += `# Total Data Points,${metadata.dataIntegrity.totalDataPoints}\n`;
      csvContent += `# Filtered Data Points,${metadata.dataIntegrity.filteredDataPoints}\n`;
      csvContent += `# Data Reduction,${metadata.dataIntegrity.reductionPercentage}%\n`;
      csvContent += `# Processing Time,${metadata.performanceMetrics.totalProcessingTime}ms\n`;
      csvContent += '\n';
    }

    // Main data headers
    const headers = ['Skill', 'Month', 'Demand Hours', 'Task Count', 'Client Count'];
    
    if (options.includePreferredStaffInfo) {
      headers.push('Preferred Staff Assignments', 'Unassigned Tasks');
    }

    csvContent += headers.join(',') + '\n';

    // Data rows
    const filteredMonths = data.months.slice(monthRange.start, monthRange.end + 1);
    const monthKeys = new Set(filteredMonths.map(m => m.key));

    data.dataPoints
      .filter(point => 
        selectedSkills.includes(point.skillType) && 
        monthKeys.has(point.month)
      )
      .forEach(point => {
        const row = [
          `"${point.skillType}"`,
          `"${point.monthLabel || point.month}"`,
          point.demandHours.toFixed(1),
          point.taskCount.toString(),
          point.clientCount.toString()
        ];

        if (options.includePreferredStaffInfo && point.taskBreakdown) {
          const assignedTasks = point.taskBreakdown.filter(task => task.preferredStaff?.staffId).length;
          const unassignedTasks = point.taskBreakdown.length - assignedTasks;
          row.push(assignedTasks.toString(), unassignedTasks.toString());
        }

        csvContent += row.join(',') + '\n';
      });

    // Task breakdown section
    if (options.includeTaskBreakdown) {
      csvContent += '\n# TASK BREAKDOWN\n';
      csvContent += 'Skill,Month,Client,Task Count,Monthly Hours,Preferred Staff,Staff Name\n';
      
      data.dataPoints
        .filter(point => 
          selectedSkills.includes(point.skillType) && 
          monthKeys.has(point.month)
        )
        .forEach(point => {
          point.taskBreakdown?.forEach(task => {
            const taskRow = [
              `"${point.skillType}"`,
              `"${point.monthLabel || point.month}"`,
              `"${task.clientId}"`,
              task.taskCount.toString(),
              task.monthlyHours.toFixed(1),
              task.preferredStaff?.staffId || 'unassigned',
              `"${task.preferredStaff?.staffName || 'N/A'}"`
            ];
            csvContent += taskRow.join(',') + '\n';
          });
        });
    }

    return csvContent;
  }

  /**
   * Generate enhanced JSON with Phase 5 filtering metadata
   */
  private static generateEnhancedJSON(
    data: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    metadata: ExportMetadata,
    options: EnhancedExportOptions
  ): string {
    const filteredMonths = data.months.slice(monthRange.start, monthRange.end + 1);
    const monthKeys = new Set(filteredMonths.map(m => m.key));

    const exportData = {
      metadata: options.includeMetadata ? metadata : undefined,
      exportConfiguration: {
        selectedSkills,
        selectedClients: selectedClients.length > 0 ? selectedClients : 'all',
        monthRange: {
          start: monthRange.start,
          end: monthRange.end,
          months: filteredMonths.map(m => m.label)
        },
        options: {
          includeTaskBreakdown: options.includeTaskBreakdown,
          includePreferredStaffInfo: options.includePreferredStaffInfo,
          includeFilteringModeDetails: options.includeFilteringModeDetails
        }
      },
      summary: {
        totalDemandHours: data.totalDemand,
        totalTasks: data.totalTasks,
        totalClients: data.totalClients,
        filteredDataPoints: data.dataPoints.filter(point => 
          selectedSkills.includes(point.skillType) && 
          monthKeys.has(point.month)
        ).length
      },
      matrixData: data.dataPoints
        .filter(point => 
          selectedSkills.includes(point.skillType) && 
          monthKeys.has(point.month)
        )
        .map(point => {
          const basePoint = {
            skill: point.skillType,
            month: point.month,
            monthLabel: point.monthLabel,
            demandHours: point.demandHours,
            taskCount: point.taskCount,
            clientCount: point.clientCount
          };

          if (options.includePreferredStaffInfo && point.taskBreakdown) {
            const staffInfo = {
              assignedTasks: point.taskBreakdown.filter(task => task.preferredStaff?.staffId).length,
              unassignedTasks: point.taskBreakdown.filter(task => !task.preferredStaff?.staffId).length,
              uniqueStaff: new Set(
                point.taskBreakdown
                  .filter(task => task.preferredStaff?.staffId)
                  .map(task => task.preferredStaff!.staffId)
              ).size
            };
            Object.assign(basePoint, { preferredStaffInfo: staffInfo });
          }

          if (options.includeTaskBreakdown) {
            Object.assign(basePoint, { taskBreakdown: point.taskBreakdown });
          }

          return basePoint;
        })
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate descriptive filename
   */
  private static generateFileName(
    format: string,
    filters: DemandFilters,
    metadata: ExportMetadata
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const mode = metadata.filteringMode.preferredStaff;
    return `demand-matrix-${mode}-mode-${timestamp}.${format}`;
  }

  /**
   * Download the export file
   */
  private static downloadExport(content: string, fileName: string, format: string): void {
    const mimeTypes = {
      csv: 'text/csv',
      json: 'application/json',
      excel: 'text/csv' // Simplified for now
    };

    const blob = new Blob([content], { type: mimeTypes[format as keyof typeof mimeTypes] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Legacy export method for backward compatibility
   */
  static async exportLegacy(
    data: DemandMatrixData,
    selectedSkills: string[],
    selectedClients: string[],
    monthRange: { start: number; end: number },
    format: 'csv' | 'json',
    includeTaskBreakdown = true
  ): Promise<void> {
    console.log(`🔄 [PHASE 5 EXPORT] Using legacy export for backward compatibility`);
    
    // Convert to enhanced options
    const options: EnhancedExportOptions = {
      format,
      includeMetadata: false,
      includeTaskBreakdown,
      includePreferredStaffInfo: false,
      includeFilteringModeDetails: false,
      validateDataIntegrity: false
    };

    // Use minimal filters for legacy support
    const filters: DemandFilters = {
      skills: selectedSkills.length > 0 ? selectedSkills : undefined,
      clients: selectedClients.length > 0 ? selectedClients : undefined
    };

    await this.exportWithFilteringContext(
      data,
      filters,
      selectedSkills,
      selectedClients,
      monthRange,
      options
    );
  }
}
