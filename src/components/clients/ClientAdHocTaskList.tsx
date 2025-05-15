
import React, { useState, useEffect } from 'react';
import { TaskInstance, TaskStatus } from '@/types/task';
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
  ClipboardList, 
  Filter, 
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import TaskListPagination from './TaskListPagination';

interface ClientAdHocTaskListProps {
  tasks: TaskInstance[];
  onViewTask?: (taskId: string) => void;
}

const ITEMS_PER_PAGE = 5;

const ClientAdHocTaskList: React.FC<ClientAdHocTaskListProps> = ({
  tasks,
  onViewTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'dueDate' | 'status' | 'priority' | 'hours'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Advanced filtering
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [dueDateFilter, setDueDateFilter] = useState<'past' | 'today' | 'upcoming' | 'all'>('all');
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, skillFilter, dueDateFilter]);
  
  // Extract unique categories from tasks
  const uniqueCategories = Array.from(
    new Set(tasks.map(task => task.category))
  ).sort();
  
  // Extract unique skills from tasks
  const uniqueSkills = Array.from(
    new Set(tasks.flatMap(task => task.requiredSkills))
  ).sort();
  
  // Extract unique statuses from tasks
  const uniqueStatuses = Array.from(
    new Set(tasks.map(task => task.status))
  ) as TaskStatus[];

  // Due date filter function
  const taskMatchesDueDateFilter = (task: TaskInstance): boolean => {
    if (!task.dueDate || dueDateFilter === 'all') return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (dueDateFilter) {
      case 'past':
        return dueDate < today;
      case 'today':
        return dueDate.getTime() === today.getTime();
      case 'upcoming':
        return dueDate >= tomorrow;
      default:
        return true;
    }
  };

  // Filter tasks by all criteria
  const filteredTasks = tasks.filter(task => {
    // Text search
    const matchesSearch = 
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    // Category filter
    const matchesCategory = 
      categoryFilter.length === 0 || categoryFilter.includes(task.category);
    
    // Skill filter
    const matchesSkill = 
      skillFilter.length === 0 || 
      task.requiredSkills.some(skill => skillFilter.includes(skill));
    
    // Due date filter
    const matchesDueDate = taskMatchesDueDateFilter(task);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesSkill && matchesDueDate;
  });
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'dueDate') {
      // Handle null due dates
      if (!a.dueDate) return sortOrder === 'asc' ? 1 : -1;
      if (!b.dueDate) return sortOrder === 'asc' ? -1 : 1;
      
      return sortOrder === 'asc' 
        ? a.dueDate.getTime() - b.dueDate.getTime() 
        : b.dueDate.getTime() - a.dueDate.getTime();
    } else if (sortBy === 'status') {
      const statusOrder = { 
        'Unscheduled': 0, 
        'Scheduled': 1, 
        'In Progress': 2, 
        'Completed': 3, 
        'Canceled': 4 
      };
      return sortOrder === 'asc'
        ? statusOrder[a.status] - statusOrder[b.status]
        : statusOrder[b.status] - statusOrder[a.status];
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

  // Pagination
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
  const toggleSort = (field: 'name' | 'dueDate' | 'status' | 'priority' | 'hours') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case 'Unscheduled': return 'outline';
      case 'Scheduled': return 'secondary';
      case 'In Progress': return 'default';
      case 'Completed': return { variant: 'outline', className: 'bg-green-100 text-green-800 hover:bg-green-200' };
      case 'Canceled': return 'destructive';
      default: return 'default';
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

  // Format date function
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Not set';
    return format(date, 'MMM d, yyyy');
  };
  
  // Count active filters
  const activeFiltersCount = [
    categoryFilter.length > 0,
    skillFilter.length > 0,
    dueDateFilter !== 'all',
    statusFilter !== 'all'
  ].filter(Boolean).length;

  // Render empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-muted/20">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
        <h3 className="font-medium">No Ad-hoc Tasks</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This client doesn't have any ad-hoc tasks assigned.
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
                {/* Status filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Status</h4>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {uniqueStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Due Date filter */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Due Date</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={dueDateFilter === 'past' ? "default" : "outline"}
                      onClick={() => setDueDateFilter(dueDateFilter === 'past' ? 'all' : 'past')}
                      className="w-full"
                    >
                      Past Due
                    </Button>
                    <Button
                      size="sm"
                      variant={dueDateFilter === 'today' ? "default" : "outline"}
                      onClick={() => setDueDateFilter(dueDateFilter === 'today' ? 'all' : 'today')}
                      className="w-full"
                    >
                      Due Today
                    </Button>
                    <Button
                      size="sm"
                      variant={dueDateFilter === 'upcoming' ? "default" : "outline"}
                      onClick={() => setDueDateFilter(dueDateFilter === 'upcoming' ? 'all' : 'upcoming')}
                      className="w-full"
                      // Removed the colSpan={2} prop since it's not valid for Button
                      // Instead, use a grid layout with CSS styling to span multiple columns
                      style={{ gridColumn: "span 2" }}
                    >
                      Upcoming
                    </Button>
                  </div>
                </div>
                
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
                
                {/* Clear filters */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter([]);
                    setSkillFilter([]);
                    setDueDateFilter('all');
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
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
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
                    className="cursor-pointer w-[25%]"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center">
                      Task Name
                      {sortBy === 'name' && (
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('dueDate')}
                  >
                    <div className="flex items-center">
                      Due Date
                      {sortBy === 'dueDate' && (
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => toggleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (
                        <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
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
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
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
                      {typeof getStatusBadgeVariant(task.status) === 'string' ? (
                        <Badge variant={getStatusBadgeVariant(task.status) as any}>
                          {task.status}
                        </Badge>
                      ) : (
                        <Badge 
                          variant={(getStatusBadgeVariant(task.status) as any).variant}
                          className={(getStatusBadgeVariant(task.status) as any).className}
                        >
                          {task.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
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

export default ClientAdHocTaskList;
