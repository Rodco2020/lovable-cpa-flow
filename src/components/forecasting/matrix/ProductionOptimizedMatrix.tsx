import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatrixData, getMatrixDataPoint } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

interface ProductionOptimizedMatrixProps {
  matrixData: MatrixData;
  selectedSkills: SkillType[];
  monthRange: { start: number; end: number };
  viewMode: 'hours' | 'percentage';
  onCellClick?: (skill: SkillType, month: string) => void;
  className?: string;
}

/**
 * Production-optimized matrix component with performance optimizations
 */
const ProductionOptimizedMatrix: React.FC<ProductionOptimizedMatrixProps> = ({
  matrixData,
  selectedSkills,
  monthRange,
  viewMode,
  onCellClick,
  className
}) => {
  // Memoized filtered data to prevent unnecessary recalculations
  const filteredData = useMemo(() => {
    const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
    const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));
    
    return {
      months: filteredMonths,
      skills: filteredSkills,
      dataPoints: matrixData.dataPoints.filter(
        point => 
          selectedSkills.includes(point.skillType) &&
          filteredMonths.some(month => month.key === point.month)
      )
    };
  }, [matrixData, selectedSkills, monthRange]);

  // Memoized cell color calculation
  const getCellColorClass = useCallback((utilizationPercent: number) => {
    if (utilizationPercent >= 120) return 'bg-red-100 border-red-300 text-red-900';
    if (utilizationPercent >= 100) return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    if (utilizationPercent >= 80) return 'bg-green-100 border-green-300 text-green-900';
    if (utilizationPercent > 0) return 'bg-blue-100 border-blue-300 text-blue-900';
    return 'bg-gray-50 border-gray-300 text-gray-500';
  }, []);

  // Memoized cell click handler to prevent recreating functions
  const handleCellClick = useCallback((skill: SkillType, monthKey: string) => {
    onCellClick?.(skill, monthKey);
  }, [onCellClick]);

  // Memoized cell component for better performance
  const MatrixCell = memo<{
    skill: SkillType;
    month: { key: string; label: string };
    dataPoint: any;
    colorClass: string;
    onClick: () => void;
  }>(({ skill, month, dataPoint, colorClass, onClick }) => (
    <div
      className={`p-3 border text-center cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
      onClick={onClick}
      role="gridcell"
      aria-label={`${skill} ${month.label}: ${dataPoint?.utilizationPercent?.toFixed(0) || 0}% utilization`}
    >
      <div className="space-y-1">
        {dataPoint && (
          <>
            <div className="font-medium text-sm">
              {dataPoint.utilizationPercent.toFixed(0)}%
            </div>
            {viewMode === 'hours' && (
              <div className="text-xs opacity-75">
                {dataPoint.demandHours.toFixed(0)}h / {dataPoint.capacityHours.toFixed(0)}h
              </div>
            )}
          </>
        )}
      </div>
    </div>
  ));

  // Generate grid style for optimal layout
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `140px repeat(${filteredData.months.length}, minmax(100px, 1fr))`,
    gridTemplateRows: `auto repeat(${filteredData.skills.length}, auto)`,
    gap: '1px'
  }), [filteredData.months.length, filteredData.skills.length]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Production Capacity Matrix
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Optimized
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {filteredData.skills.length} × {filteredData.months.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div style={gridStyle} className="min-w-fit bg-white">
            {/* Header row */}
            <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
              Skill / Month
            </div>
            
            {filteredData.months.map((month) => (
              <div 
                key={month.key}
                className="p-3 bg-slate-100 border font-medium text-center text-sm"
              >
                {month.label}
              </div>
            ))}
            
            {/* Data rows */}
            {filteredData.skills.map((skill) => (
              <React.Fragment key={skill}>
                {/* Skill label */}
                <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
                  {skill}
                </div>
                
                {/* Cells for each month */}
                {filteredData.months.map((month) => {
                  const dataPoint = getMatrixDataPoint(matrixData, skill, month.key);
                  const colorClass = getCellColorClass(dataPoint?.utilizationPercent || 0);
                  
                  return (
                    <MatrixCell
                      key={`${skill}-${month.key}`}
                      skill={skill}
                      month={month}
                      dataPoint={dataPoint}
                      colorClass={colorClass}
                      onClick={() => handleCellClick(skill, month.key)}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Performance metrics */}
        <div className="mt-4 text-xs text-muted-foreground">
          Rendered {filteredData.skills.length * filteredData.months.length} cells 
          • {filteredData.dataPoints.length} data points loaded
        </div>
      </CardContent>
    </Card>
  );
};

// Export both named and default
export { ProductionOptimizedMatrix };
export default memo(ProductionOptimizedMatrix);
