
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Filter, RotateCcw, FileText, CheckCircle2, ArrowUpDown, X } from 'lucide-react';
import { TaskFilterOption } from '../types';

interface EnhancedTaskFilterPanelProps {
  activeFilter: TaskFilterOption;
  setActiveFilter: (filter: TaskFilterOption) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  sortBy: 'name' | 'priority' | 'estimatedHours' | 'dueDate';
  setSortBy: (sort: 'name' | 'priority' | 'estimatedHours' | 'dueDate') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  recurringTasksCount: number;
  adHocTasksCount: number;
  selectedCount: number;
  totalCount: number;
  availableCategories: string[];
  availablePriorities: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClearFilters: () => void;
}

export const EnhancedTaskFilterPanel: React.FC<EnhancedTaskFilterPanelProps> = ({
  activeFilter,
  setActiveFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  recurringTasksCount,
  adHocTasksCount,
  selectedCount,
  totalCount,
  availableCategories,
  availablePriorities,
  onSelectAll,
  onDeselectAll,
  onClearFilters
}) => {
  const hasActiveFilters = categoryFilter || priorityFilter || activeFilter !== 'all';

  const getSortLabel = () => {
    const labels = {
      name: 'Name',
      priority: 'Priority',
      estimatedHours: 'Hours',
      dueDate: 'Due Date'
    };
    return labels[sortBy];
  };

  return (
    <div className="space-y-4">
      {/* Filter Type Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('all')}
          className="flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>All ({recurringTasksCount + adHocTasksCount})</span>
        </Button>
        <Button
          variant={activeFilter === 'recurring' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('recurring')}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Recurring ({recurringTasksCount})</span>
        </Button>
        <Button
          variant={activeFilter === 'adhoc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveFilter('adhoc')}
          className="flex items-center space-x-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Ad-hoc ({adHocTasksCount})</span>
        </Button>
      </div>

      {/* Advanced Filters and Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            {availablePriorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4" />
              <span>Sort: {getSortLabel()}</span>
              <span className="text-xs">({sortOrder === 'asc' ? '↑' : '↓'})</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('name')}>
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('priority')}>
              Priority {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('estimatedHours')}>
              Hours {sortBy === 'estimatedHours' && (sortOrder === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('dueDate')}>
              Due Date {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              Reverse Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center space-x-2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        )}
      </div>

      {/* Selection Summary and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedCount} of {totalCount} selected
          </Badge>
          {selectedCount > 0 && (
            <Badge variant="outline" className="text-green-600">
              {selectedCount} task{selectedCount !== 1 ? 's' : ''} to copy
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onSelectAll} disabled={totalCount === 0}>
            Select All ({totalCount})
          </Button>
          <Button variant="outline" size="sm" onClick={onDeselectAll} disabled={selectedCount === 0}>
            Deselect All
          </Button>
        </div>
      </div>
    </div>
  );
};
