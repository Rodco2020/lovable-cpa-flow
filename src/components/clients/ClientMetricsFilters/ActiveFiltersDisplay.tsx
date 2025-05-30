
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ClientMetricsFilters } from '@/types/clientMetrics';
import { StaffOption } from '@/types/staffOption';

interface ActiveFiltersDisplayProps {
  filters: ClientMetricsFilters;
  staffOptions: StaffOption[];
  activeFilterCount: number;
  onRemoveFilter: (key: keyof ClientMetricsFilters) => void;
}

/**
 * Active Filters Display Component
 * 
 * Shows active filter badges with remove buttons
 */
export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  filters,
  staffOptions,
  activeFilterCount,
  onRemoveFilter,
}) => {
  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.staffLiaisonId && (
        <Badge variant="outline" className="text-xs">
          Staff: {staffOptions.find(s => s.id === filters.staffLiaisonId)?.full_name || 'Unknown'}
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-3 w-3 p-0"
            onClick={() => onRemoveFilter('staffLiaisonId')}
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
            onClick={() => onRemoveFilter('status')}
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
            onClick={() => onRemoveFilter('industry')}
          >
            <X className="h-2 w-2" />
          </Button>
        </Badge>
      )}
    </div>
  );
};

export default ActiveFiltersDisplay;
