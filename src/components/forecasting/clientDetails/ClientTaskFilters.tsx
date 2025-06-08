
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';

interface FilterState {
  dateRange: { start: Date; end: Date } | null;
  status: string[];
  skills: string[];
  categories: string[];
  priorities: string[];
  taskType: 'all' | 'recurring' | 'instances';
}

interface ClientTaskFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableSkills?: string[];
  availableCategories?: string[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const TASK_STATUSES = ['Active', 'Inactive', 'Completed', 'In Progress', 'Unscheduled'];
const TASK_PRIORITIES = ['High', 'Medium', 'Low'];
const DEFAULT_SKILLS = ['Junior', 'Senior', 'CPA', 'Tax', 'Audit', 'Advisory'];
const DEFAULT_CATEGORIES = ['Tax Preparation', 'Audit', 'Bookkeeping', 'Advisory', 'Compliance'];

const ClientTaskFilters: React.FC<ClientTaskFiltersProps> = ({
  filters,
  onFiltersChange,
  availableSkills = DEFAULT_SKILLS,
  availableCategories = DEFAULT_CATEGORIES,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleArrayFilter = (
    key: 'status' | 'skills' | 'categories' | 'priorities',
    value: string
  ) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters({ [key]: newArray });
  };

  const setDateRange = (range: 'month' | 'quarter' | 'custom', customRange?: { start: Date; end: Date }) => {
    let dateRange: { start: Date; end: Date };

    switch (range) {
      case 'month':
        dateRange = {
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date())
        };
        break;
      case 'quarter':
        const now = new Date();
        dateRange = {
          start: startOfMonth(now),
          end: endOfMonth(addMonths(now, 2))
        };
        break;
      case 'custom':
        if (!customRange) return;
        dateRange = customRange;
        break;
      default:
        return;
    }

    updateFilters({ dateRange });
  };

  const clearAllFilters = () => {
    updateFilters({
      dateRange: null,
      status: [],
      skills: [],
      categories: [],
      priorities: [],
      taskType: 'all'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange) count++;
    if (filters.status.length) count++;
    if (filters.skills.length) count++;
    if (filters.categories.length) count++;
    if (filters.priorities.length) count++;
    if (filters.taskType !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  if (isCollapsed) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Task Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-8"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Date Range</h4>
            {filters.dateRange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ dateRange: null })}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange('month')}
              className="h-8"
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange('quarter')}
              className="h-8"
            >
              Next 3 Months
            </Button>
            
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="text-sm font-medium mb-2">Select Date Range</div>
                  <Calendar
                    mode="range"
                    selected={filters.dateRange ? {
                      from: filters.dateRange.start,
                      to: filters.dateRange.end
                    } : undefined}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange('custom', { start: range.from, end: range.to });
                        setDatePickerOpen(false);
                      }
                    }}
                    className="pointer-events-auto"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {filters.dateRange && (
            <div className="text-xs text-muted-foreground">
              {format(filters.dateRange.start, 'MMM d, yyyy')} - {format(filters.dateRange.end, 'MMM d, yyyy')}
            </div>
          )}
        </div>

        <Separator />

        {/* Task Type Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Task Type</h4>
          <Select 
            value={filters.taskType} 
            onValueChange={(value: 'all' | 'recurring' | 'instances') => 
              updateFilters({ taskType: value })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="recurring">Recurring Tasks Only</SelectItem>
              <SelectItem value="instances">Task Instances Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Status</h4>
            {filters.status.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.status.length}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TASK_STATUSES.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => toggleArrayFilter('status', status)}
                />
                <label 
                  htmlFor={`status-${status}`}
                  className="text-sm cursor-pointer"
                >
                  {status}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Skills Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Skills Required</h4>
            {filters.skills.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.skills.length}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableSkills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={filters.skills.includes(skill)}
                  onCheckedChange={() => toggleArrayFilter('skills', skill)}
                />
                <label 
                  htmlFor={`skill-${skill}`}
                  className="text-sm cursor-pointer"
                >
                  {skill}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Category Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Categories</h4>
            {filters.categories.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.categories.length}
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => toggleArrayFilter('categories', category)}
                />
                <label 
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Priority Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Priority</h4>
            {filters.priorities.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.priorities.length}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {TASK_PRIORITIES.map((priority) => (
              <div key={priority} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={filters.priorities.includes(priority)}
                  onCheckedChange={() => toggleArrayFilter('priorities', priority)}
                />
                <label 
                  htmlFor={`priority-${priority}`}
                  className="text-sm cursor-pointer"
                >
                  {priority}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientTaskFilters;
