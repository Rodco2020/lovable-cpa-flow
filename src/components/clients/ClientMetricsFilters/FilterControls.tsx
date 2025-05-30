
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientMetricsFilters } from '@/types/clientMetrics';

interface FilterControlsProps {
  filters: ClientMetricsFilters;
  onFiltersChange: (filters: ClientMetricsFilters) => void;
  availableIndustries?: string[];
  availableStatuses?: string[];
  onResetFilters: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  availableIndustries = [],
  availableStatuses = [],
  onResetFilters
}) => {
  // Add comprehensive validation to prevent empty strings
  const validIndustries = React.useMemo(() => {
    console.log('Available industries:', availableIndustries);
    if (!Array.isArray(availableIndustries)) return [];
    return availableIndustries.filter(industry => 
      industry && 
      typeof industry === 'string' && 
      industry.trim() !== ''
    );
  }, [availableIndustries]);

  const validStatuses = React.useMemo(() => {
    console.log('Available statuses:', availableStatuses);
    if (!Array.isArray(availableStatuses)) return [];
    return availableStatuses.filter(status => 
      status && 
      typeof status === 'string' && 
      status.trim() !== ''
    );
  }, [availableStatuses]);

  const handleIndustryChange = (value: string) => {
    console.log('Industry change value:', value);
    if (value && value !== 'all') {
      onFiltersChange({
        ...filters,
        industry: value
      });
    } else {
      const { industry, ...rest } = filters;
      onFiltersChange(rest);
    }
  };

  const handleStatusChange = (value: string) => {
    console.log('Status change value:', value);
    if (value && value !== 'all') {
      onFiltersChange({
        ...filters,
        status: value
      });
    } else {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={filters.industry || 'all'}
        onValueChange={handleIndustryChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Industries</SelectItem>
          {validIndustries.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status || 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {validStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        onClick={onResetFilters}
        size="sm"
      >
        Reset Filters
      </Button>
    </div>
  );
};
