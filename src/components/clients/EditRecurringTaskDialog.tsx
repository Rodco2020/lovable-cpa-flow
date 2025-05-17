import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RecurringTask, TaskPriority, RecurrencePattern } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';
import { updateRecurringTask } from '@/services/taskService';

// Define the schema for validation
const editTaskSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  estimatedHours: z.coerce.number().positive("Hours must be positive"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  dueDate: z.string(),
  recurrenceType: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Annually", "Custom"]),
  dayOfMonth: z.coerce.number().min(1).max(31).optional(),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

interface EditRecurringTaskDialogProps {
  open: boolean;
  task: RecurringTask | null;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

const EditRecurringTaskDialog: React.FC<EditRecurringTaskDialogProps> = ({
  open,
  task,
  onOpenChange,
  onTaskUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: '',
      description: '',
      estimatedHours: 1,
      priority: 'Medium' as TaskPriority,
      dueDate: '',
      recurrenceType: 'Monthly',
      dayOfMonth: 15,
    },
  });

  // Update form when task changes
  useEffect(() => {
    if (task) {
      const dueDate = task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '';
      form.reset({
        name: task.name,
        description: task.description || '',
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        dueDate: dueDate,
        recurrenceType: task.recurrencePattern.type,
        dayOfMonth: task.recurrencePattern.dayOfMonth || 1,
      });
    }
  }, [task, form]);

  const onSubmit = async (data: EditTaskFormValues) => {
    if (!task) return;

    setIsSubmitting(true);

    try {
      // Build the recurrence pattern based on form data
      const recurrencePattern: RecurrencePattern = {
        type: data.recurrenceType,
        interval: task.recurrencePattern.interval // Preserve original interval
      };
      
      // Add dayOfMonth for monthly/quarterly/annually recurrence types
      if (["Monthly", "Quarterly", "Annually"].includes(data.recurrenceType) && data.dayOfMonth) {
        recurrencePattern.dayOfMonth = data.dayOfMonth;
      }
      
      // Preserve other recurrence pattern properties
      if (task.recurrencePattern.weekdays) {
        recurrencePattern.weekdays = task.recurrencePattern.weekdays;
      }
      
      if (task.recurrencePattern.monthOfYear) {
        recurrencePattern.monthOfYear = task.recurrencePattern.monthOfYear;
      }
      
      if (task.recurrencePattern.endDate) {
        recurrencePattern.endDate = task.recurrencePattern.endDate;
      }
      
      if (task.recurrencePattern.customOffsetDays) {
        recurrencePattern.customOffsetDays = task.recurrencePattern.customOffsetDays;
      }

      // Update the task
      const updated = await updateRecurringTask(task.id, {
        name: data.name,
        description: data.description,
        estimatedHours: data.estimatedHours,
        priority: data.priority,
        dueDate: new Date(data.dueDate), 
        recurrencePattern,
        isActive: task.isActive // Preserve the isActive property
      });

      if (updated) {
        toast.success("Task updated successfully");
        onOpenChange(false);
        onTaskUpdated();
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("An error occurred while updating the task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Recurring Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        step="0.5" 
                        min="0.5"
                        disabled={isSubmitting} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      disabled={isSubmitting}
                    >
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Daily">Daily</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {["Monthly", "Quarterly", "Annually"].includes(form.watch("recurrenceType")) && (
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
                        disabled={isSubmitting} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecurringTaskDialog;
