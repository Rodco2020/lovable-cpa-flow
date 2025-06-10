
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixCell } from './DemandMatrixCell';

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

  const getAggregatedDataForClient = (clientName: string, monthKey: string) => {
    // Aggregate all data points for this client in this month using resolved client names
    const relevantPoints = filteredData.dataPoints.filter(point => 
      point.month === monthKey && 
      point.taskBreakdown?.some(task => task.clientName === clientName)
    );

    let totalHours = 0;
    let totalTasks = 0;
    const allTaskBreakdown = [];

    for (const point of relevantPoints) {
      // Filter tasks by exact client name match (not UUID)
      const clientTasks = point.taskBreakdown?.filter(task => task.clientName === clientName) || [];
      totalHours += clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0);
      totalTasks += clientTasks.length;
      allTaskBreakdown.push(...clientTasks);
    }

    console.log(`📊 [MATRIX GRID] Aggregated for client "${clientName}" in ${monthKey}:`, {
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

  // Extract unique client names from task breakdowns for client grouping - NO LIMITS
  const getUniqueClients = () => {
    if (groupingMode !== 'client') return [];
    
    const clientNames = new Set<string>();
    
    filteredData.dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        if (task.clientName && !task.clientName.includes('...')) { // Exclude fallback names
          clientNames.add(task.clientName);
        }
      });
    });
    
    // REMOVED: Array.from(clientNames).sort().slice(0, 50) - Now returns ALL clients
    const allClients = Array.from(clientNames).sort();
    console.log(`📊 [MATRIX GRID] Found ${allClients.length} unique clients for display`);
    return allClients;
  };

  // Determine the skills/clients list based on grouping mode
  const rowItems = groupingMode === 'client' ? getUniqueClients() : filteredData.skills;

  console.log(`📊 [MATRIX GRID] Rendering matrix with ${rowItems.length} ${groupingMode}s and ${filteredData.months.length} months`);

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid gap-1 min-w-fit"
        style={{
          gridTemplateColumns: `180px repeat(${filteredData.months.length}, minmax(120px, 1fr))`,
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
        
        {/* Skill/Client rows */}
        {rowItems.map((skillOrClient) => (
          <React.Fragment key={skillOrClient}>
            {/* Row label */}
            <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
              <div className="truncate" title={getRowLabel(skillOrClient)}>
                {getRowLabel(skillOrClient)}
              </div>
            </div>
            
            {/* Demand cells for each month */}
            {filteredData.months.map((month) => {
              let cellData;
              
              if (groupingMode === 'client') {
                // For client mode, aggregate data across all skills for this client
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
