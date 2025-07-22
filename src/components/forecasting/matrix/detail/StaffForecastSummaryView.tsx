
import React from 'react';
import { StaffForecastSummaryGrid } from './components/StaffForecastSummaryGrid';
import { StaffSummaryTotalsRow } from './components/StaffSummaryTotalsRow';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';

interface StaffForecastSummaryViewProps {
  utilizationData: StaffUtilizationData[];
  months: MonthInfo[];
  isLoading: boolean;
  error: string | null;
  firmTotals: {
    totalDemand: number;
    totalCapacity: number;
    overallUtilization: number;
    totalRevenue: number;
    totalGap: number;
  };
  filterStats: {
    activeFiltersCount: number;
    hasActiveFilters: boolean;
  };
}

export const StaffForecastSummaryView: React.FC<StaffForecastSummaryViewProps> = ({
  utilizationData,
  months,
  isLoading,
  error,
  firmTotals,
  filterStats
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading staff forecast summary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  if (utilizationData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">No staff utilization data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Status */}
      {filterStats.hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          Showing results with {filterStats.activeFiltersCount} active filter(s)
        </div>
      )}
      
      {/* Responsive Container for Staff Forecast Summary Grid */}
      <div className="overflow-x-auto min-w-0">
        <div className="min-w-fit">
          <StaffForecastSummaryGrid
            utilizationData={utilizationData}
            months={months}
            isLoading={isLoading}
          />
          
          {/* Firm Totals */}
          <div className="mt-4 border-t pt-4">
            <StaffSummaryTotalsRow
              totals={firmTotals}
              months={months}
              totalStaffCount={utilizationData.filter(s => s.staffId !== 'unassigned').length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
