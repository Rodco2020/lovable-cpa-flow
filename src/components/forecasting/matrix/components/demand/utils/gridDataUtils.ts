
/**
 * FIXED: Grid Data Utilities for Demand Matrix
 * 
 * Enhanced to properly handle resolved client names and provide better debugging
 */

import { DemandMatrixData } from '@/types/demand';

export interface AggregatedCellData {
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: any[];
}

/**
 * FIXED: Get aggregated data for a client across all skills in a specific month
 * Now properly handles resolved client names from the matrix data
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
 * FIXED: Extract unique client names from task breakdowns (now uses resolved names)
 * Enhanced with better filtering for resolved vs fallback names and client filter support
 */
export const getUniqueClientsFromData = (
  filteredData: DemandMatrixData,
  selectedClients?: string[]  // Add optional parameter for selected client IDs
): string[] => {
  // If client filters are active, return only the selected clients
  if (selectedClients && selectedClients.length > 0) {
    console.log('🎯 CLIENT FILTER - Returning only selected clients:', selectedClients.length);
    
    // Get the client names for the selected client IDs
    const selectedClientNames = new Set<string>();
    
    filteredData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        if (selectedClients.includes(task.clientId)) {
          selectedClientNames.add(task.clientName);
        }
      });
    });
    
    const result = Array.from(selectedClientNames).sort();
    console.log('🔍 CLIENT GRID DEBUG:', {
      selectedClientsCount: selectedClients.length,
      returnedClientsCount: result.length,
      returnedClients: result
    });
    
    return result;
  }
  
  // Otherwise, use existing logic (when no client filter is active)
  console.log('🎯 CLIENT FILTER - No active filter, showing all clients');
  
  const clientNames = new Set<string>();
  
  console.log('🔍 [GRID DATA UTILS] Extracting unique clients from resolved data...');
  
  // Extract client names from all task breakdowns (these should now be resolved names)
  filteredData.dataPoints.forEach(point => {
    point.taskBreakdown?.forEach(task => {
      if (task.clientName && task.clientName.trim() !== '') {
        // Enhanced filtering logic for resolved names
        const isValidResolvedName = (name: string): boolean => {
          // Skip obvious fallback patterns
          if (name.includes('...') || name.startsWith('Client ')) {
            return false;
          }
          
          // Accept names that look like real business names
          if (name.length > 20) {
            return true; // Longer names are likely real business names
          }
          
          // Accept names with multiple words (likely business names)
          if (name.includes(' ') && name.length > 10) {
            return true;
          }
          
          // Accept names with common business suffixes
          const businessSuffixes = ['LLC', 'Inc', 'Corp', 'Ltd', 'Company', 'Co'];
          if (businessSuffixes.some(suffix => name.includes(suffix))) {
            return true;
          }
          
          return false;
        };
        
        if (isValidResolvedName(task.clientName)) {
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
