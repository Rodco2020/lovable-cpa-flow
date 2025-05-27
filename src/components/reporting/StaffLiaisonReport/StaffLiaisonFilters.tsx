
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReportFilters } from "@/types/reporting";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StaffLiaisonFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: Partial<ReportFilters>) => void;
  availableStaff: Array<{ id: string; full_name: string }>;
}

const TASK_TYPES = ['recurring', 'adhoc'];
const TASK_STATUSES = ['Unscheduled', 'Scheduled', 'In Progress', 'Completed', 'Canceled'];

export const StaffLiaisonFilters: React.FC<StaffLiaisonFiltersProps> = ({
  filters,
  onFiltersChange,
  availableStaff
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

  const handleTaskTypeToggle = (taskType: string) => {
    const updatedTypes = filters.taskTypes.includes(taskType)
      ? filters.taskTypes.filter(t => t !== taskType)
      : [...filters.taskTypes, taskType];
    
    onFiltersChange({ taskTypes: updatedTypes });
  };

  const handleStatusToggle = (status: string) => {
    const updatedStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ status: updatedStatuses });
  };

  const handleStaffLiaisonToggle = (staffId: string) => {
    const updatedStaff = filters.staffLiaisonIds.includes(staffId)
      ? filters.staffLiaisonIds.filter(id => id !== staffId)
      : [...filters.staffLiaisonIds, staffId];
    
    onFiltersChange({ staffLiaisonIds: updatedStaff });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      taskTypes: [],
      status: [],
      staffLiaisonIds: []
    });
  };

  const hasActiveFilters = 
    filters.taskTypes.length > 0 || 
    filters.status.length > 0 || 
    filters.staffLiaisonIds.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
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

        {/* Task Types */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Task Types</label>
          <div className="flex flex-wrap gap-2">
            {TASK_TYPES.map(taskType => (
              <Badge
                key={taskType}
                variant={filters.taskTypes.includes(taskType) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTaskTypeToggle(taskType)}
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
                onClick={() => handleStatusToggle(status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>

        {/* Staff Liaisons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Staff Liaisons</label>
          <div className="flex flex-wrap gap-2">
            {availableStaff.map(staff => (
              <Badge
                key={staff.id}
                variant={filters.staffLiaisonIds.includes(staff.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleStaffLiaisonToggle(staff.id)}
              >
                {staff.full_name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
