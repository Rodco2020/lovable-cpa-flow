import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createRecurringTask, getTaskTemplates } from '@/services/taskService';
import { TaskTemplate, RecurringTask } from '@/types/task';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader } from 'lucide-react';

// Define the form schema
const taskFormSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  estimatedHours: z.coerce.number().min(0.1, "Hours must be greater than 0"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  recurrenceType: z.enum(["Daily", "Weekly", "Monthly", "Quarterly", "Annually"]),
  dayOfMonth: z.coerce.number().min(1).max(31).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface CreateClientTaskProps {
  clientId: string;
  onTaskCreated?: (task: RecurringTask) => void;
}

const CreateClientTask = ({ clientId, onTaskCreated }: CreateClientTaskProps) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      setError(null);
      
      try {
        const fetchedTemplates = await getTaskTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Error loading templates:", error);
        setError("Failed to load task templates. Please try again.");
        toast.error("Failed to load task templates");
      } finally {
        setTemplatesLoading(false);
      }
    };
    
    loadTemplates();
  }, []);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      templateId: "",
      name: "",
      description: "",
      estimatedHours: 1,
      priority: "Medium",
      recurrenceType: "Monthly",
      dayOfMonth: 1,
    },
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      form.setValue("name", template.name);
      form.setValue("description", template.description || "");
      form.setValue("estimatedHours", template.defaultEstimatedHours);
      form.setValue("priority", template.defaultPriority);
    }
  };

  const onSubmit = async (data: TaskFormValues) => {
    if (!selectedTemplate) {
      toast.error("Please select a task template");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      toast.loading("Creating recurring task...");
      
      const recurrencePattern: any = {
        type: data.recurrenceType,
      };
      
      if (["Monthly", "Quarterly", "Annually"].includes(data.recurrenceType) && data.dayOfMonth) {
        recurrencePattern.dayOfMonth = data.dayOfMonth;
      }
      
      const newTask = await createRecurringTask({
        templateId: data.templateId,
        clientId: clientId,
        name: data.name,
        description: data.description || "",
        estimatedHours: data.estimatedHours,
        requiredSkills: selectedTemplate.requiredSkills,
        priority: data.priority,
        category: selectedTemplate.category,
        dueDate: new Date(),
        recurrenceType: data.recurrenceType,
        recurrencePattern: recurrencePattern,
      });
      
      toast.dismiss();
      
      if (newTask) {
        toast.success("Recurring task created successfully!");
        form.reset();
        setSelectedTemplate(null);
        if (onTaskCreated) onTaskCreated(newTask);
      } else {
        toast.error("Failed to create recurring task");
        setError("Failed to create the recurring task. Please try again.");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error creating task:", error);
      toast.error("An error occurred while creating the task");
      setError("Failed to create the recurring task. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (templatesLoading) {
    return (
      <div className="flex justify-center items-center p-8 border rounded-lg bg-white">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="templateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Template</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTemplateChange(value);
                }}
                value={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input disabled={loading} {...field} />
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
                <Textarea disabled={loading} {...field} />
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
                  <Input type="number" step="0.5" disabled={loading} {...field} />
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
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
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
            name="recurrenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
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

          {["Monthly", "Quarterly", "Annually"].includes(form.watch("recurrenceType")) && (
            <FormField
              control={form.control}
              name="dayOfMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Month</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="31" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="mr-2">
                <Loader className="h-4 w-4 animate-spin" />
              </span>
              Creating...
            </>
          ) : (
            "Create Recurring Task"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CreateClientTask;
