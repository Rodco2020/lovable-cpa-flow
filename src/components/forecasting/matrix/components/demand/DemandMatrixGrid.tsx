
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixCell } from './DemandMatrixCell';
import { ClientTotalsCalculator } from '@/services/forecasting/demand/matrixTransformer/clientTotalsCalculator';
import { ClientRevenueCalculator } from '@/services/forecasting/demand/matrixTransformer/clientRevenueCalculator';

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

  // NEW: Calculate grid columns - add revenue columns for client mode
  const extraColumnsCount = groupingMode === 'client' ? 3 : 0; // Total Hours + Total Revenue + Hourly Rate
  const gridTemplateColumns = `180px repeat(${filteredData.months.length}, minmax(120px, 1fr))${
    groupingMode === 'client' ? ' repeat(3, minmax(140px, 1fr))' : ''
  }`;

  // Totals helpers for client grouping mode
  const clientTotals = filteredData.clientTotals || new Map<string, number>();
  const clientRevenue = filteredData.clientRevenue || new Map<string, number>();
  const clientHourlyRates = filteredData.clientHourlyRates || new Map<string, number>();

  const getClientTotal = (clientName: string): number => clientTotals.get(clientName) || 0;
  const getClientRevenue = (clientName: string): number => clientRevenue.get(clientName) || 0;
  const getClientHourlyRate = (clientName: string): number => clientHourlyRates.get(clientName) || 0;

  // NEW: Grand totals for client mode
  const grandTotalHours = ClientTotalsCalculator.calculateGrandTotal(clientTotals);
  const grandTotalRevenue = ClientRevenueCalculator.calculateGrandTotalRevenue(clientRevenue);
  const grandAverageRate = ClientRevenueCalculator.calculateWeightedAverageRate(clientTotals, clientRevenue);

  // NEW: Formatting utilities
  const formatHours = (hours: number): string => (hours > 0 ? `${hours.toFixed(1)}h` : '0h');
  const formatCurrency = (amount: number): string => (amount > 0 ? `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0');
  const formatRate = (rate: number): string => (rate > 0 ? `$${rate.toFixed(2)}/h` : '$0/h');

  const getCellColorClass = (hours: number): string => {
    if (hours === 0) return 'bg-slate-50 text-slate-400';
    if (hours < 10) return 'bg-blue-50 text-blue-700';
    if (hours < 50) return 'bg-blue-100 text-blue-800';
    if (hours < 100) return 'bg-blue-200 text-blue-900';
    return 'bg-blue-300 text-blue-950 font-semibold';
  };

  // NEW: Revenue-based color classes
  const getRevenueCellColorClass = (revenue: number): string => {
    if (revenue === 0) return 'bg-slate-50 text-slate-400';
    if (revenue < 1000) return 'bg-green-50 text-green-700';
    if (revenue < 5000) return 'bg-green-100 text-green-800';
    if (revenue < 20000) return 'bg-green-200 text-green-900';
    return 'bg-green-300 text-green-950 font-semibold';
  };

  const getRateCellColorClass = (rate: number): string => {
    if (rate === 0) return 'bg-slate-50 text-slate-400';
    if (rate < 50) return 'bg-purple-50 text-purple-700';
    if (rate < 100) return 'bg-purple-100 text-purple-800';
    if (rate < 200) return 'bg-purple-200 text-purple-900';
    return 'bg-purple-300 text-purple-950 font-semibold';
  };

  const additionalRows = groupingMode === 'client' && rowItems.length > 0 ? 1 : 0;

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid gap-1 min-w-fit"
        style={{
          gridTemplateColumns,
          gridTemplateRows: `auto repeat(${rowItems.length + additionalRows}, auto)`
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
        
        {/* NEW: Client Revenue Column Headers */}
        {groupingMode === 'client' && (
          <>
            <div className="p-3 bg-slate-200 border font-semibold text-center text-sm border-l-2 border-slate-300">
              Total Hours
            </div>
            <div className="p-3 bg-green-200 border font-semibold text-center text-sm border-l-2 border-green-300">
              Total Expected Revenue
            </div>
            <div className="p-3 bg-purple-200 border font-semibold text-center text-sm border-l-2 border-purple-300">
              Expected Hourly Rate
            </div>
          </>
        )}
        
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

            {/* NEW: Revenue summary cells for client mode */}
            {groupingMode === 'client' && (() => {
              const totalHours = getClientTotal(skillOrClient);
              const totalRevenue = getClientRevenue(skillOrClient);
              const hourlyRate = getClientHourlyRate(skillOrClient);
              
              const hoursColorClass = getCellColorClass(totalHours);
              const revenueColorClass = getRevenueCellColorClass(totalRevenue);
              const rateColorClass = getRateCellColorClass(hourlyRate);
              
              return (
                <>
                  {/* Total Hours */}
                  <div
                    key={`${skillOrClient}-total-hours`}
                    className={`p-3 border text-center text-sm font-medium border-l-2 border-slate-300 ${hoursColorClass}`}
                    title={`Total: ${formatHours(totalHours)} for ${skillOrClient}`}
                  >
                    {formatHours(totalHours)}
                  </div>
                  
                  {/* Total Expected Revenue */}
                  <div
                    key={`${skillOrClient}-total-revenue`}
                    className={`p-3 border text-center text-sm font-medium border-l-2 border-green-300 ${revenueColorClass}`}
                    title={`Total Expected Revenue: ${formatCurrency(totalRevenue)} for ${skillOrClient}`}
                  >
                    {formatCurrency(totalRevenue)}
                  </div>
                  
                  {/* Expected Hourly Rate */}
                  <div
                    key={`${skillOrClient}-hourly-rate`}
                    className={`p-3 border text-center text-sm font-medium border-l-2 border-purple-300 ${rateColorClass}`}
                    title={`Expected Hourly Rate: ${formatRate(hourlyRate)} for ${skillOrClient}`}
                  >
                    {formatRate(hourlyRate)}
                  </div>
                </>
              );
            })()}
          </React.Fragment>
        ))}

        {/* NEW: Grand total cells aligned to the summary columns */}
        {groupingMode === 'client' && rowItems.length > 0 && (
          <>
            {/* Grand Total Hours */}
            <div
              className="p-3 bg-slate-100 border border-l-2 border-slate-400 text-center text-sm font-bold text-slate-800"
              style={{ gridColumnStart: filteredData.months.length + 2 }}
            >
              {formatHours(grandTotalHours)}
            </div>
            
            {/* Grand Total Revenue */}
            <div
              className="p-3 bg-green-100 border border-l-2 border-green-400 text-center text-sm font-bold text-green-800"
            >
              {formatCurrency(grandTotalRevenue)}
            </div>
            
            {/* Weighted Average Rate */}
            <div
              className="p-3 bg-purple-100 border border-l-2 border-purple-400 text-center text-sm font-bold text-purple-800"
            >
              {formatRate(grandAverageRate)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
