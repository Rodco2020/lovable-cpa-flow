
import { useState } from 'react';
import { toast } from 'sonner';
import { ExportService, ExportOptions, TaskExportData } from '@/services/export/exportService';
import { FormattedTask } from '../types';
import { Client } from '@/types/client';
import { FilterState } from '../types';

/**
 * Hook for managing export and print functionality
 * 
 * Handles all export-related operations including data transformation,
 * filter application, and print view management.
 */
export const useExportFunctionality = (
  tasks: FormattedTask[],
  clients: Client[] | undefined,
  filters: FilterState,
  activeTab: string
) => {
  const [showPrintView, setShowPrintView] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Convert tasks to export format
  const exportData: TaskExportData[] = tasks.map(task => ({
    id: task.id,
    clientName: task.clientName,
    taskName: task.taskName,
    taskType: task.taskType,
    status: task.status,
    priority: task.priority,
    estimatedHours: task.estimatedHours,
    requiredSkills: task.requiredSkills,
    nextDueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
    recurrencePattern: task.recurrencePattern ? 
      (typeof task.recurrencePattern === 'string' ? task.recurrencePattern : JSON.stringify(task.recurrencePattern)) 
      : undefined
  }));

  // Get applied filters for export
  const getAppliedFilters = () => {
    const appliedFilters: Record<string, any> = {};
    
    if (activeTab !== 'all') {
      appliedFilters['Task Type'] = activeTab === 'recurring' ? 'Recurring' : 'Ad-hoc';
    }
    
    if (filters.clientFilter && filters.clientFilter !== 'all') {
      const clientName = clients?.find(c => c.id === filters.clientFilter)?.legalName;
      if (clientName) {
        appliedFilters['Client'] = clientName;
      }
    }
    
    if (filters.skillFilter && filters.skillFilter !== 'all') {
      appliedFilters['Skill'] = filters.skillFilter;
    }
    
    if (filters.priorityFilter && filters.priorityFilter !== 'all') {
      appliedFilters['Priority'] = filters.priorityFilter;
    }
    
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      appliedFilters['Status'] = filters.statusFilter;
    }
    
    return appliedFilters;
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      const appliedFilters = options.includeFilters ? getAppliedFilters() : undefined;
      
      await ExportService.exportTasks(exportData, options, appliedFilters);
      
      toast.success(`Tasks exported successfully as ${options.format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export tasks. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  const handlePrintExecute = () => {
    window.print();
    setShowPrintView(false);
  };

  return {
    showPrintView,
    setShowPrintView,
    isExporting,
    exportData,
    getAppliedFilters,
    handleExport,
    handlePrint,
    handlePrintExecute
  };
};
