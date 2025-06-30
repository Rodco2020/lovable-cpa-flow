
/**
 * Grid Data Utilities for Demand Matrix
 * 
 * Handles data aggregation and retrieval logic for the demand matrix grid with client resolution
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
  console.log(`🔍 [GRID DATA UTILS] Aggregating data for resolved client "${clientName}" in month "${monthKey}"`);
  
  // Find all data points for this specific month
  const monthDataPoints = filteredData.dataPoints.filter(point => point.month === monthKey);
  
  let totalHours = 0;
  let totalTasks = 0;
  const allTaskBreakdown = [];

  // For each data point in this month, check if it contains tasks for our target client
  for (const point of monthDataPoints) {
    if (!point.taskBreakdown) continue;
    
    // Filter tasks that belong to our target client (using resolved client name)
    const clientTasks = point.taskBreakdown.filter(task => {
      const matches = task.clientName === clientName;
      if (matches) {
        console.log(`🎯 [GRID DATA UTILS] Found matching task for "${clientName}": ${task.taskName} (${task.monthlyHours} hours)`);
      }
      return matches;
    });
    
    if (clientTasks.length > 0) {
      // Aggregate the hours and tasks for this client
      const clientHoursInThisPoint = clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
      totalHours += clientHoursInThisPoint;
      totalTasks += clientTasks.length;
      allTaskBreakdown.push(...clientTasks);
      
      console.log(`📊 [GRID DATA UTILS] Found ${clientTasks.length} tasks for "${clientName}" in skill "${point.skillType}": ${clientHoursInThisPoint} hours`);
    }
  }

  console.log(`✅ [GRID DATA UTILS] Aggregation complete for resolved client "${clientName}" in ${monthKey}:`, {
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
 * Extract unique client names from task breakdowns (now uses resolved names)
 */
export const getUniqueClientsFromData = (filteredData: DemandMatrixData): string[] => {
  const clientNames = new Set<string>();
  
  console.log('🔍 [GRID DATA UTILS] Extracting unique clients from resolved data...');
  
  // Extract client names from all task breakdowns (these should now be resolved names)
  filteredData.dataPoints.forEach(point => {
    point.taskBreakdown?.forEach(task => {
      if (task.clientName && task.clientName.trim() !== '') {
        // Filter out fallback UUID patterns - we want proper resolved names
        const isResolvedName = !task.clientName.includes('...') && !task.clientName.startsWith('Client ');
        
        if (isResolvedName || task.clientName.length > 20) {
          // Accept if it's a resolved name OR if it's longer than typical UUID fallback
          clientNames.add(task.clientName);
          console.log(`✅ [GRID DATA UTILS] Added resolved client: ${task.clientName}`);
        } else {
          console.log(`⚠️ [GRID DATA UTILS] Skipped fallback client name: ${task.clientName}`);
        }
      }
    });
  });
  
  const allClients = Array.from(clientNames).sort();
  console.log(`📋 [GRID DATA UTILS] Extracted ${allClients.length} unique resolved clients:`, allClients.slice(0, 10));
  return allClients;
};
