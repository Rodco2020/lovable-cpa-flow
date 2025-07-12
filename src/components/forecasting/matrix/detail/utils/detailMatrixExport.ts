import * as XLSX from 'xlsx';
import { TaskRevenueResult } from '@/services/forecasting/demand/calculators/detailTaskRevenueCalculator';

/**
 * Task interface for export
 */
interface Task {
  id: string;
  taskName: string;
  clientName: string;
  clientId: string;
  skillRequired: string;
  monthlyHours: number;
  month: string;
  monthLabel: string;
  recurrencePattern: string;
  priority: string;
  category: string;
  monthlyDistribution?: Record<string, number>;
  totalHours?: number;
  recurringTaskId?: string;
  preferredStaffId?: string | null;
  preferredStaffName?: string;
}

export interface DetailMatrixExportOptions {
  tasks: Task[];
  viewMode: string;
  selectedSkills: string[];
  selectedClients: string[];
  selectedPreferredStaff: (string | number | null | undefined)[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  revenueData?: Map<string, TaskRevenueResult>;
  filename?: string;
}

/**
 * Detail Matrix Export Utilities - Phase 4 Extraction
 * 
 * Handles Excel export functionality for the detail matrix:
 * - Exports task data with applied filters
 * - Includes revenue data for detail-forecast-matrix view
 * - Formats data appropriately for Excel
 * - Adds metadata about filters and view mode
 */
export class DetailMatrixExport {
  
