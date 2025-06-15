
/**
 * Grid Data Utilities for Demand Matrix
 * 
 * Handles data aggregation and retrieval logic for the demand matrix grid
 */

import { DemandMatrixData } from '@/types/demand';

export interface AggregatedCellData {
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: any[];
}

/**
 * Get aggregated data for a client across all skills in a specific month
 */
export const getAggregatedDataForClient = (
  clientName: string, 
  monthKey: string, 
  filteredData: DemandMatrixData
): AggregatedCellData => {
  console.log(`🔍 [MATRIX GRID] Aggregating data for client "${clientName}" in month "${monthKey}"`);
  
  // Find all data points for this specific month
  const monthDataPoints = filteredData.dataPoints.filter(point => point.month === monthKey);
  
  let totalHours = 0;
  let totalTasks = 0;
  const allTaskBreakdown = [];

  // For each data point in this month, check if it contains tasks for our target client
  for (const point of monthDataPoints) {
    if (!point.taskBreakdown) continue;
    
    // Filter tasks that belong to our target client
    const clientTasks = point.taskBreakdown.filter(task => task.clientName === clientName);
    
    if (clientTasks.length > 0) {
      // Aggregate the hours and tasks for this client
      const clientHoursInThisPoint = clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
      totalHours += clientHoursInThisPoint;
      totalTasks += clientTasks.length;
      allTaskBreakdown.push(...clientTasks);
      
      console.log(`📊 [MATRIX GRID] Found ${clientTasks.length} tasks for "${clientName}" in skill "${point.skillType}": ${clientHoursInThisPoint} hours`);
    }
  }

  console.log(`✅ [MATRIX GRID] Aggregation complete for "${clientName}" in ${monthKey}:`, {
    totalHours,
    totalTasks,
    tasksFound: allTaskBreakdown.length
  });

  return {
    demandHours: totalHours,
    taskCount: totalTasks,
    clientCount: totalHours > 0 ? 1 : 0, // Only count if there's actual demand
    taskBreakdown: allTaskBreakdown
  };
};

/**
 * Get data point for skill-based grouping
 */
export const getDataPointForSkill = (
  skillType: string,
  monthKey: string,
  filteredData: DemandMatrixData
): AggregatedCellData => {
  const dataPoint = filteredData.dataPoints.find(
    point => point.skillType === skillType && point.month === monthKey
  );

  return {
    demandHours: dataPoint?.demandHours || 0,
    taskCount: dataPoint?.taskCount || 0,
    clientCount: dataPoint?.clientCount || 0,
    taskBreakdown: dataPoint?.taskBreakdown || []
  };
};

/**
 * Extract unique client names from task breakdowns
 */
export const getUniqueClientsFromData = (filteredData: DemandMatrixData): string[] => {
  const clientNames = new Set<string>();
  
  // Extract client names from all task breakdowns
  filteredData.dataPoints.forEach(point => {
    point.taskBreakdown?.forEach(task => {
      if (task.clientName && task.clientName.trim() !== '' && !task.clientName.includes('...')) {
        clientNames.add(task.clientName);
      }
    });
  });
  
  const allClients = Array.from(clientNames).sort();
  console.log(`📋 [MATRIX GRID] Extracted ${allClients.length} unique clients:`, allClients.slice(0, 5));
  return allClients;
};
