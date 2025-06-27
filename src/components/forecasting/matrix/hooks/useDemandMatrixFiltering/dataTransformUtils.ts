
import { DemandMatrixData } from '@/types/demand';

/**
 * Data transformation utilities for demand matrix filtering
 * 
 * This module handles data transformation and grouping operations
 * for different matrix viewing modes.
 */

/**
 * Transform data for client-based grouping view
 */
export function transformForClientGrouping(optimizedData: DemandMatrixData): DemandMatrixData {
  const clientGroupedData = {
    ...optimizedData,
    skills: Array.from(new Set(
      optimizedData.dataPoints
        .flatMap(point => point.taskBreakdown?.map(task => task.clientName) || [])
        .filter(name => name && !name.includes('...'))
    )),
    dataPoints: optimizedData.dataPoints
  };

  console.log(`👥 [DEMAND MATRIX] Client grouping applied:`, {
    uniqueClients: clientGroupedData.skills.length,
    dataPointsAfterGrouping: clientGroupedData.dataPoints.length
  });

  return clientGroupedData;
}

/**
 * Log comprehensive filter results with staff filtering analysis
 */
export function logFilterResults(
  demandData: DemandMatrixData,
  finalOptimizedData: DemandMatrixData,
  filters: any
): void {
  console.log(`📊 [DEMAND MATRIX] PHASE 1 LOGGING: Enhanced filter results:`, {
    originalDataPoints: demandData.dataPoints.length,
    filteredDataPoints: finalOptimizedData.dataPoints.length,
    originalSkills: demandData.skills.length,
    filteredSkills: finalOptimizedData.skills.length,
    monthsWithLabels: finalOptimizedData.months.length,
    sampleMonth: finalOptimizedData.months[0], // Log sample month to verify structure
    totalDemandHours: finalOptimizedData.totalDemand || 0,
    totalTasks: finalOptimizedData.totalTasks,
    totalClients: finalOptimizedData.totalClients,
    preferredStaffFilterApplied: filters.preferredStaff.length > 0,
    preferredStaffFilterDetails: {
      filterIds: filters.preferredStaff,
      filterIdTypes: filters.preferredStaff.map(id => ({ id, type: typeof id })),
      originalTasksWithStaff: demandData.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.filter(task => task.preferredStaffId).length || 0), 0),
      filteredTasksWithStaff: finalOptimizedData.dataPoints.reduce((sum, dp) => sum + (dp.taskBreakdown?.filter(task => task.preferredStaffId).length || 0), 0)
    },
    filteringEfficiency: `${((finalOptimizedData.dataPoints.length / demandData.dataPoints.length) * 100).toFixed(1)}%`,
    optimizationCompleteTime: new Date().toISOString()
  });
}

/**
 * Log enhanced filter creation with staff ID analysis
 */
export function logFilterCreation(filters: any): void {
  console.log(`🎯 [DEMAND MATRIX] PHASE 1 LOGGING: Applied enhanced filters:`, {
    skillsFilter: filters.skills.length === 0 ? 'ALL SKILLS (no filter)' : filters.skills,
    clientsFilter: filters.clients.length === 0 ? 'ALL CLIENTS (no filter)' : filters.clients,
    preferredStaffFilter: filters.preferredStaff.length === 0 ? 'ALL STAFF (no filter)' : filters.preferredStaff,
    preferredStaffFilterTypes: filters.preferredStaff.map(id => ({ id, type: typeof id })),
    timeHorizonFilter: `${filters.timeHorizon.start.toISOString().split('T')[0]} to ${filters.timeHorizon.end.toISOString().split('T')[0]}`,
    timeHorizonDays: Math.abs(filters.timeHorizon.end.getTime() - filters.timeHorizon.start.getTime()) / (1000 * 60 * 60 * 24),
    filterCreationTime: new Date().toISOString(),
    willApplyPreferredStaffFilter: filters.preferredStaff.length > 0
  });
}
