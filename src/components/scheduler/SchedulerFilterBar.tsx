
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SchedulerFilterBarProps {
  onDateChange?: (date: Date) => void;
  onSearchChange?: (search: string) => void;
  onFilterChange?: (filter: string) => void;
  selectedDate: Date;
  searchQuery: string;
  filterValue: string;
}

const SchedulerFilterBar: React.FC<SchedulerFilterBarProps> = ({
  onDateChange = () => {},
  onSearchChange = () => {},
  onFilterChange = () => {},
  selectedDate,
  searchQuery,
  filterValue,
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal w-[210px]",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
          />
        </PopoverContent>
      </Popover>

      <Select value={filterValue} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            <span>
              {filterValue === "all" ? "All Priorities" : 
               filterValue === "high" ? "High Priority" :
               filterValue === "medium" ? "Medium Priority" :
               filterValue === "low" ? "Low Priority" : "Filter"}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High Priority</SelectItem>
          <SelectItem value="medium">Medium Priority</SelectItem>
          <SelectItem value="low">Low Priority</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SchedulerFilterBar;
