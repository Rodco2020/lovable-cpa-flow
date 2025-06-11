
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { ClientTotalsCalculator } from '@/services/forecasting/demand/matrixTransformer/clientTotalsCalculator';

interface DemandMatrixClientTotalsColumnProps {
  filteredData: DemandMatrixData;
  groupingMode: 'skill' | 'client';
  rowItems: string[];
}

export const DemandMatrixClientTotalsColumn: React.FC<DemandMatrixClientTotalsColumnProps> = ({
  filteredData,
  groupingMode,
  rowItems
}) => {
  // Only show totals column for client grouping mode
  if (groupingMode !== 'client') {
    return null;
  }

  const clientTotals = filteredData.clientTotals || new Map();
  const grandTotal = ClientTotalsCalculator.calculateGrandTotal(clientTotals);

  const getClientTotal = (clientName: string): number => {
    return clientTotals.get(clientName) || 0;
  };

  const formatHours = (hours: number): string => {
    return hours > 0 ? `${hours.toFixed(1)}h` : '0h';
  };

  const getCellColorClass = (hours: number): string => {
    if (hours === 0) return 'bg-slate-50 text-slate-400';
    if (hours < 10) return 'bg-blue-50 text-blue-700';
    if (hours < 50) return 'bg-blue-100 text-blue-800';
    if (hours < 100) return 'bg-blue-200 text-blue-900';
    return 'bg-blue-300 text-blue-950 font-semibold';
  };

  return (
    <>
      {/* Header cell */}
      <div className="p-3 bg-slate-200 border font-semibold text-center text-sm border-l-2 border-slate-300">
        Total Hours
      </div>
      
      {/* Client total cells */}
      {rowItems.map((clientName) => {
        const totalHours = getClientTotal(clientName);
        const colorClass = getCellColorClass(totalHours);
        
        return (
          <div 
            key={`${clientName}-total`}
            className={`p-3 border text-center text-sm font-medium border-l-2 border-slate-300 ${colorClass}`}
            title={`Total: ${formatHours(totalHours)} for ${clientName}`}
          >
            {formatHours(totalHours)}
          </div>
        );
      })}
      
      {/* Grand total cell - only if we have clients */}
      {rowItems.length > 0 && (
        <div className="p-3 bg-slate-100 border border-l-2 border-slate-400 text-center text-sm font-bold text-slate-800">
          {formatHours(grandTotal)}
        </div>
      )}
    </>
  );
};
