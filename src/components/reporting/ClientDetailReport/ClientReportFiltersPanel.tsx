
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ClientReportFilters } from "@/types/clientReporting";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientReportFiltersPanelProps {
  filters: ClientReportFilters;
  onFiltersChange: (filters: Partial<ClientReportFilters>) => void;
}

const TASK_TYPES = ['recurring', 'adhoc'];
const TASK_STATUSES = ['Unscheduled', 'Scheduled', 'In Progress', 'Completed', 'Canceled'];
const TASK_CATEGORIES = ['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other'];

export const ClientReportFiltersPanel: React.FC<ClientReportFiltersPanelProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    if (date) {
      onFiltersChange({
        dateRange: {
          ...filters.dateRange,
          [field]: date
        }
      });
    }
  };

  const handleArrayToggle = (field: keyof ClientReportFilters, value: string) => {
    const currentArray = filters[field] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    onFiltersChange({ [field]: updatedArray });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      taskTypes: [],
      status: [],
      categories: [],
      includeCompleted: true
    });
  };

  const hasActiveFilters = 
    filters.taskTypes.length > 0 || 
    filters.status.length > 0 || 
    filters.categories.length > 0 ||
    !filters.includeCompleted;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Report Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => handleDateRangeChange('from', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground">to</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !filters.dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => handleDateRangeChange('to', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Include Completed Tasks */}
        <div className="flex items-center space-x-2">
          <Switch
            id="include-completed"
            checked={filters.includeCompleted}
            onCheckedChange={(checked) => onFiltersChange({ includeCompleted: checked })}
          />
          <Label htmlFor="include-completed">Include completed tasks</Label>
        </div>

        {/* Task Types */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Types</label>
          <div className="flex flex-wrap gap-2">
            {TASK_TYPES.map(taskType => (
              <Badge
                key={taskType}
                variant={filters.taskTypes.includes(taskType) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleArrayToggle('taskTypes', taskType)}
              >
                {taskType}
              </Badge>
            ))}
          </div>
        </div>

        {/* Task Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Status</label>
          <div className="flex flex-wrap gap-2">
            {TASK_STATUSES.map(status => (
              <Badge
                key={status}
                variant={filters.status.includes(status) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleArrayToggle('status', status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>

        {/* Task Categories */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categories</label>
          <div className="flex flex-wrap gap-2">
            {TASK_CATEGORIES.map(category => (
              <Badge
                key={category}
                variant={filters.categories.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleArrayToggle('categories', category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
