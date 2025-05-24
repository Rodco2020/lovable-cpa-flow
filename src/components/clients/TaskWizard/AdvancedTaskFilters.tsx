
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';
import { AdvancedTaskFilter } from './types';

interface AdvancedTaskFiltersProps {
  filters: AdvancedTaskFilter;
  onFiltersChange: (filters: AdvancedTaskFilter) => void;
  availableCategories: string[];
  availableSkills: string[];
  onReset: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const AdvancedTaskFilters: React.FC<AdvancedTaskFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories,
  availableSkills,
  onReset,
  isExpanded,
  onToggleExpanded
}) => {
  const updateFilter = (key: keyof AdvancedTaskFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const removeFilter = (key: keyof AdvancedTaskFilter) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => 
      filters[key as keyof AdvancedTaskFilter] !== undefined
    ).length;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Reset
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
              {filters.category && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Category: {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('category')}
                  />
                </Badge>
              )}
              {filters.priority && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Priority: {filters.priority}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('priority')}
                  />
                </Badge>
              )}
              {filters.skillRequired && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Skill: {filters.skillRequired}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('skillRequired')}
                  />
                </Badge>
              )}
              {filters.estimatedHoursRange && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Hours: {filters.estimatedHoursRange[0]}-{filters.estimatedHoursRange[1]}h
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('estimatedHoursRange')}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => updateFilter('category', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => updateFilter('priority', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skill Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Skill</label>
              <Select
                value={filters.skillRequired || ''}
                onValueChange={(value) => updateFilter('skillRequired', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Skills</SelectItem>
                  {availableSkills.map(skill => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Hours Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Estimated Hours: {filters.estimatedHoursRange?.[0] || 0}h - {filters.estimatedHoursRange?.[1] || 40}h
              </label>
              <Slider
                value={filters.estimatedHoursRange || [0, 40]}
                onValueChange={(value) => updateFilter('estimatedHoursRange', value as [number, number])}
                max={40}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
