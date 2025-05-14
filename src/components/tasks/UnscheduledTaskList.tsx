import React, { useState, useEffect } from 'react';
import { 
  TaskInstance, 
  SkillType, 
  TaskPriority,
  TaskCategory 
} from '@/types/task';
import { getUnscheduledTaskInstances, updateTaskInstance } from '@/services/taskService';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { 
  Filter, 
  Clock, 
  Calendar, 
  Search,
  ArrowUpDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';

const UnscheduledTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TaskInstance | '',
    direction: 'ascending' | 'descending'
  }>({
    key: 'dueDate',
    direction: 'ascending'
  });
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Load tasks when component mounts
  useEffect(() => {
    refreshTasks();
  }, []);
  
  const refreshTasks = () => {
    const unscheduledTasks = getUnscheduledTaskInstances();
    setTasks(unscheduledTasks);
  };
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle sorting logic
  const requestSort = (key: keyof TaskInstance) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Apply sorting, filtering and search
  const sortedAndFilteredTasks = React.useMemo(() => {
    let processedTasks = [...tasks];
    
    // Apply search
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      processedTasks = processedTasks.filter(task => 
        task.name.toLowerCase().includes(lowerCaseSearch) || 
        task.description.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Apply skill filter
    if (filterSkill) {
      processedTasks = processedTasks.filter(task => 
        task.requiredSkills.includes(filterSkill as SkillType)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      processedTasks.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof TaskInstance];
        const bValue = b[sortConfig.key as keyof TaskInstance];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Handle dates specially
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'ascending' 
            ? aValue.getTime() - bValue.getTime() 
            : bValue.getTime() - aValue.getTime();
        }
        
        // Handle strings and other types
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    
    return processedTasks;
  }, [tasks, searchTerm, filterSkill, sortConfig]);
  
  // Handle task selection for editing
  const handleSelectTask = (task: TaskInstance) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };
  
  // Handle task update
  const handleUpdateTask = (updates: Partial<TaskInstance>) => {
    if (!selectedTask) return;
    
    const updated = updateTaskInstance(selectedTask.id, updates);
    if (updated) {
      toast({
        title: "Task Updated",
        description: "The task has been updated successfully.",
      });
      setIsDialogOpen(false);
      refreshTasks();
    } else {
      toast({
        title: "Error",
        description: "Could not update task.",
        variant: "destructive",
      });
    }
  };

  // Available skills for filtering
  const availableSkills: SkillType[] = ["Junior", "Senior", "CPA", "Tax Specialist", "Audit", "Advisory"];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Unscheduled Tasks</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-56"
            />
          </div>
          
          <select
            value={filterSkill || 'all'}
            onChange={(e) => setFilterSkill(e.target.value === 'all' ? null : e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Skills</option>
            {availableSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={refreshTasks}
            title="Refresh Tasks"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('name')}
            >
              Task Name
              {sortConfig.key === 'name' && (
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              )}
            </TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Required Skills</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('estimatedHours')}
            >
              Est. Hours
              {sortConfig.key === 'estimatedHours' && (
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('priority')}
            >
              Priority
              {sortConfig.key === 'priority' && (
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              )}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('dueDate')}
            >
              Due Date
              {sortConfig.key === 'dueDate' && (
                <ArrowUpDown className="inline ml-1 h-4 w-4" />
              )}
            </TableHead>
            <TableHead>Category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAndFilteredTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No unscheduled tasks found.
              </TableCell>
            </TableRow>
          ) : (
            sortedAndFilteredTasks.map(task => (
              <TableRow 
                key={task.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelectTask(task)}
              >
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>{task.clientId}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {task.requiredSkills.map(skill => (
                      <span 
                        key={skill} 
                        className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{task.estimatedHours}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    task.priority === 'Low' ? 'bg-green-100 text-green-800' :
                    task.priority === 'Medium' ? 'bg-blue-100 text-blue-800' :
                    task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {task.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(task.dueDate)}
                  </div>
                </TableCell>
                <TableCell>{task.category}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {selectedTask && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Task Name</h3>
                  <p>{selectedTask.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Client ID</h3>
                  <p>{selectedTask.clientId}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Description</h3>
                <p>{selectedTask.description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Estimated Hours</h3>
                  <Input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={selectedTask.estimatedHours}
                    onChange={(e) => setSelectedTask({
                      ...selectedTask,
                      estimatedHours: parseFloat(e.target.value)
                    })}
                  />
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Priority</h3>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => setSelectedTask({
                      ...selectedTask,
                      priority: e.target.value as TaskPriority
                    })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Due Date</h3>
                  <Input
                    type="date"
                    value={selectedTask.dueDate ? 
                      new Date(selectedTask.dueDate).toISOString().split('T')[0] : 
                      ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedTask({
                        ...selectedTask,
                        dueDate: value ? new Date(value) : null
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Category</h3>
                  <select
                    value={selectedTask.category}
                    onChange={(e) => setSelectedTask({
                      ...selectedTask,
                      category: e.target.value as TaskCategory
                    })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Tax">Tax</option>
                    <option value="Audit">Audit</option>
                    <option value="Advisory">Advisory</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Bookkeeping">Bookkeeping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Required Skills</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTask.requiredSkills.map(skill => (
                      <span 
                        key={skill} 
                        className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedTask.recurringTaskId && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Generated From</h3>
                  <p className="text-sm">Recurring Task ID: {selectedTask.recurringTaskId}</p>
                </div>
              )}
              
              <div className="pt-4 flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={() => handleUpdateTask(selectedTask)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UnscheduledTaskList;
