
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
  
  // PHASE 1: Enhanced logging for task initialization
  console.log('🚀 [useEditTaskForm] Hook initialized:', {
    taskId: task?.id,
    taskPreferredStaffId: task?.preferredStaffId,
    taskPreferredStaffIdType: typeof task?.preferredStaffId,
    timestamp: new Date().toISOString()
  });
  
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
      preferredStaffId: task.preferredStaffId || null, // PHASE 1: Enhanced logging will track this
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
      preferredStaffId: null,
      interval: 1,
      weekdays: [],
      dayOfMonth: 15,
      monthOfYear: 1,
      customOffsetDays: 0
    }
  });

  // PHASE 1: Log form values after initialization
  useEffect(() => {
    console.log('📋 [useEditTaskForm] Form initialized with values:', {
      preferredStaffId: form.getValues('preferredStaffId'),
      allFormValues: form.getValues(),
      timestamp: new Date().toISOString()
    });
  }, [form]);

  // Update selected skills state when form values change
  useEffect(() => {
    if (task?.requiredSkills) {
      console.log('🎯 [useEditTaskForm] Setting selected skills:', {
        skills: task.requiredSkills,
        timestamp: new Date().toISOString()
      });
      setSelectedSkills(task.requiredSkills);
      form.setValue('requiredSkills', task.requiredSkills);
    }
  }, [task, form]);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      console.log('🔄 [useEditTaskForm] Resetting form with new task data:', {
        taskId: task.id,
        originalPreferredStaffId: task.preferredStaffId,
        preferredStaffIdType: typeof task.preferredStaffId,
        timestamp: new Date().toISOString()
      });

      const resetValues = {
        name: task.name,
        description: task.description || '',
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        isRecurring: true,
        requiredSkills: task.requiredSkills || [],
        preferredStaffId: task.preferredStaffId || null,
        recurrenceType: task.recurrencePattern.type,
        interval: task.recurrencePattern.interval || 1,
        weekdays: task.recurrencePattern.weekdays || [],
        dayOfMonth: task.recurrencePattern.dayOfMonth,
        monthOfYear: task.recurrencePattern.monthOfYear,
        endDate: task.recurrencePattern.endDate ? new Date(task.recurrencePattern.endDate) : null,
        customOffsetDays: task.recurrencePattern.customOffsetDays
      };

      console.log('📝 [useEditTaskForm] Reset values being applied:', {
        preferredStaffId: resetValues.preferredStaffId,
        resetValues,
        timestamp: new Date().toISOString()
      });

      form.reset(resetValues);
      setSelectedSkills(task.requiredSkills || []);
      setFormError(null);
      setSkillsError(null);

      // PHASE 1: Verify reset was successful
      setTimeout(() => {
        const currentFormValues = form.getValues();
        console.log('✅ [useEditTaskForm] Form reset verification:', {
          expectedPreferredStaffId: resetValues.preferredStaffId,
          actualPreferredStaffId: currentFormValues.preferredStaffId,
          resetSuccessful: currentFormValues.preferredStaffId === resetValues.preferredStaffId,
          allCurrentValues: currentFormValues,
          timestamp: new Date().toISOString()
        });
      }, 0);
    }
  }, [task, form]);
  
  // Handle skill selection
  const toggleSkill = (skillId: string) => {
    let updatedSkills: string[];
    
    if (selectedSkills.includes(skillId)) {
      updatedSkills = selectedSkills.filter(s => s !== skillId);
    } else {
      updatedSkills = [...selectedSkills, skillId];
    }
    
    console.log('🔧 [useEditTaskForm] Skills updated:', {
      previousSkills: selectedSkills,
      updatedSkills,
      timestamp: new Date().toISOString()
    });
    
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
    console.log('🚀 [useEditTaskForm] Form submission started:', {
      formData: data,
      preferredStaffId: data.preferredStaffId,
      preferredStaffIdType: typeof data.preferredStaffId,
      timestamp: new Date().toISOString()
    });

    if (!task) {
      setFormError("No task data available to update");
      console.error('❌ [useEditTaskForm] No task data available for update');
      return;
    }
    
    if (selectedSkills.length === 0) {
      setSkillsError('At least one skill is required');
      console.error('❌ [useEditTaskForm] No skills selected');
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
        preferredStaffId: data.preferredStaffId || null,
        recurrencePattern: recurrencePattern,
        isActive: task.isActive
      };

      console.log('📤 [useEditTaskForm] Sending update to service:', {
        taskId: task.id,
        updatedTask,
        preferredStaffId: updatedTask.preferredStaffId,
        preferredStaffIdType: typeof updatedTask.preferredStaffId,
        timestamp: new Date().toISOString()
      });

      await onSave(updatedTask);
      onSuccess();
      
      console.log('✅ [useEditTaskForm] Task update completed successfully:', {
        taskId: task.id,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("💥 [useEditTaskForm] Error saving task:", {
        error,
        taskId: task?.id,
        timestamp: new Date().toISOString()
      });
      setFormError(error instanceof Error ? error.message : "Failed to update task");
      toast.error("Failed to update task");
    } finally {
      setIsSaving(false);
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
    onSubmit
  };
};
