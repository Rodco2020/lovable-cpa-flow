
import React from 'react';
import { EnhancedMatrixCell } from '../EnhancedMatrixCell';
import { MatrixData, getMatrixDataPoint } from '@/services/forecasting/matrixUtils';
import { getRowLabelSync, validateSkillName } from './demand/utils/gridLayoutUtils';

interface MatrixGridProps {
  filteredData: MatrixData;
  viewMode: 'hours' | 'percentage';
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  filteredData,
  viewMode
}) => {
  // Validate skill names for debugging
  React.useEffect(() => {
    const invalidSkills = filteredData.skills.filter(skill => !validateSkillName(skill));
    if (invalidSkills.length > 0) {
      console.warn('⚠️ [MATRIX GRID] Invalid skill names detected:', invalidSkills);
    }
  }, [filteredData.skills]);

  return (
    <div className="overflow-x-auto">
      <div 
        className="grid gap-1 min-w-fit"
        style={{
          gridTemplateColumns: `140px repeat(${filteredData.months.length}, minmax(100px, 1fr))`,
          gridTemplateRows: `auto repeat(${filteredData.skills.length}, auto)`
        }}
      >
        {/* Top-left corner cell */}
        <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
          Skill / Month
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
        
        {/* Skill rows */}
        {filteredData.skills.map((skill) => (
          <React.Fragment key={skill}>
            {/* Skill label with resolved display name */}
            <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
              {getRowLabelSync(skill)}
            </div>
            
            {/* Enhanced cells for each month */}
            {filteredData.months.map((month) => {
              const dataPoint = getMatrixDataPoint(filteredData, skill, month.key);
              
              return (
                <EnhancedMatrixCell
                  key={`${skill}-${month.key}`}
                  skillType={skill}
                  month={month.key}
                  monthLabel={month.label}
                  demandHours={dataPoint?.demandHours || 0}
                  capacityHours={dataPoint?.capacityHours || 0}
                  gap={dataPoint?.gap || 0}
                  utilizationPercent={dataPoint?.utilizationPercent || 0}
                  viewMode={viewMode}
                  taskBreakdown={[]}
                  staffAllocation={[]}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
