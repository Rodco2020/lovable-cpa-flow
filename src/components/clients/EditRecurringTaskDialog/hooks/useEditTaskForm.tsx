
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RecurringTask, TaskPriority, TaskCategory, SkillType } from '@/types/task';
import { EditTaskSchema, EditTaskFormValues, UseEditTaskFormOptions, UseEditTaskFormReturn } from '../types';

export const useEditTaskForm = ({ 
  task, 
  onSave, 
  onSuccess 
}: UseEditTaskFormOptions): UseEditTaskFormReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Helper function to get default form values
  const getDefaultFormValues = (taskData?: RecurringTask | null): EditTaskFormValues => {
    if (taskData) {
      return {
        name: taskData.name,
        description: taskData.description || '',
        estimatedHours: taskData.estimatedHours,
        priority: taskData.priority,
        category: taskData.category,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        isRecurring: true,
        requiredSkills: taskData.requiredSkills || [],
        preferredStaffId: taskData.preferredStaffId || null,
        recurrenceType: taskData.recurrencePattern.type,
        interval: taskData.recurrencePattern.interval || 1,
        weekdays: taskData.recurrencePattern.weekdays || [],
        dayOfMonth: taskData.recurrencePattern.dayOfMonth,
        monthOfYear: taskData.recurrencePattern.monthOfYear,
        endDate: taskData.recurrencePattern.endDate ? new Date(taskData.recurrencePattern.endDate) : null,
        customOffsetDays: taskData.recurrencePattern.customOffsetDays
      };
    }
    
    // Default values for new task
    return {
      name: '',
      description: '',
      estimatedHours: 1,
      priority: 'Medium' as TaskPriority,
      category: 'Other' as TaskCategory,
      isRecurring: true,
      requiredSkills: [],
      preferredStaffId: null,
      interval: 1,
      weekdays: [],
      dayOfMonth: 15,
      monthOfYear: 1,
      customOffsetDays: 0
    };
  };
  
  // Initialize form with task data when available
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(EditTaskSchema),
    defaultValues: getDefaultFormValues(task),
    mode: 'onChange' // Enable real-time validation for better UX
  });

  // Initialize selected skills and form when task changes
  useEffect(() => {
    if (task) {
      console.log('Initializing form with task:', task);
      console.log('Task preferred staff ID:', task.preferredStaffId);
      
      const formValues = getDefaultFormValues(task);
      
      // Reset form with new values
      form.reset(formValues);
      
      // Update selected skills state
      setSelectedSkills(task.requiredSkills || []);
      
      // Clear any existing errors
      setFormError(null);
      setSkillsError(null);
      
      console.log('Form initialized with preferred staff ID:', formValues.preferredStaffId);
    }
  }, [task, form]);

  // Update selected skills state when form values change
  useEffect(() => {
    if (task?.requiredSkills) {
      setSelectedSkills(task.requiredSkills);
      form.setValue('requiredSkills', task.requiredSkills);
    }
  }, [task?.requiredSkills, form]);
  
  // Handle skill selection
  const toggleSkill = (skillId: string) => {
    let updatedSkills: string[];
    
    if (selectedSkills.includes(skillId)) {
      updatedSkills = selectedSkills.filter(s => s !== skillId);
    } else {
      updatedSkills = [...selectedSkills, skillId];
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
      console.log('Form submission data:', data);
      console.log('Preferred staff ID in submission:', data.preferredStaffId);
      
      // Validate preferred staff ID if provided
      if (data.preferredStaffId !== null && data.preferredStaffId !== undefined) {
        if (typeof data.preferredStaffId === 'string' && data.preferredStaffId.trim() === '') {
          setFormError("Preferred staff ID cannot be empty. Please select a staff member or leave it unassigned.");
          return;
        }
      }
      
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

      // Build updated task object with proper preferred staff handling
      const updatedTask: Partial<RecurringTask> = {
        id: task.id,
        name: data.name,
        description: data.description,
        estimatedHours: data.estimatedHours,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        requiredSkills: selectedSkills as SkillType[],
        preferredStaffId: data.preferredStaffId === null || data.preferredStaffId === undefined ? null : data.preferredStaffId,
        recurrencePattern: recurrencePattern,
        isActive: task.isActive
      };

      console.log('Updated task object:', updatedTask);
      console.log('Final preferred staff ID:', updatedTask.preferredStaffId);

      await onSave(updatedTask);
      onSuccess();
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error saving task:", error);
      setFormError(error instanceof Error ? error.message : "Failed to update task");
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper function to manually reset form (useful for testing and debugging)
  const resetForm = () => {
    if (task) {
      const formValues = getDefaultFormValues(task);
      form.reset(formValues);
      setSelectedSkills(task.requiredSkills || []);
      setFormError(null);
      setSkillsError(null);
      console.log('Form manually reset with preferred staff ID:', formValues.preferredStaffId);
    }
  };

  return {
    form,
    isSaving,
    formError,
    selectedSkills,
    setSelectedSkills,
    skillsError,
    toggleSkill,
    onSubmit,
    resetForm // Expose reset function for testing
  };
};
