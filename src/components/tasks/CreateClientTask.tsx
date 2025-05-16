
import React, { useEffect, useState } from 'react';
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
import { getAllClients } from '@/services/clientService';
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
import { toast } from 'sonner';
import { AlertCircle, Plus, Calendar, Clock, Users, Loader, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CreateClientTask: React.FC = () => {
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
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
    // Load resources when dialog is opened
    if (isDialogOpen) {
      loadResources();
    }
  }, [isDialogOpen]);
  
  const loadResources = async () => {
    setIsLoading(true);
    try {
      // Load both resources in parallel for better performance
      const [templateData, clientData] = await Promise.all([
        getTaskTemplates(),
        getAllClients()
      ]);
      
      setTaskTemplates(templateData);
      setClients(clientData);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error("Failed to load necessary data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
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

    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleClientChange = (clientId: string) => {
    setTaskForm({ ...taskForm, clientId });
    // Clear validation error
    if (formErrors.clientId) {
      setFormErrors({
        ...formErrors,
        clientId: ''
      });
    }
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
    
    // Clear weekdays validation error if any day is selected
    if (formErrors.weekdays && checked) {
      setFormErrors({
        ...formErrors,
        weekdays: ''
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
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!selectedTemplate) {
      errors.templateId = "Please select a task template";
    }
    
    if (!taskForm.clientId) {
      errors.clientId = "Please select a client";
    }
    
    if (!taskForm.name.trim()) {
      errors.name = "Task name is required";
    }
    
    if (taskForm.estimatedHours <= 0) {
      errors.estimatedHours = "Estimated hours must be greater than 0";
    }
    
    if (isRecurring) {
      if (!taskForm.dueDate) {
        errors.dueDate = "First due date is required";
      }
      
      if (taskForm.recurrenceType === 'Weekly' && taskForm.weekdays.length === 0) {
        errors.weekdays = "Please select at least one weekday";
      }
    } else if (!taskForm.dueDate) {
      errors.dueDate = "Due date is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show a toast for validation errors
      toast.error("Please fix the form errors before submitting");
      
      // Scroll to the first error if any
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (!selectedTemplate) {
      toast.error("Please select a task template");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Show in-progress toast with ID for later reference
      const loadingToastId = toast.loading(
        isRecurring ? "Creating recurring task..." : "Creating ad-hoc task..."
      );
      
      let newTask;
      
      if (isRecurring) {
        // Create recurring task
        const recurrencePattern = buildRecurrencePattern();
        
        newTask = await createRecurringTask({
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
      } else {
        // Create ad-hoc task
        newTask = await createAdHocTask({
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
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      if (newTask) {
        // Show success toast with checkmark icon
        toast.success(
          isRecurring ? "Recurring task created successfully!" : "Ad-hoc task created successfully!",
          {
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
          }
        );
        
        // Reset form and close dialog
        resetFormAndCloseDialog();
      } else {
        toast.error("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(
        "An error occurred while creating the task", 
        { 
          description: error instanceof Error ? error.message : "Please try again or contact support",
          icon: <AlertCircle className="h-5 w-5 text-red-500" />
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetFormAndCloseDialog = () => {
    // Reset form state
    setSelectedTemplate(null);
    setIsRecurring(false);
    setFormErrors({});
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
    
    // Close dialog
    setIsDialogOpen(false);
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
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Assign New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Task to Client</DialogTitle>
            </DialogHeader>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading resources...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <label htmlFor="template" className="text-sm font-medium">
                    Select Task Template
                  </label>
                  <select
                    id="template"
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Select Template --</option>
                    {taskTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </option>
                    ))}
                  </select>
                  {formErrors.templateId && (
                    <p className="text-sm font-medium text-destructive">{formErrors.templateId}</p>
                  )}
                </div>
                
                {selectedTemplate && (
                  <>
                    {/* Client Selection */}
                    <div className="space-y-2">
                      <label htmlFor="clientId" className="text-sm font-medium">
                        Client
                      </label>
                      <Select 
                        value={taskForm.clientId} 
                        onValueChange={handleClientChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full">
                          <Users className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.length > 0 ? (
                            clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.legalName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                              No clients found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {formErrors.clientId && (
                        <p className="text-sm font-medium text-destructive">{formErrors.clientId}</p>
                      )}
                    </div>
                    
                    {/* Task Name and Hours */}
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
                          disabled={isSubmitting}
                          className={formErrors.name ? "border-destructive" : ""}
                        />
                        {formErrors.name && (
                          <p className="text-sm font-medium text-destructive">{formErrors.name}</p>
                        )}
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
                          disabled={isSubmitting}
                          className={formErrors.estimatedHours ? "border-destructive" : ""}
                        />
                        {formErrors.estimatedHours && (
                          <p className="text-sm font-medium text-destructive">{formErrors.estimatedHours}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
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
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {/* Priority and Category */}
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
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          disabled={isSubmitting}
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
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          disabled={isSubmitting}
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
                    
                    {/* Recurring Task Toggle */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          disabled={isSubmitting}
                        />
                        <label htmlFor="isRecurring" className="text-sm font-medium">
                          This is a recurring task
                        </label>
                      </div>
                    </div>
                    
                    {/* Due Date and Recurrence */}
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
                            className={`pl-8 ${formErrors.dueDate ? "border-destructive" : ""}`}
                            required
                            disabled={isSubmitting}
                          />
                          {formErrors.dueDate && (
                            <p className="text-sm font-medium text-destructive">{formErrors.dueDate}</p>
                          )}
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
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            disabled={isSubmitting}
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
                    
                    {/* Recurrence Settings */}
                    {isRecurring && (
                      <div className="border p-4 rounded-md space-y-4 bg-gray-50">
                        <h4 className="text-sm font-medium">Recurrence Settings</h4>
                        
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
                                disabled={isSubmitting}
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
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    disabled={isSubmitting}
                                  />
                                  <label htmlFor={`day-${index}`} className="text-xs mt-1">
                                    {day}
                                  </label>
                                </div>
                              ))}
                            </div>
                            {formErrors.weekdays && (
                              <p className="text-sm font-medium text-destructive">{formErrors.weekdays}</p>
                            )}
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
                              disabled={isSubmitting}
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
                              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                              disabled={isSubmitting}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Leave empty for no end date
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Summary before submission */}
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription>
                        {isRecurring ? (
                          <div className="text-sm">
                            <span className="font-medium">Summary:</span> Creating a recurring {taskForm.category} task
                            {taskForm.dueDate && <span> starting on <span className="font-semibold">{new Date(taskForm.dueDate).toLocaleDateString()}</span></span>}
                            {taskForm.recurrenceType && <span> that repeats <span className="font-semibold">{taskForm.recurrenceType.toLowerCase()}</span></span>}
                            {taskForm.endDate && <span> until <span className="font-semibold">{new Date(taskForm.endDate).toLocaleDateString()}</span></span>}
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="font-medium">Summary:</span> Creating a single {taskForm.category} task
                            {taskForm.dueDate && <span> due on <span className="font-semibold">{new Date(taskForm.dueDate).toLocaleDateString()}</span></span>}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                    
                    {/* Form Actions */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetFormAndCloseDialog}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedTemplate || !taskForm.clientId}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            {isRecurring ? 'Creating Recurring Task...' : 'Creating Ad-hoc Task...'}
                          </>
                        ) : (
                          isRecurring ? 'Create Recurring Task' : 'Create Ad-hoc Task'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CreateClientTask;