  /**
   * Export detail matrix data to Excel
   */
  static async exportToExcel(options: DetailMatrixExportOptions): Promise<void> {
    const {
      tasks,
      viewMode,
      selectedSkills,
      selectedClients,
      selectedPreferredStaff,
      monthRange,
      groupingMode,
      hasActiveFilters,
      activeFiltersCount,
      revenueData,
      filename = 'detail-matrix-export'
    } = options;

    console.log('📊 [DETAIL MATRIX EXPORT] Starting Excel export:', {
      taskCount: tasks.length,
      viewMode,
      hasActiveFilters,
      activeFiltersCount,
      hasRevenueData: !!revenueData
    });

    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare task data for export
      const exportData = this.prepareTaskData(tasks, revenueData);

      // Create main data worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Data');

      // Add metadata worksheet
      const metadataSheet = this.createMetadataSheet({
        viewMode,
        selectedSkills,
        selectedClients,
        selectedPreferredStaff,
        monthRange,
        groupingMode,
        hasActiveFilters,
        activeFiltersCount,
        totalTasks: tasks.length,
        exportDate: new Date().toISOString()
      });
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Export Info');

      // Add revenue summary if available
      if (revenueData && revenueData.size > 0) {
        const revenueSummarySheet = this.createRevenueSummarySheet(revenueData);
        XLSX.utils.book_append_sheet(workbook, revenueSummarySheet, 'Revenue Summary');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
      const finalFilename = `${filename}-${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, finalFilename);

      console.log('📊 [DETAIL MATRIX EXPORT] Export complete:', finalFilename);

    } catch (error) {
      console.error('📊 [DETAIL MATRIX EXPORT] Export failed:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Prepare task data for Excel export
   */
  private static prepareTaskData(
    tasks: Task[], 
    revenueData?: Map<string, TaskRevenueResult>
  ): any[] {
    return tasks.map(task => {
      const revenue = revenueData?.get(task.id);
      
      const baseData = {
        'Task Name': task.taskName,
        'Client Name': task.clientName,
        'Skill Required': task.skillRequired,
        'Monthly Hours': task.monthlyHours,
        'Total Hours': task.totalHours || task.monthlyHours,
        'Month': task.month,
        'Month Label': task.monthLabel,
        'Recurrence Pattern': task.recurrencePattern,
        'Priority': task.priority,
        'Category': task.category,
        'Preferred Staff': task.preferredStaffName || 'Not Assigned',
        'Recurring Task ID': task.recurringTaskId || task.id
      };

      // Add revenue data if available
      if (revenue) {
        return {
          ...baseData,
          'Total Expected Revenue': `$${revenue.totalExpectedRevenue.toFixed(2)}`,
          'Expected Hourly Rate': `$${revenue.expectedHourlyRate.toFixed(2)}`,
          'Total Suggested Revenue': `$${revenue.totalSuggestedRevenue.toFixed(2)}`,
          'Expected Less Suggested': `$${revenue.expectedLessSuggested.toFixed(2)}`,
          'Skill Fee Rate': `$${revenue.skillFeeRate.toFixed(2)}`,
          'Apportionment %': `${(revenue.apportionmentPercentage * 100).toFixed(2)}%`
        };
      }

      return baseData;
    });
  }

  /**
   * Create metadata worksheet with export information
   */
  private static createMetadataSheet(metadata: {
    viewMode: string;
    selectedSkills: string[];
    selectedClients: string[];
    selectedPreferredStaff: (string | number | null | undefined)[];
    monthRange: { start: number; end: number };
    groupingMode: string;
    hasActiveFilters: boolean;
    activeFiltersCount: number;
    totalTasks: number;
    exportDate: string;
  }): XLSX.WorkSheet {
    const metadataRows = [
      { Property: 'Export Date', Value: new Date(metadata.exportDate).toLocaleString() },
      { Property: 'View Mode', Value: metadata.viewMode },
      { Property: 'Grouping Mode', Value: metadata.groupingMode },
      { Property: 'Total Tasks', Value: metadata.totalTasks },
      { Property: 'Has Active Filters', Value: metadata.hasActiveFilters ? 'Yes' : 'No' },
      { Property: 'Active Filter Count', Value: metadata.activeFiltersCount },
      { Property: 'Selected Skills', Value: metadata.selectedSkills.length > 0 ? metadata.selectedSkills.join(', ') : 'All' },
      { Property: 'Selected Clients', Value: metadata.selectedClients.length > 0 ? metadata.selectedClients.join(', ') : 'All' },
      { Property: 'Selected Staff', Value: metadata.selectedPreferredStaff.length > 0 ? metadata.selectedPreferredStaff.filter(Boolean).join(', ') : 'All' },
      { Property: 'Month Range', Value: `${metadata.monthRange.start} to ${metadata.monthRange.end}` }
    ];

    return XLSX.utils.json_to_sheet(metadataRows);
  }

  /**
   * Create revenue summary worksheet
   */
  private static createRevenueSummarySheet(revenueData: Map<string, TaskRevenueResult>): XLSX.WorkSheet {
    const results = Array.from(revenueData.values());
    
    const summary = {
      totalTasks: results.length,
      totalHours: results.reduce((sum, r) => sum + r.totalHours, 0),
      totalExpectedRevenue: results.reduce((sum, r) => sum + r.totalExpectedRevenue, 0),
      totalSuggestedRevenue: results.reduce((sum, r) => sum + r.totalSuggestedRevenue, 0),
      totalExpectedLessSuggested: results.reduce((sum, r) => sum + r.expectedLessSuggested, 0),
      profitableTasks: results.filter(r => r.expectedLessSuggested > 0).length,
      unprofitableTasks: results.filter(r => r.expectedLessSuggested < 0).length
    };

    const averageExpectedHourlyRate = summary.totalHours > 0 
      ? summary.totalExpectedRevenue / summary.totalHours 
      : 0;

    const summaryRows = [
      { Metric: 'Total Tasks', Value: summary.totalTasks },
      { Metric: 'Total Hours', Value: summary.totalHours.toFixed(1) },
      { Metric: 'Total Expected Revenue', Value: `$${summary.totalExpectedRevenue.toLocaleString()}` },
      { Metric: 'Total Suggested Revenue', Value: `$${summary.totalSuggestedRevenue.toLocaleString()}` },
      { Metric: 'Expected Less Suggested', Value: `$${summary.totalExpectedLessSuggested.toLocaleString()}` },
      { Metric: 'Average Expected Rate', Value: `$${averageExpectedHourlyRate.toFixed(2)}/hr` },
      { Metric: 'Profitable Tasks', Value: `${summary.profitableTasks}/${summary.totalTasks}` },
      { Metric: 'Unprofitable Tasks', Value: `${summary.unprofitableTasks}/${summary.totalTasks}` }
    ];

    return XLSX.utils.json_to_sheet(summaryRows);
  }
}

/**
 * Convenience function for quick export
 */
export const exportDetailMatrixToExcel = async (options: DetailMatrixExportOptions): Promise<void> => {
  return DetailMatrixExport.exportToExcel(options);
};