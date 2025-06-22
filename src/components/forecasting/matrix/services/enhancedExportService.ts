
/**
 * Enhanced Export Service
 * Provides advanced export functionality for matrix data
 */

import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { EnhancedExportOptions, ExportMetadata, ExportDataRow } from '@/types/export';
import { extractStaffId } from '@/services/forecasting/demand/utils/staffExtractionUtils';

export class EnhancedExportService {
  /**
   * Export demand matrix data to CSV format
   */
  static exportToCSV(data: DemandMatrixData): string {
    const headers = ['Month', 'Skill Type', 'Demand Hours', 'Task Count', 'Client Count'];
    const rows = [headers.join(',')];

    data.dataPoints.forEach(point => {
      const row = [
        point.monthLabel || point.month,
        point.skillType,
        point.demandHours.toString(),
        point.taskCount.toString(),
        point.clientCount.toString()
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Export detailed task breakdown
   */
  static exportTaskBreakdown(data: DemandMatrixData): string {
    const headers = [
      'Month',
      'Skill Type', 
      'Task Name',
      'Client Name',
      'Monthly Hours',
      'Preferred Staff'
    ];
    const rows = [headers.join(',')];

    data.dataPoints.forEach(point => {
      if (point.taskBreakdown && Array.isArray(point.taskBreakdown)) {
        point.taskBreakdown.forEach((task: any) => {
          const preferredStaffId = extractStaffId(task.preferredStaff) || 'Unassigned';
          
          const row = [
            point.monthLabel || point.month,
            point.skillType,
            task.taskName || 'Unknown',
            task.clientName || 'Unknown',
            (task.monthlyHours || 0).toString(),
            preferredStaffId
          ];
          rows.push(row.join(','));
        });
      }
    });

    return rows.join('\n');
  }

  /**
   * Phase 3: Enhanced export with resolved skill data
   */
  static async exportDemandMatrix(
    data: DemandMatrixData,
    selectedSkills: SkillType[],
    selectedClients: string[],
    selectedPreferredStaff: string[],
    preferredStaffFilterMode: 'all' | 'specific' | 'none',
    options: EnhancedExportOptions = {}
  ): Promise<void> {
    console.log('📤 [PHASE 3 EXPORT] Starting enhanced export with resolved skills:', {
      dataPointsCount: data.dataPoints.length,
      selectedSkillsCount: selectedSkills.length,
      selectedClientsCount: selectedClients.length,
      options
    });

    try {
      const metadata = this.generateExportMetadata(
        data,
        selectedSkills,
        selectedClients,
        selectedPreferredStaff,
        preferredStaffFilterMode,
        options
      );

      const formattedData = this.formatDataForExport(data, metadata, options);
      const filename = options.filename || this.generateFilename(metadata, options);

      switch (options.format || 'csv') {
        case 'csv':
          await this.exportAsCSV(formattedData, metadata, filename);
          break;
        case 'json':
          await this.exportAsJSON(formattedData, metadata, filename);
          break;
        case 'xlsx':
          await this.exportAsXLSX(formattedData, metadata, filename);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      console.log('✅ [PHASE 3 EXPORT] Export completed successfully:', filename);

    } catch (error) {
      console.error('❌ [PHASE 3 EXPORT] Export failed:', error);
      throw error;
    }
  }

  /**
   * Phase 3: Generate comprehensive export metadata
   */
  private static generateExportMetadata(
    data: DemandMatrixData,
    selectedSkills: SkillType[],
    selectedClients: string[],
    selectedPreferredStaff: string[],
    preferredStaffFilterMode: string,
    options: EnhancedExportOptions
  ): ExportMetadata {
    const metadata: ExportMetadata = {
      exportDate: new Date().toISOString(),
      totalDataPoints: data.dataPoints.length,
      appliedFilters: {
        skills: selectedSkills,
        clients: selectedClients,
        preferredStaff: selectedPreferredStaff,
        preferredStaffMode: preferredStaffFilterMode
      }
    };

    if (options.includeSkillResolutionInfo) {
      const allSkills = new Set<string>();
      data.dataPoints.forEach(point => {
        allSkills.add(point.skillType);
      });

      metadata.skillResolutionInfo = {
        totalSkills: allSkills.size,
        resolvedSkills: allSkills.size,
        unresolvedSkills: 0
      };
    }

    return metadata;
  }

  /**
   * Phase 3: Enhanced data formatting with skill information
   */
  private static formatDataForExport(
    data: DemandMatrixData,
    metadata: ExportMetadata,
    options: EnhancedExportOptions
  ): ExportDataRow[] {
    console.log('📊 [PHASE 3 EXPORT] Formatting data with enhanced skill information');

    const formattedData: ExportDataRow[] = data.dataPoints.map(point => {
      const baseData: ExportDataRow = {
        skill: point.skillType,
        month: point.monthLabel || point.month,
        demandHours: point.demandHours,
        taskCount: point.taskCount,
        clientCount: point.clientCount,
        totalTasks: point.taskBreakdown?.length || 0
      };

      if (point.taskBreakdown && point.taskBreakdown.length > 0) {
        const taskDetails = point.taskBreakdown.map(task => ({
          clientName: task.clientName,
          taskName: task.taskName,
          estimatedHours: task.estimatedHours,
          monthlyHours: task.monthlyHours,
          preferredStaff: this.formatPreferredStaffForExport(task.preferredStaff),
          recurrencePattern: task.recurrencePattern || 'N/A'
        }));

        return {
          ...baseData,
          taskDetails: JSON.stringify(taskDetails)
        };
      }

      return baseData;
    });

    if (options.includeFilterSummary) {
      const metadataRow: ExportDataRow = {
        skill: '--- EXPORT METADATA ---',
        month: `Export Date: ${metadata.exportDate}`,
        demandHours: metadata.totalDataPoints,
        taskCount: 0,
        clientCount: 0,
        totalTasks: 0,
        taskDetails: metadata.skillResolutionInfo 
          ? JSON.stringify(metadata.skillResolutionInfo)
          : 'N/A'
      };
      
      formattedData.unshift(metadataRow);
    }

    return formattedData;
  }

  /**
   * Phase 3: Format preferred staff information for export
   */
  private static formatPreferredStaffForExport(preferredStaff: any): string {
    if (!preferredStaff) return 'Unassigned';

    if (typeof preferredStaff === 'string') {
      return preferredStaff;
    }

    if (typeof preferredStaff === 'object') {
      return preferredStaff.staffName || 
             preferredStaff.full_name || 
             preferredStaff.name || 
             preferredStaff.id || 
             'Unknown Staff';
    }

    return 'Invalid Staff Data';
  }

  private static generateFilename(metadata: ExportMetadata, options: EnhancedExportOptions): string {
    const date = new Date().toISOString().split('T')[0];
    const filterSummary = this.generateFilterSummary(metadata.appliedFilters);
    const extension = options.format || 'csv';
    
    return `demand-matrix-${date}${filterSummary}.${extension}`;
  }

  private static generateFilterSummary(filters: ExportMetadata['appliedFilters']): string {
    const parts: string[] = [];
    
    if (filters.skills.length > 0) {
      parts.push(`skills-${filters.skills.length}`);
    }
    
    if (filters.clients.length > 0) {
      parts.push(`clients-${filters.clients.length}`);
    }
    
    if (filters.preferredStaff.length > 0) {
      parts.push(`staff-${filters.preferredStaff.length}`);
    }
    
    if (filters.preferredStaffMode !== 'all') {
      parts.push(`mode-${filters.preferredStaffMode}`);
    }
    
    return parts.length > 0 ? `-filtered-${parts.join('-')}` : '';
  }

  private static async exportAsCSV(data: ExportDataRow[], metadata: ExportMetadata, filename: string): Promise<void> {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header as keyof ExportDataRow];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }

  private static async exportAsJSON(data: ExportDataRow[], metadata: ExportMetadata, filename: string): Promise<void> {
    const exportData = {
      metadata,
      data
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    this.downloadBlob(blob, filename);
  }

  private static async exportAsXLSX(data: ExportDataRow[], metadata: ExportMetadata, filename: string): Promise<void> {
    console.log('📋 [PHASE 3 EXPORT] XLSX export not yet implemented, falling back to CSV');
    await this.exportAsCSV(data, metadata, filename.replace('.xlsx', '.csv'));
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}
