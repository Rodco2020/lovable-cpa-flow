
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterToggleHeaderProps {
  activeFilterCount: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onClearFilters: () => void;
}

/**
 * Filter Toggle Header Component
 * 
 * Displays the filter header with expand/collapse controls and clear all button
 */
export const FilterToggleHeader: React.FC<FilterToggleHeaderProps> = ({
  activeFilterCount,
  isExpanded,
  onToggleExpanded,
  onClearFilters,
}) => {
  return (
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
            onClick={onClearFilters}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleExpanded}
          className="text-xs"
        >
          {isExpanded ? 'Hide' : 'Show'} Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterToggleHeader;
