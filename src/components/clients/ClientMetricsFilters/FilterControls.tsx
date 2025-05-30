
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
import { StaffOption } from '@/types/staffOption';

interface FilterControlsProps {
  filters: ClientMetricsFilters;
  onFiltersChange: (filters: ClientMetricsFilters) => void;
  availableIndustries?: string[];
  availableStatuses?: Array<'Active' | 'Inactive'>;
  onResetFilters: () => void;
  staffOptions?: StaffOption[];
  isStaffLoading?: boolean;
  onFilterChange?: (key: keyof ClientMetricsFilters, value: any) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  availableIndustries = [],
  availableStatuses = [],
  onResetFilters,
  staffOptions = [],
  isStaffLoading = false,
  onFilterChange
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
      status.trim() !== '' &&
      (status === 'Active' || status === 'Inactive')
    );
  }, [availableStatuses]);

  const validStaffOptions = React.useMemo(() => {
    console.log('Available staff options:', staffOptions);
    if (!Array.isArray(staffOptions)) return [];
    return staffOptions.filter(staff => 
      staff && 
      typeof staff === 'object' && 
      staff.id && 
      typeof staff.id === 'string' && 
      staff.id.trim() !== '' &&
      staff.full_name &&
      typeof staff.full_name === 'string' &&
      staff.full_name.trim() !== ''
    );
  }, [staffOptions]);

  const handleIndustryChange = (value: string) => {
    console.log('Industry change value:', value);
    if (value && value !== 'all') {
      if (onFilterChange) {
        onFilterChange('industry', value);
      } else {
        onFiltersChange({
          ...filters,
          industry: value
        });
      }
    } else {
      const { industry, ...rest } = filters;
      if (onFilterChange) {
        onFilterChange('industry', null);
      } else {
        onFiltersChange(rest);
      }
    }
  };

  const handleStatusChange = (value: string) => {
    console.log('Status change value:', value);
    if (value && value !== 'all' && (value === 'Active' || value === 'Inactive')) {
      if (onFilterChange) {
        onFilterChange('status', value as 'Active' | 'Inactive');
      } else {
        onFiltersChange({
          ...filters,
          status: value as 'Active' | 'Inactive'
        });
      }
    } else {
      const { status, ...rest } = filters;
      if (onFilterChange) {
        onFilterChange('status', null);
      } else {
        onFiltersChange(rest);
      }
    }
  };

  const handleStaffLiaisonChange = (value: string) => {
    console.log('Staff liaison change value:', value);
    if (value && value !== 'all') {
      if (onFilterChange) {
        onFilterChange('staffLiaisonId', value);
      } else {
        onFiltersChange({
          ...filters,
          staffLiaisonId: value
        });
      }
    } else {
      const { staffLiaisonId, ...rest } = filters;
      if (onFilterChange) {
        onFilterChange('staffLiaisonId', null);
      } else {
        onFiltersChange(rest);
      }
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

      {validStaffOptions.length > 0 && (
        <Select
          value={filters.staffLiaisonId || 'all'}
          onValueChange={handleStaffLiaisonChange}
          disabled={isStaffLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by staff liaison" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            {validStaffOptions.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

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
