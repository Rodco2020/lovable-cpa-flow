
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface AdvancedFiltersHeaderProps {
  activeFilterCount: number;
  skillsCount: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onClearAllFilters: () => void;
}

/**
 * Advanced Filters Header Component
 * Contains the title, badges, and expansion controls
 */
export const AdvancedFiltersHeader: React.FC<AdvancedFiltersHeaderProps> = ({
  activeFilterCount,
  skillsCount,
  isExpanded,
  onToggleExpanded,
  onClearAllFilters
}) => {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg flex items-center gap-2">
        <Filter className="h-5 w-5" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary">{activeFilterCount}</Badge>
        )}
        {/* Debug badge showing skills count */}
        <Badge variant="outline" className="text-xs">
          {skillsCount} skills
        </Badge>
      </CardTitle>
      <div className="flex items-center gap-2">
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={onClearAllFilters}>
            Clear All
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
    </div>
  );
};
