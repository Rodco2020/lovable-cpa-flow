
/**
 * Grid Header Component for Demand Matrix
 * 
 * Renders the column headers for the demand matrix grid
 */

import React from 'react';

interface GridHeaderProps {
  groupingMode: 'skill' | 'client';
  months: Array<{ key: string; label: string }>;
}

export const GridHeader: React.FC<GridHeaderProps> = ({ groupingMode, months }) => {
  return (
    <>
      {/* Top-left corner cell */}
      <div className="p-3 bg-slate-100 border font-medium text-sm flex items-center sticky left-0 z-10">
        {groupingMode === 'skill' ? 'Skill' : 'Client'} / Month
      </div>
      
      {/* Month headers */}
      {months.map((month) => (
        <div 
          key={month.key}
          className="p-3 bg-slate-100 border font-medium text-center text-sm"
        >
          {month.label}
        </div>
      ))}
      
      {/* Revenue Column Headers for client mode */}
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
          <div 
            className="p-3 bg-emerald-200 border font-semibold text-center text-sm border-l-2 border-emerald-300"
            title="Revenue calculated based on skill-based fee rates and actual demand hours"
          >
            Total Suggested Revenue
          </div>
          <div 
            className="p-3 bg-amber-200 border font-semibold text-center text-sm border-l-2 border-amber-300"
            title="Difference between expected revenue and suggested revenue (Expected - Suggested)"
          >
            Expected Less Suggested
          </div>
        </>
      )}
    </>
  );
};
