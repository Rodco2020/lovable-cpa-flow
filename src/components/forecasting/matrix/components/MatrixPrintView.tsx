
import React from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';
import { formatDate } from '@/lib/utils';

interface MatrixPrintViewProps {
  matrixData: MatrixData;
  selectedSkills: SkillType[];
  selectedClientIds: string[];
  clientNames: Record<string, string>;
  monthRange: { start: number; end: number };
  printOptions: {
    includeCharts: boolean;
    includeClientFilter: boolean;
    orientation: 'portrait' | 'landscape';
  };
  onPrint: () => void;
}

export const MatrixPrintView: React.FC<MatrixPrintViewProps> = ({
  matrixData,
  selectedSkills,
  selectedClientIds,
  clientNames,
  monthRange,
  printOptions,
  onPrint
}) => {
  const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
  const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onPrint();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [onPrint]);

  const getDataPoint = (skill: SkillType, monthKey: string) => {
    return matrixData.dataPoints.find(
      point => point.skillType === skill && point.month === monthKey
    );
  };

  return (
    <div className={`print-view min-h-screen bg-white p-6 ${printOptions.orientation === 'landscape' ? 'landscape' : 'portrait'}`}>
      <style>{`
        @media print {
          .print-view {
            font-size: 11px;
            line-height: 1.3;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .landscape {
            size: landscape;
          }
          .portrait {
            size: portrait;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: center;
          }
          th {
            background-color: #f5f5f5 !important;
            font-weight: bold;
          }
          .capacity-cell {
            background-color: #e3f2fd !important;
          }
          .demand-cell {
            background-color: #fff3e0 !important;
          }
          .gap-positive {
            background-color: #e8f5e8 !important;
          }
          .gap-negative {
            background-color: #ffebee !important;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Capacity Matrix Report</h1>
        <p className="text-gray-600">Generated on: {formatDate(new Date())}</p>
        
        {/* Report Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Time Period:</strong> {filteredMonths[0]?.label} - {filteredMonths[filteredMonths.length - 1]?.label}
          </div>
          <div>
            <strong>Skills:</strong> {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'All skills'}
          </div>
          {printOptions.includeClientFilter && selectedClientIds.length > 0 && (
            <div className="col-span-2">
              <strong>Filtered Clients:</strong> {selectedClientIds.map(id => clientNames[id] || id).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Capacity vs Demand Matrix</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Skill / Month</th>
              {filteredMonths.map(month => (
                <th key={month.key} className="border border-gray-300 p-2 min-w-[80px]">
                  {month.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSkills.map(skill => (
              <React.Fragment key={skill}>
                {/* Capacity Row */}
                <tr>
                  <td className="border border-gray-300 p-2 font-medium bg-blue-50">
                    {skill} (Capacity)
                  </td>
                  {filteredMonths.map(month => {
                    const dataPoint = getDataPoint(skill, month.key);
                    return (
                      <td key={month.key} className="border border-gray-300 p-2 capacity-cell">
                        {dataPoint ? `${dataPoint.capacityHours.toFixed(1)}h` : '0h'}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Demand Row */}
                <tr>
                  <td className="border border-gray-300 p-2 font-medium bg-orange-50">
                    {skill} (Demand)
                  </td>
                  {filteredMonths.map(month => {
                    const dataPoint = getDataPoint(skill, month.key);
                    return (
                      <td key={month.key} className="border border-gray-300 p-2 demand-cell">
                        {dataPoint ? `${dataPoint.demandHours.toFixed(1)}h` : '0h'}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Gap Row */}
                <tr>
                  <td className="border border-gray-300 p-2 font-medium">
                    {skill} (Gap)
                  </td>
                  {filteredMonths.map(month => {
                    const dataPoint = getDataPoint(skill, month.key);
                    const gap = dataPoint?.gap || 0;
                    return (
                      <td 
                        key={month.key} 
                        className={`border border-gray-300 p-2 ${gap >= 0 ? 'gap-positive' : 'gap-negative'}`}
                      >
                        {dataPoint ? `${gap >= 0 ? '+' : ''}${gap.toFixed(1)}h` : '0h'}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Summary Statistics</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 border rounded">
            <div className="font-medium">Total Capacity</div>
            <div className="text-lg">
              {matrixData.dataPoints
                .filter(p => selectedSkills.includes(p.skillType))
                .reduce((sum, p) => sum + p.capacityHours, 0)
                .toFixed(1)}h
            </div>
          </div>
          <div className="p-3 border rounded">
            <div className="font-medium">Total Demand</div>
            <div className="text-lg">
              {matrixData.dataPoints
                .filter(p => selectedSkills.includes(p.skillType))
                .reduce((sum, p) => sum + p.demandHours, 0)
                .toFixed(1)}h
            </div>
          </div>
          <div className="p-3 border rounded">
            <div className="font-medium">Overall Gap</div>
            <div className="text-lg">
              {matrixData.dataPoints
                .filter(p => selectedSkills.includes(p.skillType))
                .reduce((sum, p) => sum + p.gap, 0)
                .toFixed(1)}h
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 text-xs">
        <h3 className="font-semibold mb-2">Legend:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border"></div>
            <span>Capacity (available hours)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border"></div>
            <span>Demand (required hours)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border"></div>
            <span>Positive gap (surplus capacity)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border"></div>
            <span>Negative gap (capacity shortage)</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-xs text-gray-600">
        <p>CPA Practice Management System - Capacity Matrix Report</p>
      </div>
    </div>
  );
};
