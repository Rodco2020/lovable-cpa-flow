
import React, { useMemo, useState } from 'react';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { StaffForecastSummaryHeader } from './StaffForecastSummaryHeader';
import { StaffForecastSummaryRow } from './StaffForecastSummaryRow';
import { StaffSummaryTotalsRow } from './StaffSummaryTotalsRow';
import { StaffForecastSummaryService } from '@/services/forecasting/detail/staffForecastSummaryService';

type SortField = 'staffName' | 'utilizationPercentage' | 'totalHours' | 'totalExpectedRevenue';
type SortDirection = 'asc' | 'desc';

interface StaffForecastSummaryGridProps {
  utilizationData: StaffUtilizationData[];
  months: MonthInfo[];
  isLoading?: boolean;
}

export const StaffForecastSummaryGrid: React.FC<StaffForecastSummaryGridProps> = ({
  utilizationData,
  months,
  isLoading = false
}) => {
  const [sortField, setSortField] = useState<SortField>('staffName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort staff utilization data
  const sortedData = useMemo(() => {
    if (!utilizationData || utilizationData.length === 0) return [];

    const sorted = [...utilizationData].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'staffName':
          aValue = a.staffName.toLowerCase();
          bValue = b.staffName.toLowerCase();
          break;
        case 'utilizationPercentage':
          aValue = a.utilizationPercentage;
          bValue = b.utilizationPercentage;
          break;
        case 'totalHours':
          aValue = a.totalHours;
          bValue = b.totalHours;
          break;
        case 'totalExpectedRevenue':
          aValue = a.totalExpectedRevenue;
          bValue = b.totalExpectedRevenue;
          break;
        default:
          aValue = a.staffName.toLowerCase();
          bValue = b.staffName.toLowerCase();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      const comparison = (aValue as number) - (bValue as number);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [utilizationData, sortField, sortDirection]);

  // Calculate firm-wide totals
  const firmTotals = useMemo(() => {
    return StaffForecastSummaryService.calculateFirmWideTotals(utilizationData);
  }, [utilizationData]);

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-muted rounded mb-4"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (utilizationData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No staff utilization data found.</p>
        <p className="text-sm mt-2">Check your forecast configuration and staff assignments.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <div className="min-w-[1400px]">
        {/* Header */}
        <StaffForecastSummaryHeader 
          months={months}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        {/* Body */}
        <div className="divide-y">
          {sortedData.map((staff, index) => (
            <StaffForecastSummaryRow
              key={staff.staffId}
              staff={staff}
              months={months}
              index={index}
            />
          ))}
          <StaffSummaryTotalsRow 
            totals={firmTotals}
            months={months}
            totalStaffCount={sortedData.length}
            utilizationData={utilizationData}
          />
        </div>
      </div>
    </div>
  );
};
