
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableRow, 
  TableBody, 
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCheck, 
  Filter, 
  CalendarClock, 
  Clock,
  AlertCircle,
  Loader2,
  Search,
  Check,
  CheckCircle,
  Pencil
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  RecurringTask, 
  TaskInstance, 
  RecurrencePattern 
} from '@/types/task';
import { Client } from '@/types/client';
import { 
  getClientRecurringTasks, 
  getClientAdHocTasks,
  getAllClients
} from '@/services/clientService';
import { EditRecurringTaskContainer } from './EditRecurringTaskContainer';

interface FormattedTask {
  id: string;
  clientId: string;
  clientName: string;
  taskName: string;
  taskType: 'Ad-hoc' | 'Recurring';
  dueDate: Date | null;
  recurrencePattern?: RecurrencePattern;
  estimatedHours: number;
  requiredSkills: string[];
  priority: string;
  status: string;
  isActive?: boolean;
}

const formatRecurrencePattern = (pattern: RecurrencePattern): string => {
  switch (pattern.type) {
    case 'Daily':
      return `Daily${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} days)` : ''}`;
    case 'Weekly':
      if (pattern.weekdays && pattern.weekdays.length > 0) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayNames = pattern.weekdays.map(day => days[day]);
        return `Weekly on ${weekdayNames.join(', ')}`;
      }
      return `Weekly${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} weeks)` : ''}`;
    case 'Monthly':
      return `Monthly on day ${pattern.dayOfMonth}${pattern.interval && pattern.interval > 1 ? ` (every ${pattern.interval} months)` : ''}`;
    case 'Quarterly':
      return `Quarterly${pattern.dayOfMonth ? ` on day ${pattern.dayOfMonth}` : ''}`;
    case 'Annually':
      return `Annually${pattern.monthOfYear ? ` in month ${pattern.monthOfYear}` : ''}${pattern.dayOfMonth ? `, day ${pattern.dayOfMonth}` : ''}`;
    case 'Custom':
      return `Custom (${pattern.customOffsetDays} days offset)`;
    default:
      return pattern.type;
  }
};

