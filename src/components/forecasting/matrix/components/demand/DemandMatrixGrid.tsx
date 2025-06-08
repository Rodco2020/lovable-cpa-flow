
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
    if (groupingMode === 'client') {
      // Find client name from data
      const clientTask = filteredData.dataPoints
        .flatMap(point => point.taskBreakdown)
        .find(task => task.clientId === skillOrClient);
      return clientTask?.clientName || skillOrClient;
    }
    return skillOrClient;
  };

  const getDataPoint = (skillOrClient: string, monthKey: string) => {
    return filteredData.dataPoints.find(
      point => point.skillType === skillOrClient && point.month === monthKey
    );
  };

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid gap-1 min-w-fit"
        style={{
          gridTemplateColumns: `180px repeat(${filteredData.months.length}, minmax(120px, 1fr))`,
          gridTemplateRows: `auto repeat(${filteredData.skills.length}, auto)`
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
        {filteredData.skills.map((skillOrClient) => (
          <React.Fragment key={skillOrClient}>
            {/* Row label */}
            <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
              <div className="truncate" title={getRowLabel(skillOrClient)}>
                {getRowLabel(skillOrClient)}
              </div>
            </div>
            
            {/* Demand cells for each month */}
            {filteredData.months.map((month) => {
              const dataPoint = getDataPoint(skillOrClient, month.key);
              
              return (
                <DemandMatrixCell
                  key={`${skillOrClient}-${month.key}`}
                  skillOrClient={skillOrClient}
                  month={month.key}
                  monthLabel={month.label}
                  demandHours={dataPoint?.demandHours || 0}
                  taskCount={dataPoint?.taskCount || 0}
                  clientCount={dataPoint?.clientCount || 0}
                  taskBreakdown={dataPoint?.taskBreakdown || []}
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
