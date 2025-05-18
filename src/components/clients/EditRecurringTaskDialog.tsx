
import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { RecurringTask, TaskPriority, TaskCategory, SkillType } from '@/types/task';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, AlertCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

// Form schema for validation
const EditTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  estimatedHours: z.number().positive('Hours must be greater than 0').min(0.25, 'Minimum hours is 0.25'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const),
  category: z.enum(['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other'] as const),
  dueDate: z.date().optional(),
  isRecurring: z.boolean(),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  recurrenceType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'] as const).optional(),
  interval: z.number().positive('Interval must be positive').min(1, 'Minimum interval is 1').optional(),
  weekdays: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1, 'Day must be between 1-31').max(31, 'Day must be between 1-31').optional(),
  monthOfYear: z.number().min(1, 'Month must be between 1-12').max(12, 'Month must be between 1-12').optional(),
  endDate: z.date().optional().nullable(),
  customOffsetDays: z.number().optional()
});

type EditTaskFormValues = z.infer<typeof EditTaskSchema>;

interface EditRecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: RecurringTask | null;
  onSave: (updatedTask: Partial<RecurringTask>) => Promise<void>;
  isLoading?: boolean; 
  loadError?: string | null;
  attemptedLoad?: boolean;
}

export function EditRecurringTaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  onSave,
  isLoading = false,
  loadError = null,
  attemptedLoad = false
}: EditRecurringTaskDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);
  const formTitleRef = useRef<HTMLHeadingElement>(null);
  const initialFormRef = useRef<any>(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Available skills for selection
  const availableSkills: SkillType[] = [
    "Junior", "Senior", "CPA", "Tax Specialist", "Audit", "Advisory", "Bookkeeping"
  ];
  
  // Initialize form with task data when available
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(EditTaskSchema),
    defaultValues: task ? {
      name: task.name,
      description: task.description || '',
      estimatedHours: task.estimatedHours,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      isRecurring: true,
      requiredSkills: task.requiredSkills || [],
      recurrenceType: task.recurrencePattern.type,
      interval: task.recurrencePattern.interval || 1,
      weekdays: task.recurrencePattern.weekdays || [],
      dayOfMonth: task.recurrencePattern.dayOfMonth,
      monthOfYear: task.recurrencePattern.monthOfYear,
      endDate: task.recurrencePattern.endDate ? new Date(task.recurrencePattern.endDate) : null,
      customOffsetDays: task.recurrencePattern.customOffsetDays
    } : {
      name: '',
      description: '',
      estimatedHours: 1,
      priority: 'Medium' as TaskPriority,
      category: 'Other' as TaskCategory,
      isRecurring: true,
      requiredSkills: [],
      interval: 1,
      weekdays: [],
      dayOfMonth: 15,
      monthOfYear: 1,
      customOffsetDays: 0
    }
  });

  // Update selected skills state when form values change
  useEffect(() => {
    if (task?.requiredSkills) {
      setSelectedSkills(task.requiredSkills);
      form.setValue('requiredSkills', task.requiredSkills);
    }
  }, [task, form]);

  // Store initial form values for detecting changes
  useEffect(() => {
    if (task && open) {
      initialFormRef.current = form.getValues();
    }
  }, [task, open, form]);

  // Focus on title when dialog opens
  useEffect(() => {
    if (open && formTitleRef.current) {
      setTimeout(() => {
        formTitleRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description || '',
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        isRecurring: true,
        requiredSkills: task.requiredSkills || [],
        recurrenceType: task.recurrencePattern.type,
        interval: task.recurrencePattern.interval || 1,
        weekdays: task.recurrencePattern.weekdays || [],
        dayOfMonth: task.recurrencePattern.dayOfMonth,
        monthOfYear: task.recurrencePattern.monthOfYear,
        endDate: task.recurrencePattern.endDate ? new Date(task.recurrencePattern.endDate) : null,
        customOffsetDays: task.recurrencePattern.customOffsetDays
      });
      setSelectedSkills(task.requiredSkills || []);
      // Clear any previous form errors when task changes
      setFormError(null);
      setSkillsError(null);
    }
  }, [task, form]);

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const recurrenceType = form.watch('recurrenceType');
  
  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialFormRef.current) return false;
    
    const currentValues = form.getValues();
    const initialValues = initialFormRef.current;
    
    // Compare form values, excluding complex objects like dates that need special comparison
    for (const key in currentValues) {
      if (key === 'dueDate' || key === 'endDate') continue;
      if (JSON.stringify(currentValues[key as keyof EditTaskFormValues]) !== 
          JSON.stringify(initialValues[key])) {
        return true;
      }
    }
    return false;
  };

  // Handle dialog close with confirmation if there are unsaved changes
  const handleDialogClose = (open: boolean) => {
    if (!open && hasUnsavedChanges() && !isSaving) {
      setShowUnsavedChangesAlert(true);
    } else {
      onOpenChange(open);
    }
  };
  
  // Handle skill selection
  const toggleSkill = (skill: string) => {
    let updatedSkills: string[];
    
    if (selectedSkills.includes(skill)) {
      updatedSkills = selectedSkills.filter(s => s !== skill);
    } else {
      updatedSkills = [...selectedSkills, skill];
    }
    
    setSelectedSkills(updatedSkills);
    form.setValue('requiredSkills', updatedSkills);
    
    if (updatedSkills.length === 0) {
      setSkillsError('At least one skill is required');
    } else {
      setSkillsError(null);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: EditTaskFormValues) => {
    if (!task) {
      setFormError("No task data available to update");
      return;
    }
    
    if (selectedSkills.length === 0) {
      setSkillsError('At least one skill is required');
      return;
    }
    
    setIsSaving(true);
    setFormError(null);
    
    try {
      // Build recurrence pattern from form data
      const recurrencePattern = {
        type: data.recurrenceType!,
        interval: data.interval,
        weekdays: data.recurrenceType === 'Weekly' ? data.weekdays : undefined,
        dayOfMonth: ['Monthly', 'Quarterly', 'Annually'].includes(data.recurrenceType!) ? data.dayOfMonth : undefined,
        monthOfYear: data.recurrenceType === 'Annually' ? data.monthOfYear : undefined,
        endDate: data.endDate || undefined,
        customOffsetDays: data.recurrenceType === 'Custom' ? data.customOffsetDays : undefined
      };

      // Build updated task object
      const updatedTask: Partial<RecurringTask> = {
        id: task.id,
        name: data.name,
        description: data.description,
        estimatedHours: data.estimatedHours,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        requiredSkills: selectedSkills as SkillType[],
        recurrencePattern: recurrencePattern,
        // Preserve isActive status from original task
        isActive: task.isActive
      };

      // Call save function passed from parent
      await onSave(updatedTask);
      onOpenChange(false);
      initialFormRef.current = null;
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error saving task:", error);
      setFormError(error instanceof Error ? error.message : "Failed to update task");
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle retry loading after an error
  const handleRetryLoad = () => {
    if (!open) return;
    
    setRetryLoading(true);
    // Trigger a re-render which will cause the useEffect to run again
    // This is cleaner than duplicating the loading logic
    onOpenChange(false);
    setTimeout(() => {
      onOpenChange(true);
      setRetryLoading(false);
    }, 100);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          aria-labelledby="edit-task-title"
          aria-describedby="edit-task-description"
          onKeyDown={(e) => {
            if (e.key === 'Escape' && hasUnsavedChanges()) {
              e.preventDefault();
              setShowUnsavedChangesAlert(true);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle id="edit-task-title" ref={formTitleRef} tabIndex={-1}>
              Edit Recurring Task {task?.isActive === false && <span className="ml-2 text-sm text-muted-foreground">(Inactive)</span>}
            </DialogTitle>
          </DialogHeader>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8" aria-live="polite" role="status">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" 
                   aria-hidden="true">
              </div>
              <span className="ml-2">Loading task data...</span>
            </div>
          )}
          
          {/* Error State with Retry */}
          {loadError && attemptedLoad && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <div>{loadError}</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetryLoad} 
                  disabled={retryLoading}
                  className="w-fit"
                  aria-label="Retry loading task data"
                >
                  {retryLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Form Error State */}
          {formError && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          {/* Task Status Warning for Inactive Tasks */}
          {task && task.isActive === false && !isLoading && !loadError && (
            <Alert variant="warning" className="mb-4 border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You are editing an inactive task. The task will remain inactive after updates.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Successful Form Render */}
          {task && !isLoading && !loadError && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="edit-task-form">
                <div id="edit-task-description" className="sr-only">
                  Form to edit task details, recurrence patterns, and scheduling options.
                </div>
                
                {/* Task Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="task-name">Task Name</FormLabel>
                      <FormControl>
                        <Input 
                          id="task-name" 
                          {...field} 
                          placeholder="Enter task name" 
                          aria-required="true" 
                        />
                      </FormControl>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="task-description">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          id="task-description" 
                          {...field} 
                          placeholder="Task description" 
                          rows={2} 
                        />
                      </FormControl>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                {/* Priority and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="task-priority">Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger id="task-priority" aria-label="Select priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  {/* Category FormField */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="task-category">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger id="task-category" aria-label="Select category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Tax">Tax</SelectItem>
                            <SelectItem value="Audit">Audit</SelectItem>
                            <SelectItem value="Advisory">Advisory</SelectItem>
                            <SelectItem value="Compliance">Compliance</SelectItem>
                            <SelectItem value="Bookkeeping">Bookkeeping</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Required Skills */}
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <div className="border rounded-md p-3 space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {availableSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer hover:bg-secondary transition-colors",
                            selectedSkills.includes(skill) 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-background text-foreground"
                          )}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                          {selectedSkills.includes(skill) && (
                            <span className="ml-1 text-xs">✓</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {selectedSkills.length > 0 ? (
                      <div className="text-xs text-muted-foreground">
                        Selected: {selectedSkills.join(', ')}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Click to select required skills
                      </div>
                    )}
                    {skillsError && (
                      <div className="text-sm font-medium text-destructive" role="alert">
                        {skillsError}
                      </div>
                    )}
                  </div>
                </FormItem>

                {/* Estimated Hours and Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="estimated-hours">Estimated Hours</FormLabel>
                        <FormControl>
                          <Input 
                            id="estimated-hours"
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                            min="0.25" 
                            step="0.25" 
                            aria-label="Enter estimated hours"
                          />
                        </FormControl>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>First Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                aria-label="Select due date"
                                aria-haspopup="dialog"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Recurrence Type */}
                <FormField
                  control={form.control}
                  name="recurrenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="recurrence-type">Recurrence Pattern</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger id="recurrence-type" aria-label="Select recurrence pattern">
                            <SelectValue placeholder="Select recurrence pattern" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Annually">Annually</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                {/* Interval setting for standard recurrence types */}
                {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'].includes(recurrenceType || '') && (
                  <FormField
                    control={form.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="interval">Interval</FormLabel>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Every</span>
                          <FormControl>
                            <Input
                              id="interval"
                              type="number"
                              className="w-20"
                              min="1"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                              aria-label={`Enter ${recurrenceType?.toLowerCase() || 'recurrence'} interval`}
                            />
                          </FormControl>
                          <span className="text-sm">
                            {recurrenceType === 'Daily' ? 'day(s)' :
                             recurrenceType === 'Weekly' ? 'week(s)' :
                             recurrenceType === 'Monthly' ? 'month(s)' :
                             recurrenceType === 'Quarterly' ? 'quarter(s)' :
                             recurrenceType === 'Annually' ? 'year(s)' : 'interval'}
                          </span>
                        </div>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Weekly recurrence specific settings */}
                {recurrenceType === 'Weekly' && (
                  <FormField
                    control={form.control}
                    name="weekdays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel id="weekdays-group-label">On which days</FormLabel>
                        <div 
                          className="grid grid-cols-7 gap-2" 
                          role="group" 
                          aria-labelledby="weekdays-group-label"
                        >
                          {weekdayNames.map((day, index) => (
                            <div key={day} className="flex flex-col items-center">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(index)}
                                  onCheckedChange={(checked) => {
                                    const updatedWeekdays = checked
                                      ? [...(field.value || []), index]
                                      : (field.value || []).filter(d => d !== index);
                                    field.onChange(updatedWeekdays);
                                  }}
                                  aria-label={day}
                                  id={`weekday-${index}`}
                                />
                              </FormControl>
                              <label 
                                htmlFor={`weekday-${index}`}
                                className="text-xs mt-1 cursor-pointer"
                              >
                                {day}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Monthly and related recurrence settings */}
                {['Monthly', 'Quarterly', 'Annually'].includes(recurrenceType || '') && (
                  <FormField
                    control={form.control}
                    name="dayOfMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="day-of-month">Day of Month</FormLabel>
                        <FormControl>
                          <Input
                            id="day-of-month"
                            type="number"
                            min="1"
                            max="31"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            aria-label="Enter day of month (1-31)"
                          />
                        </FormControl>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Annually specific settings */}
                {recurrenceType === 'Annually' && (
                  <FormField
                    control={form.control}
                    name="monthOfYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="month-of-year">Month</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger id="month-of-year" aria-label="Select month">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(12)].map((_, i) => (
                              <SelectItem key={i+1} value={(i+1).toString()}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Custom recurrence settings */}
                {recurrenceType === 'Custom' && (
                  <FormField
                    control={form.control}
                    name="customOffsetDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="custom-offset">Days Offset</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input
                              id="custom-offset"
                              type="number"
                              className="w-20"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                              aria-label="Enter days offset from month-end"
                            />
                          </FormControl>
                          <span className="text-sm">days after month-end</span>
                        </div>
                        <FormMessage role="alert" />
                      </FormItem>
                    )}
                  />
                )}

                {/* End date setting for all recurrence types */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              aria-label="Select end date (optional)"
                              aria-haspopup="dialog"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => field.onChange(null)}
                              className="mb-2"
                              aria-label="Clear end date"
                            >
                              Clear date
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500">
                        Leave empty for no end date
                      </p>
                      <FormMessage role="alert" />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => handleDialogClose(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    aria-busy={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Unsaved Changes Alert */}
      <AlertDialog 
        open={showUnsavedChangesAlert} 
        onOpenChange={setShowUnsavedChangesAlert}
      >
        <AlertDialogContent aria-labelledby="alert-title" aria-describedby="alert-description">
          <AlertDialogHeader>
            <AlertDialogTitle id="alert-title" className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription id="alert-description">
              You have unsaved changes that will be lost if you close this dialog.
              Do you want to continue without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onOpenChange(false);
                setShowUnsavedChangesAlert(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