const ClientAssignedTasksOverview: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [formattedTasks, setFormattedTasks] = useState<FormattedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<FormattedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit task modal state
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Store all unique skills and priorities for filter options
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availablePriorities, setAvailablePriorities] = useState<string[]>([]);
  
  // Fetch clients and tasks
  useEffect(() => {
    const fetchClientsAndTasks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all clients first
        const fetchedClients = await getAllClients();
        setClients(fetchedClients);
        
        const allFormattedTasks: FormattedTask[] = [];
        const skills = new Set<string>();
        const priorities = new Set<string>();
        
        // Fetch tasks for each client
        for (const client of fetchedClients) {
          // Get recurring tasks
          const recurringTasks = await getClientRecurringTasks(client.id);
          
          // Format recurring tasks
          const formattedRecurringTasks: FormattedTask[] = recurringTasks.map(task => {
            // Add skills and priorities to sets for filter options
            task.requiredSkills.forEach(skill => skills.add(skill));
            priorities.add(task.priority);
            
            return {
              id: task.id,
              clientId: client.id,
              clientName: client.legalName,
              taskName: task.name,
              taskType: 'Recurring',
              dueDate: task.dueDate,
              recurrencePattern: task.recurrencePattern,
              estimatedHours: task.estimatedHours,
              requiredSkills: task.requiredSkills,
              priority: task.priority,
              status: task.status,
              isActive: task.isActive
            };
          });
          
          // Get ad-hoc tasks
          const adHocTasks = await getClientAdHocTasks(client.id);
          
          // Format ad-hoc tasks
          const formattedAdHocTasks: FormattedTask[] = adHocTasks.map(task => {
            // Add skills and priorities to sets for filter options
            task.requiredSkills.forEach(skill => skills.add(skill));
            priorities.add(task.priority);
            
            return {
              id: task.id,
              clientId: client.id,
              clientName: client.legalName,
              taskName: task.name,
              taskType: 'Ad-hoc',
              dueDate: task.dueDate,
              estimatedHours: task.estimatedHours,
              requiredSkills: task.requiredSkills,
              priority: task.priority,
              status: task.status
            };
          });
          
          // Add all tasks to the array
          allFormattedTasks.push(...formattedRecurringTasks, ...formattedAdHocTasks);
        }
        
        // Sort tasks by due date (ascending)
        allFormattedTasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        
        setFormattedTasks(allFormattedTasks);
        setFilteredTasks(allFormattedTasks);
        setAvailableSkills(Array.from(skills));
        setAvailablePriorities(Array.from(priorities));
        
        console.log('Loaded tasks:', allFormattedTasks.length);
      } catch (error) {
        console.error('Error fetching clients and tasks:', error);
        setError('Failed to load client tasks');
        toast({
          title: "Error",
          description: "There was an error loading client tasks",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientsAndTasks();
  }, [toast]);
  
  // Handle task edit
  const handleEditTask = (taskId: string, taskType: 'Ad-hoc' | 'Recurring') => {
    if (taskType === 'Recurring') {
      setSelectedTaskId(taskId);
      setEditTaskDialogOpen(true);
    } else {
      // For Ad-hoc tasks, you might want to implement a different flow or dialog
      // This is a placeholder for future implementation
      toast({
        title: "Info",
        description: "Editing ad-hoc tasks will be implemented in a future update",
      });
    }
  };
  
  // Handle task edit completion
  const handleEditComplete = () => {
    // Refresh the task list after edit
    setIsLoading(true);
    // Re-fetch clients and tasks
    const fetchClientsAndTasks = async () => {
      try {
        // Fetch all clients first
        const fetchedClients = await getAllClients();
        setClients(fetchedClients);
        
        const allFormattedTasks: FormattedTask[] = [];
        const skills = new Set<string>();
        const priorities = new Set<string>();
        
        // Fetch tasks for each client
        for (const client of fetchedClients) {
          // Get recurring tasks
          const recurringTasks = await getClientRecurringTasks(client.id);
          
          // Format recurring tasks
          const formattedRecurringTasks: FormattedTask[] = recurringTasks.map(task => {
            // Add skills and priorities to sets for filter options
            task.requiredSkills.forEach(skill => skills.add(skill));
            priorities.add(task.priority);
            
            return {
              id: task.id,
              clientId: client.id,
              clientName: client.legalName,
              taskName: task.name,
              taskType: 'Recurring',
              dueDate: task.dueDate,
              recurrencePattern: task.recurrencePattern,
              estimatedHours: task.estimatedHours,
              requiredSkills: task.requiredSkills,
              priority: task.priority,
              status: task.status,
              isActive: task.isActive
            };
          });
          
          // Get ad-hoc tasks
          const adHocTasks = await getClientAdHocTasks(client.id);
          
          // Format ad-hoc tasks
          const formattedAdHocTasks: FormattedTask[] = adHocTasks.map(task => {
            // Add skills and priorities to sets for filter options
            task.requiredSkills.forEach(skill => skills.add(skill));
            priorities.add(task.priority);
            
            return {
              id: task.id,
              clientId: client.id,
              clientName: client.legalName,
              taskName: task.name,
              taskType: 'Ad-hoc',
              dueDate: task.dueDate,
              estimatedHours: task.estimatedHours,
              requiredSkills: task.requiredSkills,
              priority: task.priority,
              status: task.status
            };
          });
          
          // Add all tasks to the array
          allFormattedTasks.push(...formattedRecurringTasks, ...formattedAdHocTasks);
        }
        
        // Sort tasks by due date (ascending)
        allFormattedTasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });
        
        setFormattedTasks(allFormattedTasks);
        setFilteredTasks(allFormattedTasks);
        setAvailableSkills(Array.from(skills));
        setAvailablePriorities(Array.from(priorities));
        
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } catch (error) {
        console.error('Error refreshing tasks:', error);
        toast({
          title: "Error",
          description: "Failed to refresh tasks after update",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientsAndTasks();
  };
  
  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...formattedTasks];
    
    // Filter by search term (task name, client name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.taskName.toLowerCase().includes(term) ||
        task.clientName.toLowerCase().includes(term)
      );
    }
    
    // Filter by tab (all, recurring, ad-hoc)
    if (activeTab === 'recurring') {
      filtered = filtered.filter(task => task.taskType === 'Recurring');
    } else if (activeTab === 'adhoc') {
      filtered = filtered.filter(task => task.taskType === 'Ad-hoc');
    }
    
    // Filter by client
    if (clientFilter !== 'all') {
      filtered = filtered.filter(task => task.clientId === clientFilter);
    }
    
    // Filter by skill
    if (skillFilter !== 'all') {
      filtered = filtered.filter(task => 
        task.requiredSkills.includes(skillFilter)
      );
    }
    
    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Filter by status (active/paused for recurring, or status for ad-hoc)
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(task => 
          (task.taskType === 'Recurring' && task.isActive === true) || 
          (task.taskType === 'Ad-hoc' && task.status !== 'Canceled')
        );
      } else if (statusFilter === 'paused') {
        filtered = filtered.filter(task => 
          (task.taskType === 'Recurring' && task.isActive === false) ||
          (task.taskType === 'Ad-hoc' && task.status === 'Canceled')
        );
      }
    }
    
    setFilteredTasks(filtered);
  }, [formattedTasks, searchTerm, activeTab, clientFilter, skillFilter, priorityFilter, statusFilter]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setClientFilter('all');
    setSkillFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
    setActiveTab('all');
  };
  
  // Format dates for display
  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Client-Assigned Tasks Overview</CardTitle>
            <CardDescription>View and manage all client tasks across your practice</CardDescription>
          </div>
          <div className="mt-2 md:mt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
                <TabsTrigger value="adhoc">Ad-hoc</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tasks or clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={clientFilter}
                onValueChange={setClientFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.legalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={skillFilter}
                onValueChange={setSkillFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {availableSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {availablePriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused/Canceled</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading tasks...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load tasks</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredTasks.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No tasks match your filters</AlertTitle>
              <AlertDescription>
                Try changing your filter criteria or {" "}
                <Button 
                  variant="link" 
                  onClick={resetFilters}
                  className="p-0 h-auto"
                >
                  reset all filters
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="hidden md:table-cell">Recurrence</TableHead>
                    <TableHead className="hidden md:table-cell">Est. Hours</TableHead>
                    <TableHead className="hidden md:table-cell">Required Skill</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={`${task.taskType}-${task.id}`}>
                      <TableCell>{task.clientName}</TableCell>
                      <TableCell>{task.taskName}</TableCell>
                      <TableCell>
                        <Badge variant={task.taskType === 'Recurring' ? 'default' : 'outline'}>
                          {task.taskType}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {task.taskType === 'Recurring' && task.recurrencePattern ? (
                          <span className="text-xs text-muted-foreground">
                            {formatRecurrencePattern(task.recurrencePattern)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          {task.estimatedHours}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {task.requiredSkills.map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            task.priority === 'High' || task.priority === 'Urgent' 
                              ? 'bg-red-500'
                              : task.priority === 'Medium'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.taskType === 'Recurring' ? (
                          <Badge 
                            variant={task.isActive ? 'default' : 'secondary'}
                            className={task.isActive ? 'bg-green-500' : ''}
                          >
                            {task.isActive ? 'Active' : 'Paused'}
                          </Badge>
                        ) : (
                          <Badge 
                            variant={task.status === 'Canceled' ? 'secondary' : 'default'}
                            className={
                              task.status === 'Completed' ? 'bg-green-500' :
                              task.status === 'In Progress' ? 'bg-blue-500' :
                              task.status === 'Scheduled' ? 'bg-purple-500' :
                              task.status === 'Unscheduled' ? 'bg-amber-500' :
                              ''
                            }
                          >
                            {task.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTask(task.id, task.taskType)}
                          title={`Edit ${task.taskType} Task`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Summary stats */}
          {!isLoading && !error && filteredTasks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTasks.length} of {formattedTasks.length} total tasks
              </div>
              <div className="ml-auto flex flex-wrap gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CalendarClock className="h-3 w-3" /> 
                  Recurring: {formattedTasks.filter(t => t.taskType === 'Recurring').length}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileCheck className="h-3 w-3" /> 
                  Ad-hoc: {formattedTasks.filter(t => t.taskType === 'Ad-hoc').length}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> 
                  Active: {formattedTasks.filter(t => 
                    (t.taskType === 'Recurring' && t.isActive === true) || 
                    (t.taskType === 'Ad-hoc' && t.status !== 'Canceled')
                  ).length}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Task Dialog */}
      <EditRecurringTaskContainer
        open={editTaskDialogOpen}
        onOpenChange={setEditTaskDialogOpen}
        taskId={selectedTaskId}
        onSaveComplete={handleEditComplete}
      />
    </Card>
  );
};

export default ClientAssignedTasksOverview;
