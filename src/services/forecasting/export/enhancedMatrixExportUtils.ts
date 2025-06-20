
import { MatrixExportUtils } from './matrixExportUtils';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { debugLog } from '../logger';

/**
 * Phase 4: Enhanced Matrix Export Utilities
 * 
 * Extends the base MatrixExportUtils with three-mode filtering support
 * and enhanced metadata generation for exports
 */
export class EnhancedMatrixExportUtils extends MatrixExportUtils {
  
  /**
   * Phase 4: Generate enhanced CSV export with three-mode filtering information
   */
  static generateEnhancedCSVExport(
    demandData: DemandMatrixData,
    exportConfig: {
      selectedSkills: SkillType[];
      selectedClients: string[];
      selectedPreferredStaff: string[];
      monthRange: { start: number; end: number };
      preferredStaffFilterMode: 'all' | 'specific' | 'none';
      groupingMode: 'skill' | 'client';
      includeMetadata: boolean;
      includeFilteringModeInfo: boolean;
      includeFilteringSummary: boolean;
      includeTaskBreakdown: boolean;
      includePreferredStaffInfo: boolean;
    }
  ): string {
    debugLog('Generating enhanced CSV export with three-mode filtering');
    
    let csvContent = '';
    
    // Phase 4: Enhanced header with filtering mode information
    if (exportConfig.includeMetadata) {
      csvContent += this.generateEnhancedMetadataSection(exportConfig);
      csvContent += '\n\n';
    }

    // Phase 4: Filtering summary section
    if (exportConfig.includeFilteringSummary) {
      csvContent += this.generateFilteringSummarySection(demandData, exportConfig);
      csvContent += '\n\n';
    }

    // Main data section
    csvContent += this.generateMainDataSection(demandData, exportConfig);

    // Phase 4: Enhanced task breakdown with preferred staff context
    if (exportConfig.includeTaskBreakdown) {
      csvContent += '\n\n';
      csvContent += this.generateEnhancedTaskBreakdownSection(demandData, exportConfig);
    }

    return csvContent;
  }

