
import { useState } from 'react';
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
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Form schema for validation
const EditTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  estimatedHours: z.number().positive('Hours must be greater than 0'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const),
  category: z.enum(['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other'] as const),
  dueDate: z.date().optional(),
  isRecurring: z.boolean(),
  recurrenceType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom'] as const).optional(),
  interval: z.number().positive().optional(),
  weekdays: z.array(z.number().min(0).max(6)).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  monthOfYear: z.number().min(1).max(12).optional(),
  endDate: z.date().optional().nullable(),
  customOffsetDays: z.number().optional()
});

type EditTaskFormValues = z.infer<typeof EditTaskSchema>;

interface EditRecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: RecurringTask | null;
  onSave: (updatedTask: Partial<RecurringTask>) => Promise<void>;
}

export function EditRecurringTaskDialog({ 
  open, 
  onOpenChange, 
  task, 
  onSave 
}: EditRecurringTaskDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

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
      interval: 1,
      weekdays: [],
      dayOfMonth: 15,
      monthOfYear: 1,
      customOffsetDays: 0
    }
  });

  // Reset form when task changes
  useState(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description || '',
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        isRecurring: true,
        recurrenceType: task.recurrencePattern.type,
        interval: task.recurrencePattern.interval || 1,
        weekdays: task.recurrencePattern.weekdays || [],
        dayOfMonth: task.recurrencePattern.dayOfMonth,
        monthOfYear: task.recurrencePattern.monthOfYear,
        endDate: task.recurrencePattern.endDate ? new Date(task.recurrencePattern.endDate) : null,
        customOffsetDays: task.recurrencePattern.customOffsetDays
      });
    }
  }, [task, form]);

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const recurrenceType = form.watch('recurrenceType');
  
  // Handle form submission
  const onSubmit = async (data: EditTaskFormValues) => {
    if (!task) return;
    
    setIsSaving(true);
    try {
      // Build recurrence pattern from form data
      const recurrencePattern = {
        type: data.recurrenceType!,
        interval: data.interval,
        weekdays: data.recurrenceType === 'Weekly' ? data.weekdays : undefined,
        dayOfMonth: ['Monthly', 'Annually'].includes(data.recurrenceType!) ? data.dayOfMonth : undefined,
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
        recurrencePattern: recurrencePattern
      };

      // Call save function passed from parent
      await onSave(updatedTask);
      onOpenChange(false);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Recurring Task</DialogTitle>
        </DialogHeader>
        
        {task && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Task Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter task name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Task description" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority and Category */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Estimated Hours and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))} 
                          min="0.25" 
                          step="0.25" 
                        />
                      </FormControl>
                      <FormMessage />
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
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
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
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
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
                      <FormLabel>Interval</FormLabel>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Every</span>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-20"
                            min="1"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
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
                      <FormMessage />
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
                      <FormLabel>On which days</FormLabel>
                      <div className="grid grid-cols-7 gap-2" role="group" aria-label="Weekday selection">
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
                              />
                            </FormControl>
                            <span className="text-xs mt-1">{day}</span>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Monthly and Annually recurrence settings */}
              {['Monthly', 'Annually'].includes(recurrenceType || '') && (
                <FormField
                  control={form.control}
                  name="dayOfMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Month</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
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
                      <FormLabel>Month</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                      <FormMessage />
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
                      <FormLabel>Days Offset</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Input
                            type="number"
                            className="w-20"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <span className="text-sm">days after month-end</span>
                      </div>
                      <FormMessage />
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
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No end date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
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
                          >
                            Clear date
                          </Button>
                        </div>
                        <CalendarComponent
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
