import React, { useState, useEffect, useCallback } from 'react';
import { getUnscheduledTaskInstances } from '@/services/taskService';
import { getAllClients } from '@/services/clientService';
import { TaskInstance } from '@/types/task';
import { Client } from '@/types/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BriefcaseBusiness, Clock, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSkillNames } from '@/hooks/useSkillNames';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DraggableTaskItem from './DraggableTaskItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { debounce } from '@/lib/utils';

interface UnscheduledTaskListProps {
  onTaskSelect: (task: TaskInstance) => void;
  tasksWithRecommendations?: string[];
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const UnscheduledTaskList: React.FC<UnscheduledTaskListProps> = ({
  onTaskSelect,
  tasksWithRecommendations = [],
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange
}) => {
  const [allTasks, setAllTasks] = useState<TaskInstance[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskInstance[]>([]);
  const [displayedTasks, setDisplayedTasks] = useState<TaskInstance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');
  
  // Extract all skill IDs from all tasks for the useSkillNames hook
  const allSkillIds = allTasks.flatMap(task => task.requiredSkills);
  const { skillsMap, isLoading: skillsLoading } = useSkillNames(allSkillIds);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const unscheduledTasks = await getUnscheduledTaskInstances();
      setAllTasks(unscheduledTasks);
      
      // Fetch clients to display names instead of IDs
      const clientsData = await getAllClients();
      setClients(clientsData);
      
      // Show success toast only if refreshing, not on initial load
      if (!loading) {
        toast({
          title: "Tasks refreshed successfully"
        });
      }
    } catch (error) {
      console.error('Error fetching unscheduled tasks:', error);
      setError("Failed to load unscheduled tasks. Please try again.");
      toast({
        title: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Apply filtering whenever filter criteria or tasks change
  useEffect(() => {
    const applyFilters = () => {
      let result = [...allTasks];
      
      // Apply search filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        result = result.filter(
          task => task.name.toLowerCase().includes(lowerSearch) || 
                 task.description?.toLowerCase().includes(lowerSearch)
        );
      }
      
      // Apply priority filter
      if (priorityFilter) {
        result = result.filter(task => task.priority === priorityFilter);
      }
      
      // Apply client filter
      if (clientFilter) {
        result = result.filter(task => task.clientId === clientFilter);
      }
      
      setFilteredTasks(result);
      
      // Calculate total pages
      const pages = Math.max(1, Math.ceil(result.length / pageSize));
      setTotalPages(pages);
    };
    
    applyFilters();
  }, [allTasks, searchTerm, priorityFilter, clientFilter, pageSize]);
  
  // Update displayed tasks when page or filtered tasks change
  useEffect(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedTasks(filteredTasks.slice(startIndex, endIndex));
    
  }, [filteredTasks, page, pageSize]);

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Helper function to get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.legalName : clientId;
  };
  
  // Helper function to get skill name by ID
  const getSkillName = (skillId: string): string => {
    return skillsMap[skillId]?.name || skillId;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Debounced search handler
  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
    if (onPageChange) onPageChange(1); // Reset to first page when searching
  }, 300);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
      if (onPageChange) onPageChange(1); // Reset to page 1 when changing page size
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('');
    setClientFilter('');
    if (onPageChange) onPageChange(1);
  };

  return (
    <div>
      <div className="mb-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search task name or description..."
              className="pl-8"
              onChange={(e) => debouncedSearch(e.target.value)}
              defaultValue={searchTerm}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Clients</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.legalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
            
            <Button
              variant="outline"
              onClick={fetchTasks}
              disabled={loading}
              className="flex items-center gap-1 w-full"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 5}).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {filteredTasks.length === 0 && allTasks.length > 0
              ? "No tasks match the current filters."
              : "No unscheduled tasks found."
            }
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Skills</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={
                    tasksWithRecommendations?.includes(task.id)
                      ? "bg-blue-50 hover:bg-blue-100"
                      : ""
                  }
                >
                  <TableCell className="font-medium">
                    <DraggableTaskItem
                      task={task}
                      getClientName={getClientName}
                      onClick={() => onTaskSelect(task)}
                    >
                      <div className="cursor-pointer hover:text-blue-700">
                        {task.name}
                        {tasksWithRecommendations?.includes(task.id) && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Recommended
                          </Badge>
                        )}
                      </div>
                    </DraggableTaskItem>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <BriefcaseBusiness className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                      {getClientName(task.clientId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No date'}
                  </TableCell>
                  <TableCell>{task.estimatedHours}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.requiredSkills && task.requiredSkills.length > 0 ? (
                        task.requiredSkills.map((skillId, index) => (
                          <Badge variant="outline" key={index}>
                            {skillsLoading ? '...' : getSkillName(skillId)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No skills required</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue>{pageSize}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              
              <span className="text-sm text-muted-foreground ml-4">
                Showing {filteredTasks.length > 0 ? ((page - 1) * pageSize) + 1 : 0}-
                {Math.min(page * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
              </span>
            </div>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(page - 1)}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                    />
                  </PaginationItem>
                  
                  {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                    // Show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      const middlePage = Math.min(Math.max(page, 3), totalPages - 2);
                      pageNum = middlePage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          onClick={() => handlePageChange(pageNum)}
                          isActive={page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(page + 1)}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UnscheduledTaskList;
