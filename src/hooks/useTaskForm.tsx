
import { useState } from 'react';
import { TaskPriority, TaskCategory, TaskTemplate, RecurrencePattern } from '@/types/task';

interface TaskFormData {
  name: string;
  description: string;
  clientId: string;
  estimatedHours: number;
  priority: TaskPriority;
  category: TaskCategory;
  requiredSkills: string[];
  dueDate: string;
  recurrenceType: RecurrencePattern['type'];
  interval: number;
  weekdays: number[];
  dayOfMonth: number;
  monthOfYear: number;
  endDate: string;
  customOffsetDays: number;
}

interface TaskFormHookReturn {
  taskForm: TaskFormData;
  selectedTemplate: TaskTemplate | null;
  formErrors: Record<string, string>;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleTemplateSelect: (templateId: string, templates: TaskTemplate[]) => void;
  handleClientChange: (clientId: string) => void;
  handleWeekdayChange: (day: number, checked: boolean) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setFormErrors: (errors: Record<string, string>) => void;
  buildRecurrencePattern: () => RecurrencePattern;
}

export default function useTaskForm(): TaskFormHookReturn {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [taskForm, setTaskForm] = useState<TaskFormData>({
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'estimatedHours' || name === 'interval' || name === 'dayOfMonth' || 
        name === 'monthOfYear' || name === 'customOffsetDays') {
      setTaskForm(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setTaskForm(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTemplateSelect = (templateId: string, templates: TaskTemplate[]) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setTaskForm(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        estimatedHours: template.defaultEstimatedHours,
        priority: template.defaultPriority,
        category: template.category,
        requiredSkills: [...template.requiredSkills]
      }));
    }
  };

  const handleClientChange = (clientId: string) => {
    setTaskForm(prev => ({ ...prev, clientId }));
    // Clear validation error
    if (formErrors.clientId) {
      setFormErrors(prev => ({
        ...prev,
        clientId: ''
      }));
    }
  };
  
  const handleWeekdayChange = (day: number, checked: boolean) => {
    if (checked) {
      setTaskForm(prev => ({
        ...prev,
        weekdays: [...prev.weekdays, day]
      }));
    } else {
      setTaskForm(prev => ({
        ...prev,
        weekdays: prev.weekdays.filter(d => d !== day)
      }));
    }
    
    // Clear weekdays validation error if any day is selected
    if (formErrors.weekdays && checked) {
      setFormErrors(prev => ({
        ...prev,
        weekdays: ''
      }));
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
  
  const resetForm = () => {
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
  };
  
  return {
    taskForm,
    selectedTemplate,
    formErrors,
    isRecurring,
    setIsRecurring,
    handleInputChange,
    handleTemplateSelect,
    handleClientChange,
    handleWeekdayChange,
    validateForm,
    resetForm,
    setFormErrors,
    buildRecurrencePattern
  };
}