  /**
   * Phase 4: Generate enhanced JSON export with three-mode filtering information
   */
  static generateEnhancedJSONExport(
    demandData: DemandMatrixData,
    exportConfig: {
      selectedSkills: SkillType[];
      selectedClients: string[];
      selectedPreferredStaff: string[];
      monthRange: { start: number; end: number };
      preferredStaffFilterMode: 'all' | 'specific' | 'none';
      groupingMode: 'skill' | 'client';
      includeMetadata: boolean;
      includeFilteringModeInfo: boolean;
      includeFilteringSummary: boolean;
      includeTaskBreakdown: boolean;
      includePreferredStaffInfo: boolean;
    }
  ): string {
    debugLog('Generating enhanced JSON export with three-mode filtering');

    const exportData = {
      // Phase 4: Enhanced metadata with three-mode filtering
      metadata: {
        exportDate: new Date().toISOString(),
        exportVersion: '2.0',
        groupingMode: exportConfig.groupingMode,
        // Phase 4: Three-mode filtering metadata
        preferredStaffFilterMode: exportConfig.preferredStaffFilterMode,
        filteringMode: {
          mode: exportConfig.preferredStaffFilterMode,
          description: this.getFilterModeDescription(exportConfig.preferredStaffFilterMode),
          appliedFilters: {
            skills: exportConfig.selectedSkills,
            clients: exportConfig.selectedClients,
            preferredStaff: exportConfig.selectedPreferredStaff
          }
        },
        monthRange: {
          start: exportConfig.monthRange.start,
          end: exportConfig.monthRange.end,
          months: this.getMonthLabels(exportConfig.monthRange)
        },
        includedOptions: {
          metadata: exportConfig.includeMetadata,
          filteringModeInfo: exportConfig.includeFilteringModeInfo,
          filteringSummary: exportConfig.includeFilteringSummary,
          taskBreakdown: exportConfig.includeTaskBreakdown,
          preferredStaffInfo: exportConfig.includePreferredStaffInfo
        }
      },
      
      // Phase 4: Enhanced filtering summary
      filteringSummary: exportConfig.includeFilteringSummary ? {
        totalDataPoints: demandData.dataPoints.length,
        filteredDataPoints: demandData.dataPoints.length, // This would be calculated based on actual filtering
        filteringMode: exportConfig.preferredStaffFilterMode,
        filtersApplied: {
          skillsFilter: exportConfig.selectedSkills.length > 0,
          clientsFilter: exportConfig.selectedClients.length > 0,
          preferredStaffFilter: exportConfig.preferredStaffFilterMode !== 'all'
        }
      } : undefined,

      // Main data with enhanced context
      data: demandData.dataPoints.map(point => ({
        ...point,
        // Phase 4: Enhanced data point with filtering context
        filteringContext: exportConfig.includeFilteringModeInfo ? {
          includesPreferredStaffInfo: exportConfig.includePreferredStaffInfo,
          matchesCurrentFilters: true, // This would be calculated based on actual filtering
          preferredStaffFilterMode: exportConfig.preferredStaffFilterMode
        } : undefined,
        
        // Phase 4: Enhanced task breakdown with preferred staff details
        enhancedTaskBreakdown: exportConfig.includeTaskBreakdown && exportConfig.includePreferredStaffInfo 
          ? point.taskBreakdown?.map(task => ({
              ...task,
              preferredStaffContext: {
                hasPreferredStaff: !!task.preferredStaff,
                matchesCurrentMode: this.doesTaskMatchFilterMode(task, exportConfig.preferredStaffFilterMode, exportConfig.selectedPreferredStaff),
                preferredStaffInfo: task.preferredStaff
              }
            }))
          : point.taskBreakdown
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Phase 4: Generate enhanced metadata section for CSV
   */
  private static generateEnhancedMetadataSection(exportConfig: any): string {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let metadata = 'DEMAND MATRIX EXPORT METADATA\n';
    metadata += '=====================================\n';
    metadata += `Export Date: ${new Date().toISOString()}\n`;
    metadata += `Export Version: 2.0 (Three-Mode Filtering)\n`;
    metadata += `Grouping Mode: ${exportConfig.groupingMode}\n`;
    metadata += `Time Range: ${monthNames[exportConfig.monthRange.start]} - ${monthNames[exportConfig.monthRange.end]}\n`;
    
    // Phase 4: Three-mode filtering information
    metadata += '\nPREFERRED STAFF FILTERING CONFIGURATION\n';
    metadata += '----------------------------------------\n';
    metadata += `Filter Mode: ${exportConfig.preferredStaffFilterMode.toUpperCase()}\n`;
    metadata += `Description: ${this.getFilterModeDescription(exportConfig.preferredStaffFilterMode)}\n`;
    
    if (exportConfig.preferredStaffFilterMode === 'specific') {
      metadata += `Selected Staff: ${exportConfig.selectedPreferredStaff.length} staff members\n`;
      metadata += `Staff IDs: ${exportConfig.selectedPreferredStaff.join(', ')}\n`;
    }
    
    metadata += '\nAPPLIED FILTERS\n';
    metadata += '---------------\n';
    metadata += `Skills: ${exportConfig.selectedSkills.length > 0 ? exportConfig.selectedSkills.join(', ') : 'All skills'}\n`;
    metadata += `Clients: ${exportConfig.selectedClients.length > 0 ? exportConfig.selectedClients.join(', ') : 'All clients'}\n`;
    
    return metadata;
  }

  /**
   * Phase 4: Generate filtering summary section for CSV
   */
  private static generateFilteringSummarySection(demandData: DemandMatrixData, exportConfig: any): string {
    let summary = 'FILTERING SUMMARY\n';
    summary += '=================\n';
    summary += `Total Data Points Available: ${demandData.dataPoints.length}\n`;
    summary += `Filter Mode Applied: ${exportConfig.preferredStaffFilterMode}\n`;
    
    const modeDescriptions = {
      'all': 'All tasks included regardless of preferred staff assignment',
      'specific': 'Only tasks assigned to selected preferred staff members',
      'none': 'Only tasks without preferred staff assignments'
    };
    
    summary += `Filter Description: ${modeDescriptions[exportConfig.preferredStaffFilterMode]}\n`;
    summary += `Skills Filter Active: ${exportConfig.selectedSkills.length > 0 ? 'Yes' : 'No'}\n`;
    summary += `Clients Filter Active: ${exportConfig.selectedClients.length > 0 ? 'Yes' : 'No'}\n`;
    summary += `Preferred Staff Filter Active: ${exportConfig.preferredStaffFilterMode !== 'all' ? 'Yes' : 'No'}\n`;
    
    return summary;
  }

  /**
   * Phase 4: Generate main data section with enhanced headers
   */
  private static generateMainDataSection(demandData: DemandMatrixData, exportConfig: any): string {
    let dataSection = 'DEMAND MATRIX DATA\n';
    dataSection += '==================\n';
    
    // Enhanced headers with filtering context
    const headers = [
      'Skill Type',
      'Month',
      'Demand Hours',
      'Task Count',
      'Client Count',
      'Filter Mode',
      'Preferred Staff Filter',
      'Includes Unassigned Tasks',
      'Includes Assigned Tasks'
    ];
    
    dataSection += headers.join(',') + '\n';
    
    // Data rows with enhanced context
    demandData.dataPoints.forEach(point => {
      const row = [
        `"${point.skillType}"`,
        `"${point.month}"`,
        point.demandHours.toFixed(1),
        point.taskCount,
        point.clientCount,
        `"${exportConfig.preferredStaffFilterMode}"`,
        `"${this.getFilterModeDescription(exportConfig.preferredStaffFilterMode)}"`,
        exportConfig.preferredStaffFilterMode === 'none' || exportConfig.preferredStaffFilterMode === 'all' ? 'Yes' : 'No',
        exportConfig.preferredStaffFilterMode === 'specific' || exportConfig.preferredStaffFilterMode === 'all' ? 'Yes' : 'No'
      ];
      
      dataSection += row.join(',') + '\n';
    });
    
    return dataSection;
  }

  /**
   * Phase 4: Generate enhanced task breakdown section
   */
  private static generateEnhancedTaskBreakdownSection(demandData: DemandMatrixData, exportConfig: any): string {
    let breakdown = 'ENHANCED TASK BREAKDOWN\n';
    breakdown += '=======================\n';
    
    const headers = [
      'Client ID',
      'Task Name',
      'Skill Type',
      'Estimated Hours',
      'Has Preferred Staff',
      'Preferred Staff ID',
      'Matches Current Filter',
      'Filter Mode Context'
    ];
    
    breakdown += headers.join(',') + '\n';
    
    demandData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        const matchesFilter = this.doesTaskMatchFilterMode(task, exportConfig.preferredStaffFilterMode, exportConfig.selectedPreferredStaff);
        
        const row = [
          `"${task.clientId}"`,
          `"${task.taskName || 'Unknown'}"`,
          `"${point.skillType}"`,
          task.estimatedHours || 0,
          task.preferredStaff ? 'Yes' : 'No',
          task.preferredStaff ? `"${this.getStaffId(task.preferredStaff)}"` : '""',
          matchesFilter ? 'Yes' : 'No',
          `"${this.getFilterModeDescription(exportConfig.preferredStaffFilterMode)}"`
        ];
        
        breakdown += row.join(',') + '\n';
      });
    });
    
    return breakdown;
  }

  /**
   * Phase 4: Helper method to get filter mode description
   */
  private static getFilterModeDescription(mode: 'all' | 'specific' | 'none'): string {
    switch (mode) {
      case 'all':
        return 'All tasks included regardless of staff assignment';
      case 'specific':
        return 'Only tasks assigned to selected staff members';
      case 'none':
        return 'Only tasks without preferred staff assignments';
      default:
        return 'Unknown filter mode';
    }
  }

  /**
   * Phase 4: Helper method to check if task matches filter mode
   */
  private static doesTaskMatchFilterMode(task: any, mode: 'all' | 'specific' | 'none', selectedStaff: string[]): boolean {
    switch (mode) {
      case 'all':
        return true;
      case 'specific':
        if (!task.preferredStaff) return false;
        const staffId = this.getStaffId(task.preferredStaff);
        return selectedStaff.includes(staffId);
      case 'none':
        return !task.preferredStaff || this.getStaffId(task.preferredStaff) === '';
      default:
        return false;
    }
  }

  /**
   * Phase 4: Helper method to extract staff ID from preferred staff object
   */
  private static getStaffId(preferredStaff: any): string {
    if (typeof preferredStaff === 'string') {
      return preferredStaff;
    }
    
    return preferredStaff?.staffId || 
           preferredStaff?.full_name || 
           preferredStaff?.name || 
           preferredStaff?.id || 
           '';
  }

  /**
   * Phase 4: Helper method to get month labels
   */
  private static getMonthLabels(monthRange: { start: number; end: number }): string[] {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    
    for (let i = monthRange.start; i <= monthRange.end; i++) {
      labels.push(monthNames[i]);
    }
    
    return labels;
  }
}
