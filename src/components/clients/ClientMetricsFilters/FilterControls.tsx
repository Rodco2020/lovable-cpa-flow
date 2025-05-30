
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientMetricsFilters } from '@/types/clientMetrics';
import { StaffOption } from '@/types/staffOption';

interface FilterControlsProps {
  filters: ClientMetricsFilters;
  staffOptions: StaffOption[];
  isStaffLoading: boolean;
  onFilterChange: (key: keyof ClientMetricsFilters, value: any) => void;
}

/**
 * Filter Controls Component
 * 
 * Renders the individual filter form controls
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  staffOptions,
  isStaffLoading,
  onFilterChange,
}) => {
  // Industry options (these could be fetched from database in future)
  const industryOptions = [
    'Retail', 'Healthcare', 'Manufacturing', 'Technology', 'Financial Services',
    'Professional Services', 'Construction', 'Hospitality', 'Education', 'Non-Profit', 'Other'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Staff Liaison Filter */}
      <div className="space-y-2">
        <Label className="text-xs">Staff Liaison</Label>
        <Select
          value={filters.staffLiaisonId || ''}
          onValueChange={(value) => onFilterChange('staffLiaisonId', value || null)}
          disabled={isStaffLoading}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="All Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Staff</SelectItem>
            {staffOptions.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-xs">Status</Label>
        <Select
          value={filters.status || ''}
          onValueChange={(value) => onFilterChange('status', value || null)}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Industry Filter */}
      <div className="space-y-2">
        <Label className="text-xs">Industry</Label>
        <Select
          value={filters.industry || ''}
          onValueChange={(value) => onFilterChange('industry', value || null)}
        >
          <SelectTrigger className="text-xs">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Industries</SelectItem>
            {industryOptions.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterControls;
