
import { DemandMatrixData } from '@/types/demand';
import { DiagnosticsData, FallbackDataset } from './types';

/**
 * Diagnostic utilities for demand matrix filtering
 * 
 * This module provides debugging and diagnostic functions to help
 * identify and resolve filtering issues.
 */

/**
 * Run detailed diagnostics when filtering removes all data - PHASE 1 ENHANCED
 */
export function runFilteringDiagnostics(
  originalData: DemandMatrixData, 
  filters: any, 
  filteredMonths: Array<{ key: string; label: string }>
): void {
  console.log(`🔍 [FILTERING DIAGNOSTICS] PHASE 1 LOGGING: Analyzing why all data was filtered out:`);
  console.log(`📊 Original data summary:`, {
    totalDataPoints: originalData.dataPoints.length,
    availableMonths: originalData.months.map(m => m.key),
    availableSkills: originalData.skills,
    sampleDataPoints: originalData.dataPoints.slice(0, 5).map(dp => ({
      month: dp.month,
      skillType: dp.skillType,
      demandHours: dp.demandHours,
      taskCount: dp.taskBreakdown?.length || 0
    }))
  });
  
  // PHASE 1 LOGGING: Enhanced preferred staff diagnostics
  const allTasksWithStaff = originalData.dataPoints
    .flatMap(dp => dp.taskBreakdown || [])
    .filter(task => task.preferredStaffId);

  console.log(`🎯 [FILTERING DIAGNOSTICS] PHASE 1 LOGGING: Applied filters:`, {
    skills: filters.skills.length === 0 ? 'No skill filtering' : filters.skills,
    clients: filters.clients.length === 0 ? 'No client filtering' : filters.clients,
    preferredStaff: filters.preferredStaff.length === 0 ? 'No preferred staff filtering' : filters.preferredStaff,
    preferredStaffTypes: filters.preferredStaff.map(id => ({ id, type: typeof id })),
    timeHorizon: `${filters.timeHorizon.start.toISOString()} to ${filters.timeHorizon.end.toISOString()}`,
    filteredMonthKeys: filteredMonths.map(m => m.key),
    staffFilteringAnalysis: {
      totalTasksWithStaff: allTasksWithStaff.length,
      uniqueStaffIdsInData: Array.from(new Set(allTasksWithStaff.map(task => task.preferredStaffId))),
      uniqueStaffIdTypesInData: Array.from(new Set(allTasksWithStaff.map(task => typeof task.preferredStaffId))),
      filterStaffIds: filters.preferredStaff,
      filterStaffIdTypes: Array.from(new Set(filters.preferredStaff.map(id => typeof id))),
      potentialMatches: allTasksWithStaff.some(task => 
        filters.preferredStaff.includes(task.preferredStaffId)
      )
    }
  });
}

/**
 * Create a fallback dataset when all data is filtered out
 */
export function createFallbackDataset(
  originalData: DemandMatrixData, 
  filteredMonths: Array<{ key: string; label: string }>
): DemandMatrixData {
  console.log(`🔧 [FALLBACK] Creating minimal dataset to prevent complete failure`);
  
  return {
    ...originalData,
    months: filteredMonths.length > 0 ? filteredMonths : originalData.months.slice(0, 1),
    dataPoints: [], // Empty but valid
    totalDemand: 0,
    totalTasks: 0,
    totalClients: 0
  };
}

/**
 * Log comprehensive PHASE 1 data analysis
 */
export function logPhase1DataAnalysis(
  demandData: DemandMatrixData,
  demandMatrixControls: any,
  groupingMode: 'skill' | 'client'
): void {
  console.log(`🔧 [DEMAND MATRIX] PHASE 1 LOGGING: Starting enhanced filter operation:`, {
    groupingMode,
    selectedSkillsCount: demandMatrixControls.selectedSkills.length,
    availableSkillsCount: demandMatrixControls.availableSkills.length,
    selectedClientsCount: demandMatrixControls.selectedClients.length,
    availableClientsCount: demandMatrixControls.availableClients.length,
    selectedPreferredStaffCount: demandMatrixControls.selectedPreferredStaff.length,
    selectedPreferredStaff: demandMatrixControls.selectedPreferredStaff,
    selectedPreferredStaffTypes: demandMatrixControls.selectedPreferredStaff.map(id => ({ id, type: typeof id })),
    availablePreferredStaffCount: demandMatrixControls.availablePreferredStaff.length,
    availablePreferredStaff: demandMatrixControls.availablePreferredStaff.map(staff => ({
      id: staff.id,
      idType: typeof staff.id,
      name: staff.name
    })),
    isAllSkillsSelected: demandMatrixControls.isAllSkillsSelected,
    isAllClientsSelected: demandMatrixControls.isAllClientsSelected,
    isAllPreferredStaffSelected: demandMatrixControls.isAllPreferredStaffSelected,
    monthRange: demandMatrixControls.monthRange,
    originalDataPoints: demandData.dataPoints.length,
    availableMonths: demandData.months.length,
    filterStartTime: new Date().toISOString()
  });
}

/**
 * Log original data structure analysis with staff ID analysis
 */
export function logOriginalDataAnalysis(demandData: DemandMatrixData): void {
  if (demandData.dataPoints.length > 0) {
    const sampleDataPoint = demandData.dataPoints[0];
    if (sampleDataPoint?.taskBreakdown?.[0]) {
      const tasksWithPreferredStaff = demandData.dataPoints
        .flatMap(dp => dp.taskBreakdown || [])
        .filter(task => task.preferredStaffId);

      console.log(`🔍 [DEMAND MATRIX] PHASE 1 LOGGING: Original data staff ID analysis:`, {
        totalDataPoints: demandData.dataPoints.length,
        totalTasks: demandData.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.length || 0), 0),
        tasksWithPreferredStaff: tasksWithPreferredStaff.length,
        sampleTaskStaffData: tasksWithPreferredStaff.slice(0, 3).map(task => ({
          taskName: task.taskName,
          preferredStaffId: task.preferredStaffId,
          preferredStaffIdType: typeof task.preferredStaffId,
          preferredStaffName: task.preferredStaffName,
          clientName: task.clientName
        })),
        uniqueStaffIds: Array.from(new Set(tasksWithPreferredStaff.map(task => task.preferredStaffId))),
        uniqueStaffIdTypes: Array.from(new Set(tasksWithPreferredStaff.map(task => typeof task.preferredStaffId))),
        dataAnalysisTime: new Date().toISOString()
      });
    }
  }
}
