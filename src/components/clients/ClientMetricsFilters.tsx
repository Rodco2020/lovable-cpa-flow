
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getStaffForLiaisonDropdown } from '@/services/client/staffLiaisonService';
import { ClientMetricsFilters } from '@/types/clientMetrics';

interface ClientMetricsFiltersProps {
  filters: ClientMetricsFilters;
  onFiltersChange: (filters: ClientMetricsFilters) => void;
  className?: string;
}

/**
 * Client Metrics Filters Component - Phase 1
 * 
 * Provides filtering controls for client dashboard metrics
 */
export const ClientMetricsFilters: React.FC<ClientMetricsFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch staff for liaison dropdown
  const { data: staffOptions = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff-liaison-dropdown'],
    queryFn: getStaffForLiaisonDropdown,
    staleTime: 10 * 60 * 1000, // 10 minutes cache for staff data
  });

  // Industry options (these could be fetched from database in future)
  const industryOptions = [
    'Retail', 'Healthcare', 'Manufacturing', 'Technology', 'Financial Services',
    'Professional Services', 'Construction', 'Hospitality', 'Education', 'Non-Profit', 'Other'
  ];

  const handleFilterChange = useCallback((key: keyof ClientMetricsFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const clearFilters = useCallback(() => {
    onFiltersChange({});
    setIsExpanded(false);
  }, [onFiltersChange]);

  const removeFilter = useCallback((key: keyof ClientMetricsFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(
    key => filters[key as keyof ClientMetricsFilters] != null
  ).length;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <Label className="text-sm font-medium">Filter Metrics</Label>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.staffLiaisonId && (
              <Badge variant="outline" className="text-xs">
                Staff: {staffOptions.find(s => s.id === filters.staffLiaisonId)?.full_name || 'Unknown'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => removeFilter('staffLiaisonId')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {filters.status && (
              <Badge variant="outline" className="text-xs">
                Status: {filters.status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => removeFilter('status')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
            {filters.industry && (
              <Badge variant="outline" className="text-xs">
                Industry: {filters.industry}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-3 w-3 p-0"
                  onClick={() => removeFilter('industry')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Filter Controls */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Staff Liaison Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Staff Liaison</Label>
              <Select
                value={filters.staffLiaisonId || ''}
                onValueChange={(value) => handleFilterChange('staffLiaisonId', value || null)}
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
                onValueChange={(value) => handleFilterChange('status', value || null)}
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
                onValueChange={(value) => handleFilterChange('industry', value || null)}
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
        )}
      </CardContent>
    </Card>
  );
};

export default ClientMetricsFilters;
