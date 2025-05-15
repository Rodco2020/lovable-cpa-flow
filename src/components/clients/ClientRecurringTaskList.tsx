
import React, { useState, useEffect } from 'react';
import { RecurringTask } from '@/types/task';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, 
  Clock, 
  CalendarClock, 
  Filter, 
  ArrowUpDown,
  Check,
  ChevronDown
} from 'lucide-react';
import TaskListPagination from './TaskListPagination';

interface ClientRecurringTaskListProps {
  tasks: RecurringTask[];
  onViewTask?: (taskId: string) => void;
}

const ITEMS_PER_PAGE = 5;

const ClientRecurringTaskList: React.FC<ClientRecurringTaskListProps> = ({
  tasks,
  onViewTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'hours'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Advanced filtering
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, skillFilter, activeFilter]);
  
  // Extract unique categories from tasks
  const uniqueCategories = Array.from(
    new Set(tasks.map(task => task.category))
  ).sort();
  
  // Extract unique skills from tasks
  const uniqueSkills = Array.from(
    new Set(tasks.flatMap(task => task.requiredSkills))
  ).sort();

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Text search
    const matchesSearch = 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = 
      categoryFilter.length === 0 || categoryFilter.includes(task.category);
    
    // Skill filter
    const matchesSkill = 
      skillFilter.length === 0 || 
      task.requiredSkills.some(skill => skillFilter.includes(skill));
    
    // Active status filter
    const matchesActive =
      activeFilter === null || task.isActive === activeFilter;
    
    return matchesSearch && matchesCategory && matchesSkill && matchesActive;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'Low': 0, 'Medium': 1, 'High': 2, 'Urgent': 3 };
      return sortOrder === 'asc'
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'hours') {
      return sortOrder === 'asc'
        ? a.estimatedHours - b.estimatedHours
        : b.estimatedHours - a.estimatedHours;
    }
    return 0;
  });

  // Paginate tasks
  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / ITEMS_PER_PAGE));
  
  // Adjust current page if we have fewer pages than the current page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  // Toggle sort direction
  const toggleSort = (field: 'name' | 'priority' | 'hours') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Format recurrence pattern for display
  const formatRecurrencePattern = (task: RecurringTask): string => {
    const pattern = task.recurrencePattern;
    switch (pattern.type) {
      case 'Daily':
        return `Daily${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} days)` : ''}`;
      case 'Weekly':
        if (pattern.weekdays && pattern.weekdays.length) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return `Weekly on ${pattern.weekdays.map(d => days[d]).join(', ')}`;
        }
        return `Weekly${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} weeks)` : ''}`;
      case 'Monthly':
        return `Monthly on day ${pattern.dayOfMonth || 1}${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} months)` : ''}`;
      case 'Quarterly':
        return 'Quarterly';
      case 'Annually':
        return 'Annually';
      case 'Custom':
        return 'Custom schedule';
      default:
        return 'Unknown schedule';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Low': return 'outline';
      case 'Medium': return 'secondary';
      case 'High': return 'default';
      case 'Urgent': return 'destructive';
      default: return 'default';
    }
  };
  
  // Count active filters
  const activeFiltersCount = [
    categoryFilter.length > 0,
    skillFilter.length > 0,
    activeFilter !== null,
  ].filter(Boolean).length;
  
  // Get status badge for active/inactive
  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : ""}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  // Render empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-muted/20">
        <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
        <h3 className="font-medium">No Recurring Tasks</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This client doesn't have any recurring tasks set up yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 py-0 h-5 min-w-5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                {/* Category filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={categoryFilter.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCategoryFilter([...categoryFilter, category]);
                            } else {
                              setCategoryFilter(categoryFilter.filter(c => c !== category));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="text-sm"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Skills filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Required Skills</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueSkills.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`skill-${skill}`}
                          checked={skillFilter.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSkillFilter([...skillFilter, skill]);
                            } else {
                              setSkillFilter(skillFilter.filter(s => s !== skill));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`skill-${skill}`}
                          className="text-sm"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Active status filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status</h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={activeFilter === true ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setActiveFilter(activeFilter === true ? null : true)}
                    >
                      Active
                    </Button>
                    <Button
                      size="sm"
                      variant={activeFilter === false ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setActiveFilter(activeFilter === false ? null : false)}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
                
                {/* Clear filters */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => {
                    setCategoryFilter([]);
                    setSkillFilter([]);
                    setActiveFilter(null);
                  }}
                  disabled={activeFiltersCount === 0}
                >
                  Clear all filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
            </Button>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">No tasks match your search criteria</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer w-[30%]"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      Task Name
                      {sortBy === 'name' && (
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('priority')}
                  >
                    <div className="flex items-center">
                      Priority
                      {sortBy === 'priority' && (
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => toggleSort('hours')}
                  >
                    <div className="flex items-center justify-end">
                      Hours
                      {sortBy === 'hours' && (
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    className={onViewTask ? "cursor-pointer hover:bg-muted" : ""}
                    onClick={() => onViewTask && onViewTask(task.id)}
                  >
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell className="flex items-center">
                      <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                      {formatRecurrencePattern(task)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="bg-slate-100 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(task.isActive)}
                    </TableCell>
                    <TableCell className="text-right">{task.estimatedHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(filteredTasks.length, currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE + 1)}-
              {Math.min(filteredTasks.length, currentPage * ITEMS_PER_PAGE)} of {filteredTasks.length} tasks
            </div>
            <TaskListPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ClientRecurringTaskList;
