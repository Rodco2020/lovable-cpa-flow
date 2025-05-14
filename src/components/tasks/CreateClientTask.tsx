
import React, { useState, useEffect } from 'react';
import { 
  TaskTemplate, 
  SkillType, 
  TaskPriority,
  TaskCategory,
  RecurrencePattern,
  RecurringTask
} from '@/types/task';
import { Client } from '@/types/client';
import { 
  getTaskTemplates,
  createRecurringTask,
  createAdHocTask
} from '@/services/taskService';
import { getClients } from '@/services/clientService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Calendar, Clock, Users } from 'lucide-react';

const CreateClientTask: React.FC = () => {
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state for the task
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    clientId: '',
    estimatedHours: 1,
    priority: 'Medium' as TaskPriority,
    category: 'Other' as TaskCategory,
    requiredSkills: [] as SkillType[],
    dueDate: '',
    // Recurrence fields
    recurrenceType: 'Monthly' as RecurrencePattern['type'],
    interval: 1,
    weekdays: [] as number[],
    dayOfMonth: 15,
    monthOfYear: 1,
    endDate: '',
    customOffsetDays: 0
  });
  
  useEffect(() => {
    // Load task templates
    const templates = getTaskTemplates();
    setTaskTemplates(templates);
    
    // Load clients
    const activeClients = getClients({ status: ['Active'] });
    setClients(activeClients);
  }, []);
  
  const handleTemplateSelect = (templateId: string) => {
    const template = taskTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setTaskForm({
        ...taskForm,
        name: template.name,
        description: template.description,
        estimatedHours: template.defaultEstimatedHours,
        priority: template.defaultPriority,
        category: template.category,
        requiredSkills: [...template.requiredSkills]
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'estimatedHours' || name === 'interval' || name === 'dayOfMonth' || 
        name === 'monthOfYear' || name === 'customOffsetDays') {
      setTaskForm({ ...taskForm, [name]: parseFloat(value) });
    } else {
      setTaskForm({ ...taskForm, [name]: value });
    }
  };

  const handleClientChange = (clientId: string) => {
    setTaskForm({ ...taskForm, clientId });
  };
  
  const handleWeekdayChange = (day: number, checked: boolean) => {
    if (checked) {
      setTaskForm({
        ...taskForm,
        weekdays: [...taskForm.weekdays, day]
      });
    } else {
      setTaskForm({
        ...taskForm,
        weekdays: taskForm.weekdays.filter(d => d !== day)
      });
    }
  };
  
  const buildRecurrencePattern = (): RecurrencePattern => {
    const pattern: RecurrencePattern = {
      type: taskForm.recurrenceType,
      interval: taskForm.interval
    };
    
    if (taskForm.recurrenceType === 'Weekly') {
      pattern.weekdays = taskForm.weekdays;
    } else if (taskForm.recurrenceType === 'Monthly') {
      pattern.dayOfMonth = taskForm.dayOfMonth;
    } else if (taskForm.recurrenceType === 'Annually') {
      pattern.dayOfMonth = taskForm.dayOfMonth;
      pattern.monthOfYear = taskForm.monthOfYear;
    } else if (taskForm.recurrenceType === 'Custom') {
      pattern.customOffsetDays = taskForm.customOffsetDays;
    }
    
    if (taskForm.endDate) {
      pattern.endDate = new Date(taskForm.endDate);
    }
    
    return pattern;
  };
  
  const handleSubmit = () => {
    if (!selectedTemplate) {
      toast({
        title: "Missing Template",
        description: "Please select a task template first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!taskForm.clientId) {
      toast({
        title: "Missing Client",
        description: "Please select a client.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isRecurring) {
        // Create recurring task
        const recurrencePattern = buildRecurrencePattern();
        
        if (!taskForm.dueDate) {
          toast({
            title: "Missing Due Date",
            description: "Please specify the first due date.",
            variant: "destructive"
          });
          return;
        }
        
        createRecurringTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills: taskForm.requiredSkills,
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate),
          recurrencePattern
        });
        
        toast({
          title: "Recurring Task Created",
          description: "The recurring task has been created successfully.",
        });
      } else {
        // Create ad-hoc task
        if (!taskForm.dueDate) {
          toast({
            title: "Missing Due Date",
            description: "Please specify a due date.",
            variant: "destructive"
          });
          return;
        }
        
        createAdHocTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills: taskForm.requiredSkills,
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate)
        });
        
        toast({
          title: "Ad-hoc Task Created",
          description: "The ad-hoc task has been created successfully.",
        });
      }
      
      // Reset form and close dialog
      setIsDialogOpen(false);
      setSelectedTemplate(null);
      setIsRecurring(false);
      setTaskForm({
        name: '',
        description: '',
        clientId: '',
        estimatedHours: 1,
        priority: 'Medium' as TaskPriority,
        category: 'Other' as TaskCategory,
        requiredSkills: [],
        dueDate: '',
        recurrenceType: 'Monthly' as RecurrencePattern['type'],
        interval: 1,
        weekdays: [],
        dayOfMonth: 15,
        monthOfYear: 1,
        endDate: '',
        customOffsetDays: 0
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the task.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Tasks to Clients</CardTitle>
        <CardDescription>
          Create new client-assigned tasks, either one-time or recurring.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Task to Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="template" className="text-sm font-medium">
                  Select Task Template
                </label>
                <select
                  id="template"
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Select Template --</option>
                  {taskTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedTemplate && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="clientId" className="text-sm font-medium">
                      Client
                    </label>
                    <Select value={taskForm.clientId} onValueChange={handleClientChange}>
                      <SelectTrigger className="w-full">
                        <Users className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.legalName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Task Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={taskForm.name}
                        onChange={handleInputChange}
                        placeholder="Enter task name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="estimatedHours" className="text-sm font-medium">
                        Estimated Hours
                      </label>
                      <Input
                        id="estimatedHours"
                        name="estimatedHours"
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={taskForm.estimatedHours}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={taskForm.description}
                      onChange={handleInputChange}
                      placeholder="Describe the task"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={taskForm.priority}
                        onChange={handleInputChange}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={taskForm.category}
                        onChange={handleInputChange}
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
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor="isRecurring" className="text-sm font-medium">
                        This is a recurring task
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="dueDate" className="text-sm font-medium">
                        {isRecurring ? 'First Due Date' : 'Due Date'}
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={taskForm.dueDate}
                          onChange={handleInputChange}
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>
                    
                    {isRecurring && (
                      <div className="space-y-2">
                        <label htmlFor="recurrenceType" className="text-sm font-medium">
                          Recurrence Pattern
                        </label>
                        <select
                          id="recurrenceType"
                          name="recurrenceType"
                          value={taskForm.recurrenceType}
                          onChange={handleInputChange}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Annually">Annually</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {isRecurring && (
                    <div className="border p-3 rounded-md space-y-4">
                      {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'].includes(taskForm.recurrenceType)) && (
                        <div className="space-y-2">
                          <label htmlFor="interval" className="text-sm font-medium">
                            Interval
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Every</span>
                            <Input
                              id="interval"
                              name="interval"
                              type="number"
                              min="1"
                              value={taskForm.interval}
                              onChange={handleInputChange}
                              className="w-20"
                            />
                            <span className="text-sm">
                              {taskForm.recurrenceType === 'Daily' ? 'day(s)' :
                               taskForm.recurrenceType === 'Weekly' ? 'week(s)' :
                               taskForm.recurrenceType === 'Monthly' ? 'month(s)' :
                               taskForm.recurrenceType === 'Quarterly' ? 'quarter(s)' :
                               'year(s)'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {taskForm.recurrenceType === 'Weekly' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">On which days</label>
                          <div className="grid grid-cols-7 gap-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                              <div key={day} className="flex flex-col items-center">
                                <input
                                  type="checkbox"
                                  id={`day-${index}`}
                                  checked={taskForm.weekdays.includes(index)}
                                  onChange={(e) => handleWeekdayChange(index, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor={`day-${index}`} className="text-xs mt-1">
                                  {day}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {['Monthly', 'Annually'].includes(taskForm.recurrenceType) && (
                        <div className="space-y-2">
                          <label htmlFor="dayOfMonth" className="text-sm font-medium">
                            Day of Month
                          </label>
                          <Input
                            id="dayOfMonth"
                            name="dayOfMonth"
                            type="number"
                            min="1"
                            max="31"
                            value={taskForm.dayOfMonth}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                      
                      {taskForm.recurrenceType === 'Annually' && (
                        <div className="space-y-2">
                          <label htmlFor="monthOfYear" className="text-sm font-medium">
                            Month
                          </label>
                          <select
                            id="monthOfYear"
                            name="monthOfYear"
                            value={taskForm.monthOfYear}
                            onChange={handleInputChange}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                          </select>
                        </div>
                      )}
                      
                      {taskForm.recurrenceType === 'Custom' && (
                        <div className="space-y-2">
                          <label htmlFor="customOffsetDays" className="text-sm font-medium">
                            Days Offset
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="customOffsetDays"
                              name="customOffsetDays"
                              type="number"
                              value={taskForm.customOffsetDays}
                              onChange={handleInputChange}
                              className="w-20"
                            />
                            <span className="text-sm">days after month-end</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label htmlFor="endDate" className="text-sm font-medium">
                          End Date (Optional)
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={taskForm.endDate}
                            onChange={handleInputChange}
                            className="pl-8"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Leave empty for no end date
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="button" 
                  disabled={!selectedTemplate || !taskForm.clientId}
                  onClick={handleSubmit}
                >
                  {isRecurring ? 'Create Recurring Task' : 'Create Ad-hoc Task'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CreateClientTask;
