import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatrixData, getMatrixDataPoint } from '@/services/forecasting/matrixUtils';
import { SkillType } from '@/types/task';

interface AccessibilityEnhancedMatrixProps {
  matrixData: MatrixData;
  selectedSkills: SkillType[];
  monthRange: { start: number; end: number };
  viewMode: 'hours' | 'percentage';
  onCellSelect?: (skill: SkillType, month: string) => void;
  className?: string;
}

/**
 * Accessibility-enhanced matrix component with full WCAG compliance
 */
export const AccessibilityEnhancedMatrix: React.FC<AccessibilityEnhancedMatrixProps> = ({
  matrixData,
  selectedSkills,
  monthRange,
  viewMode,
  onCellSelect,
  className
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Filter data based on selections
  const filteredMonths = matrixData.months.slice(monthRange.start, monthRange.end + 1);
  const filteredSkills = matrixData.skills.filter(skill => selectedSkills.includes(skill));

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tableRef.current) return;

      const focusedElement = document.activeElement as HTMLElement;
      if (!focusedElement || !tableRef.current.contains(focusedElement)) return;

      const cellId = focusedElement.getAttribute('data-cell-id');
      if (!cellId) return;

      const [skillIndex, monthIndex] = cellId.split('-').map(Number);
      
      let newSkillIndex = skillIndex;
      let newMonthIndex = monthIndex;

      switch (event.key) {
        case 'ArrowUp':
          newSkillIndex = Math.max(0, skillIndex - 1);
          break;
        case 'ArrowDown':
          newSkillIndex = Math.min(filteredSkills.length - 1, skillIndex + 1);
          break;
        case 'ArrowLeft':
          newMonthIndex = Math.max(0, monthIndex - 1);
          break;
        case 'ArrowRight':
          newMonthIndex = Math.min(filteredMonths.length - 1, monthIndex + 1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          const skill = filteredSkills[skillIndex];
          const month = filteredMonths[monthIndex];
          if (skill && month && onCellSelect) {
            onCellSelect(skill, month.key);
            announceSelection(skill, month.label);
          }
          return;
        default:
          return;
      }

      event.preventDefault();
      const newCellId = `${newSkillIndex}-${newMonthIndex}`;
      const newCell = tableRef.current?.querySelector(`[data-cell-id="${newCellId}"]`) as HTMLElement;
      if (newCell) {
        newCell.focus();
        announceNavigation(
          filteredSkills[newSkillIndex],
          filteredMonths[newMonthIndex].label
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredSkills, filteredMonths, onCellSelect]);

  const announceSelection = (skill: SkillType, month: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = `Selected ${skill} for ${month}`;
    }
  };

  const announceNavigation = (skill: SkillType, month: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = `Navigated to ${skill}, ${month}`;
    }
  };

  const getCellAccessibilityInfo = (skill: SkillType, month: { key: string; label: string }) => {
    const dataPoint = getMatrixDataPoint(matrixData, skill, month.key);
    if (!dataPoint) return { description: 'No data', severity: 'info' };

    const utilization = dataPoint.utilizationPercent;
    let severity: 'success' | 'warning' | 'error' | 'info';
    let description: string;

    if (utilization >= 120) {
      severity = 'error';
      description = `Critical shortage: ${utilization.toFixed(0)}% utilization`;
    } else if (utilization >= 100) {
      severity = 'warning';
      description = `Over capacity: ${utilization.toFixed(0)}% utilization`;
    } else if (utilization >= 80) {
      severity = 'success';
      description = `Optimal: ${utilization.toFixed(0)}% utilization`;
    } else if (utilization > 0) {
      severity = 'info';
      description = `Under utilized: ${utilization.toFixed(0)}% utilization`;
    } else {
      severity = 'info';
      description = 'No demand';
    }

    return { description, severity, dataPoint };
  };

  const getCellColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 border-red-300 text-red-900';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'success': return 'bg-green-100 border-green-300 text-green-900';
      default: return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Accessible 12-Month Capacity Matrix
          <Badge variant="outline" className="text-xs">
            WCAG 2.1 AA Compliant
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Use arrow keys to navigate, Enter or Space to select cells. 
          Screen reader users can navigate through table structure.
        </p>
      </CardHeader>
      <CardContent>
        {/* Screen reader announcements */}
        <div
          ref={announcementRef}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        />

        {/* Summary for screen readers */}
        <div className="sr-only">
          <p>
            Capacity matrix showing {filteredSkills.length} skills across {filteredMonths.length} months.
            Navigate using arrow keys. Press Enter or Space to select a cell for detailed information.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table
            ref={tableRef}
            className="w-full border-collapse"
            role="grid"
            aria-label="12-month capacity matrix"
            aria-rowcount={filteredSkills.length + 1}
            aria-colcount={filteredMonths.length + 1}
          >
            <caption className="sr-only">
              Capacity utilization matrix showing demand vs capacity percentages 
              for {filteredSkills.length} skills over {filteredMonths.length} months
            </caption>
            
            <thead>
              <tr role="row" aria-rowindex={1}>
                <th
                  scope="col"
                  className="p-3 bg-slate-100 border font-medium text-left sticky left-0 z-10"
                  aria-label="Skills column header"
                >
                  Skill / Month
                </th>
                {filteredMonths.map((month, index) => (
                  <th
                    key={month.key}
                    scope="col"
                    className="p-3 bg-slate-100 border font-medium text-center min-w-[120px]"
                    aria-colindex={index + 2}
                    aria-label={`${month.label} column`}
                  >
                    {month.label}
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {filteredSkills.map((skill, skillIndex) => (
                <tr 
                  key={skill} 
                  role="row" 
                  aria-rowindex={skillIndex + 2}
                  aria-label={`${skill} row`}
                >
                  <th
                    scope="row"
                    className="p-3 bg-slate-100 border font-medium text-left sticky left-0 z-10"
                    aria-label={`${skill} skill`}
                  >
                    {skill}
                  </th>
                  
                  {filteredMonths.map((month, monthIndex) => {
                    const { description, severity, dataPoint } = getCellAccessibilityInfo(skill, month);
                    const cellId = `${skillIndex}-${monthIndex}`;
                    
                    return (
                      <td
                        key={`${skill}-${month.key}`}
                        role="gridcell"
                        className={`p-3 border text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${getCellColor(severity)}`}
                        tabIndex={0}
                        data-cell-id={cellId}
                        aria-colindex={monthIndex + 2}
                        aria-label={`${skill}, ${month.label}: ${description}`}
                        aria-describedby={dataPoint ? `cell-details-${cellId}` : undefined}
                        onClick={() => onCellSelect?.(skill, month.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onCellSelect?.(skill, month.key);
                          }
                        }}
                      >
                        <div className="space-y-1">
                          {dataPoint && (
                            <>
                              <div className="font-medium">
                                {dataPoint.utilizationPercent.toFixed(0)}%
                              </div>
                              {viewMode === 'hours' && (
                                <div className="text-xs">
                                  {dataPoint.demandHours.toFixed(0)}h / {dataPoint.capacityHours.toFixed(0)}h
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Hidden detailed information for screen readers */}
                        {dataPoint && (
                          <div id={`cell-details-${cellId}`} className="sr-only">
                            Demand: {dataPoint.demandHours.toFixed(1)} hours, 
                            Capacity: {dataPoint.capacityHours.toFixed(1)} hours, 
                            Gap: {dataPoint.gap >= 0 ? '+' : ''}{dataPoint.gap.toFixed(1)} hours, 
                            Utilization: {dataPoint.utilizationPercent.toFixed(1)}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend for accessibility */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" aria-hidden="true" />
            <span>Optimal (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" aria-hidden="true" />
            <span>Warning (100-120%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" aria-hidden="true" />
            <span>Critical (&gt;120%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" aria-hidden="true" />
            <span>Under-utilized (&lt;80%)</span>
          </div>
        </div>

        {/* Instructions for keyboard users */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <h4 className="font-medium mb-2">Keyboard Navigation:</h4>
          <ul className="space-y-1 text-xs">
            <li><kbd className="px-1 py-0.5 bg-white border rounded">Arrow Keys</kbd> - Navigate between cells</li>
            <li><kbd className="px-1 py-0.5 bg-white border rounded">Enter</kbd> or <kbd className="px-1 py-0.5 bg-white border rounded">Space</kbd> - Select cell for details</li>
            <li><kbd className="px-1 py-0.5 bg-white border rounded">Tab</kbd> - Navigate to next interactive element</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityEnhancedMatrix;
