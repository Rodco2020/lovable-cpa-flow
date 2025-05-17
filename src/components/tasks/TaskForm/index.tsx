import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  RecurringTaskCreateParams,
  RecurrencePattern,
  SkillType,
  TaskCategory,
  TaskPriority
} from '@/types/task';
import { getAllTaskTemplates } from '@/services/taskTemplateService';
import { createTaskTemplate } from '@/services/taskTemplateService';
import { getAllClients } from '@/services/clientService';
import { createRecurringTask, createAdHocTask } from '@/services/taskService';

const taskFormSchema = z.object({
  name: z.string().min(3, {
    message: "Task name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  estimatedHours: z.number().min(0, {
    message: "Estimated hours must be a positive number.",
  }),
  requiredSkills: z.array(z.string()).nonempty({
    message: "At least one skill is required.",
  }),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  category: z.enum(['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other']),
  dueDate: z.date(),
});

const recurrencePatternSchema = z.object({
  type: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually', 'Custom']),
  interval: z.number().min(1, {
    message: "Interval must be at least 1.",
  }).default(1),
  weekdays: z.array(z.number()).optional(),
  dayOfMonth: z.number().min(1, {
    message: "Day of month must be between 1 and 31.",
  }).max(31, {
    message: "Day of month must be between 1 and 31.",
  }).optional(),
  monthOfYear: z.number().min(1, {
    message: "Month of year must be between 1 and 12.",
  }).max(12, {
    message: "Month of year must be between 1 and 12.",
  }).optional(),
  endDate: z.date().optional(),
  customOffsetDays: z.number().optional(),
});

interface TaskFormProps {
  clientId?: string;
  clientName?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ clientId: initialClientId, clientName: initialClientName }) => {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(initialClientId || null);
  const [taskType, setTaskType] = useState<'recurring' | 'adHoc'>('recurring');
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [isRecurrenceEnabled, setIsRecurrenceEnabled] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    defaultEstimatedHours: 1,
    requiredSkills: [],
    defaultPriority: 'Medium',
    category: 'Tax',
  });
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: '',
      description: '',
      estimatedHours: 1,
      requiredSkills: [],
      priority: 'Medium',
      category: 'Tax',
      dueDate: new Date(),
    },
  });

  const recurrenceForm = useForm<z.infer<typeof recurrencePatternSchema>>({
    resolver: zodResolver(recurrencePatternSchema),
    defaultValues: {
      type: 'Monthly',
      interval: 1,
    },
  });

  const { watch } = form;
  const basicInfo = watch();
  const recurrencePattern = recurrenceForm.watch();

  useEffect(() => {
    const fetchTemplates = async () => {
      const templates = await getAllTaskTemplates();
      setTemplates(templates);
    };

    const fetchClients = async () => {
      const clients = await getAllClients();
      setClients(clients);
    };

    fetchTemplates();
    fetchClients();
  }, []);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTemplateId(e.target.value);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientId(e.target.value);
  };

  const handleTaskTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskType(e.target.value as 'recurring' | 'adHoc');
  };

  const handleCreateTemplate = async () => {
    try {
      if (!clientId || !templateId || !basicInfo || !recurrencePattern) return;

      const recurringTaskParams: RecurringTaskCreateParams = {
        templateId,
        clientId,
        name: basicInfo.name,
        description: basicInfo.description,
        estimatedHours: basicInfo.estimatedHours,
        requiredSkills: basicInfo.requiredSkills,
        priority: basicInfo.priority,
        category: basicInfo.category,
        dueDate: basicInfo.dueDate,
        recurrencePattern,
        status: 'Unscheduled',
        isActive: true
      };

      const createdTask = await createRecurringTask(recurringTaskParams);

      if (createdTask) {
        toast.success('Recurring task created successfully');
        navigate('/tasks');
      } else {
        toast.error('Failed to create recurring task');
      }
    } catch (error) {
      console.error('Error creating recurring task:', error);
      toast.error('Failed to create recurring task');
    }
  };

  const handleCreateAdHocTask = async () => {
    try {
      if (!clientId || !templateId || !basicInfo) return;

      const adHocTaskParams = {
        templateId,
        clientId,
        name: basicInfo.name,
        description: basicInfo.description,
        estimatedHours: basicInfo.estimatedHours,
        requiredSkills: basicInfo.requiredSkills,
        priority: basicInfo.priority,
        category: basicInfo.category,
        dueDate: basicInfo.dueDate,
        status: 'Unscheduled',
      };

      const createdTask = await createAdHocTask(adHocTaskParams);

      if (createdTask) {
        toast.success('Ad-hoc task created successfully');
        navigate('/tasks');
      } else {
        toast.error('Failed to create ad-hoc task');
      }
    } catch (error) {
      console.error('Error creating ad-hoc task:', error);
      toast.error('Failed to create ad-hoc task');
    }
  };

  const onSubmit = () => {
    if (taskType === 'recurring') {
      handleCreateTemplate();
    } else {
      handleCreateAdHocTask();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Task</h1>

      <div className="mb-4">
        <Label htmlFor="taskType" className="block text-sm font-medium text-gray-700">Task Type</Label>
        <div className="mt-2">
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-blue-600"
              name="taskType"
              value="recurring"
              checked={taskType === 'recurring'}
              onChange={handleTaskTypeChange}
            />
            <span className="ml-2 text-gray-900">Recurring</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio h-5 w-5 text-blue-600"
              name="taskType"
              value="adHoc"
              checked={taskType === 'adHoc'}
              onChange={handleTaskTypeChange}
            />
            <span className="ml-2 text-gray-900">Ad-hoc</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task name" {...field} />
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
                        <Textarea
                          placeholder="Enter task description"
                          className="resize-none"
                          {...field}
                        />
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
                            placeholder="Enter estimated hours"
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a priority" />
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

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={
                                format(field.value, 'PPP') ? "w-[240px] justify-start text-left font-normal" : "w-[240px] justify-start text-left font-normal text-muted-foreground"
                              }
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(field.value, 'PPP') ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit">Create Task</Button>
            </form>
          </Form>
        </div>

        <div>
          <div className="mb-4">
            <Label htmlFor="template" className="block text-sm font-medium text-gray-700">Select Template</Label>
            <select
              id="template"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleTemplateChange}
              defaultValue=""
            >
              <option value="" disabled>Select a template</option>
              {templates.map((template: any) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <Label htmlFor="client" className="block text-sm font-medium text-gray-700">Select Client</Label>
            <select
              id="client"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              onChange={handleClientChange}
              defaultValue={initialClientId || ""}
            >
              <option value="" disabled>Select a client</option>
              {clients.map((client: any) => (
                <option key={client.id} value={client.id}>{client.legalName}</option>
              ))}
            </select>
          </div>

          {taskType === 'recurring' && (
            <div className="space-y-4">
              <Label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">Recurrence Pattern</Label>
              <Form {...recurrenceForm}>
                <form className="space-y-4">
                  <FormField
                    control={recurrenceForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a recurrence type" />
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

                  <FormField
                    control={recurrenceForm.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interval</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter interval"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
