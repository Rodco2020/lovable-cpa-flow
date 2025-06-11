
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixCell } from './DemandMatrixCell';
import { DemandMatrixClientTotalsColumn } from './DemandMatrixClientTotalsColumn';

interface DemandMatrixGridProps {
  filteredData: DemandMatrixData;
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixGrid: React.FC<DemandMatrixGridProps> = ({
  filteredData,
  groupingMode
}) => {
  const getRowLabel = (skillOrClient: string) => {
    // For both skill and client modes, the value is already the display name
    return skillOrClient;
  };

  const getDataPoint = (skillOrClient: string, monthKey: string) => {
    if (groupingMode === 'client') {
      // For client grouping, find data points by matching client names in task breakdown
      return filteredData.dataPoints.find(point => {
        if (point.month !== monthKey) return false;
        
        // Check if any task in the breakdown matches this client name
        return point.taskBreakdown?.some(task => task.clientName === skillOrClient);
      });
    } else {
      // For skill grouping, match by skill type
      return filteredData.dataPoints.find(
        point => point.skillType === skillOrClient && point.month === monthKey
      );
    }
  };

  // FIXED: Corrected aggregation logic for client-based grouping
  const getAggregatedDataForClient = (clientName: string, monthKey: string) => {
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

  // FIXED: Extract unique client names correctly without limits
  const getUniqueClients = () => {
    if (groupingMode !== 'client') return [];
    
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

  // Determine the row items based on grouping mode
  const rowItems = groupingMode === 'client' ? getUniqueClients() : filteredData.skills;

  console.log(`🎯 [MATRIX GRID] Rendering ${groupingMode} matrix with ${rowItems.length} ${groupingMode}s and ${filteredData.months.length} months`);

  // Calculate grid columns - add totals column for client mode
  const gridTemplateColumns = `180px repeat(${filteredData.months.length}, minmax(120px, 1fr))${groupingMode === 'client' ? ' minmax(120px, 1fr)' : ''}`;

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid gap-1 min-w-fit"
        style={{
          gridTemplateColumns,
          gridTemplateRows: `auto repeat(${rowItems.length}, auto)`
        }}
      >
        {/* Top-left corner cell */}
        <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
          {groupingMode === 'skill' ? 'Skill' : 'Client'} / Month
        </div>
        
        {/* Month headers */}
        {filteredData.months.map((month) => (
          <div 
            key={month.key}
            className="p-3 bg-slate-100 border font-medium text-center text-sm"
          >
            {month.label}
          </div>
        ))}
        
        {/* Client Totals Column Header */}
        <DemandMatrixClientTotalsColumn
          filteredData={filteredData}
          groupingMode={groupingMode}
          rowItems={rowItems}
        />
        
        {/* Skill/Client rows */}
        {rowItems.map((skillOrClient) => (
          <React.Fragment key={skillOrClient}>
            {/* Row label - FIXED: Ensure this stays in the first column */}
            <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
              <div className="truncate" title={getRowLabel(skillOrClient)}>
                {getRowLabel(skillOrClient)}
              </div>
            </div>
            
            {/* Demand cells for each month - FIXED: Corrected data retrieval logic */}
            {filteredData.months.map((month) => {
              let cellData;
              
              if (groupingMode === 'client') {
                // FIXED: Use the corrected aggregation function
                cellData = getAggregatedDataForClient(skillOrClient, month.key);
              } else {
                // For skill mode, use the existing data point logic
                const dataPoint = getDataPoint(skillOrClient, month.key);
                cellData = {
                  demandHours: dataPoint?.demandHours || 0,
                  taskCount: dataPoint?.taskCount || 0,
                  clientCount: dataPoint?.clientCount || 0,
                  taskBreakdown: dataPoint?.taskBreakdown || []
                };
              }
              
              return (
                <DemandMatrixCell
                  key={`${skillOrClient}-${month.key}`}
                  skillOrClient={skillOrClient}
                  month={month.key}
                  monthLabel={month.label}
                  demandHours={cellData.demandHours}
                  taskCount={cellData.taskCount}
                  clientCount={cellData.clientCount}
                  taskBreakdown={cellData.taskBreakdown}
                  groupingMode={groupingMode}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
