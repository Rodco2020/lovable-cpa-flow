
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RecurringTask, TaskPriority, TaskCategory, SkillType } from '@/types/task';
import { EditTaskSchema, EditTaskFormValues, UseEditTaskFormOptions, UseEditTaskFormReturn } from '../types';
import { StaffSelectionErrorHandler } from '@/services/clientTask/staffSelectionErrorHandler';

export const useEditTaskForm = ({ 
  task, 
  onSave, 
  onSuccess 
}: UseEditTaskFormOptions): UseEditTaskFormReturn => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  console.log('🚀 [useEditTaskForm] Hook initialization:', {
    taskId: task?.id,
    taskAvailable: !!task,
    timestamp: new Date().toISOString()
  });

  // Memoized default values to prevent unnecessary re-renders
  const defaultValues = useMemo(() => {
    if (!task) {
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
    }

    return {
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
  }, [task]);

  // Initialize form with simplified logic
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(EditTaskSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Initialize selected skills when task changes
  useEffect(() => {
    if (task?.requiredSkills && !isInitialized) {
      console.log('🎯 [useEditTaskForm] Initializing selected skills:', {
        skills: task.requiredSkills,
        timestamp: new Date().toISOString()
      });
      setSelectedSkills(task.requiredSkills);
      setIsInitialized(true);
    }
  }, [task, isInitialized]);

  // Reset form when task changes with proper cleanup
  useEffect(() => {
    if (task && isInitialized) {
      console.log('🔄 [useEditTaskForm] Resetting form for task change:', {
        taskId: task.id,
        timestamp: new Date().toISOString()
      });

      form.reset(defaultValues);
      setSelectedSkills(task.requiredSkills || []);
      setFormError(null);
      setSkillsError(null);
    }

    // Cleanup function
    return () => {
      setFormError(null);
      setSkillsError(null);
    };
  }, [task, defaultValues, form, isInitialized]);

  // Handle skill selection with improved error handling
  const toggleSkill = useCallback((skillId: string) => {
    setSelectedSkills(prevSkills => {
      const updatedSkills = prevSkills.includes(skillId)
        ? prevSkills.filter(s => s !== skillId)
        : [...prevSkills, skillId];
      
      console.log('🔧 [useEditTaskForm] Skills updated:', {
        previousSkills: prevSkills,
        updatedSkills,
        timestamp: new Date().toISOString()
      });
      
      form.setValue('requiredSkills', updatedSkills);
      
      if (updatedSkills.length === 0) {
        setSkillsError('At least one skill is required');
      } else {
        setSkillsError(null);
      }
      
      return updatedSkills;
    });
  }, [form]);
  
  // Enhanced form submission with comprehensive logging
  const onSubmit = useCallback(async (data: EditTaskFormValues) => {
    console.log('🚀 [useEditTaskForm] Form submission started:', {
      formData: data,
      preferredStaffId: data.preferredStaffId,
      timestamp: new Date().toISOString()
    });
    
    // Log detailed preferred staff information
    console.log('👤 [useEditTaskForm] Preferred Staff Details:', {
      value: data.preferredStaffId,
      type: typeof data.preferredStaffId,
      isNull: data.preferredStaffId === null,
      isString: typeof data.preferredStaffId === 'string',
      length: data.preferredStaffId ? data.preferredStaffId.length : 0,
      isValidUUID: data.preferredStaffId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.preferredStaffId) : false
    });

    if (!task) {
      const error = "No task data available to update";
      setFormError(error);
      console.error('❌ [useEditTaskForm] No task data available');
      return;
    }
    
    if (selectedSkills.length === 0) {
      const error = 'At least one skill is required';
      setSkillsError(error);
      console.error('❌ [useEditTaskForm] No skills selected');
      return;
    }

    // Validate preferred staff value
    if (data.preferredStaffId !== null && typeof data.preferredStaffId !== 'string') {
      const error = "Invalid preferred staff selection";
      setFormError(error);
      console.error('❌ [useEditTaskForm] Invalid preferred staff value:', {
        value: data.preferredStaffId,
        type: typeof data.preferredStaffId
      });
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

      // Build task object
      const updatedTask: Partial<RecurringTask> = {
        id: task.id,
        name: data.name,
        description: data.description,
        estimatedHours: data.estimatedHours,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        requiredSkills: selectedSkills as SkillType[],
        preferredStaffId: data.preferredStaffId,
        recurrencePattern: recurrencePattern,
        isActive: task.isActive
      };

      console.log('📤 [useEditTaskForm] Sending API update:', {
        taskId: task.id,
        updatedTask,
        preferredStaffBeingSubmitted: updatedTask.preferredStaffId,
        timestamp: new Date().toISOString()
      });

      await onSave(updatedTask);
      onSuccess();
      
      console.log('✅ [useEditTaskForm] Task update completed successfully');
      console.log('🎉 [useEditTaskForm] Final submitted preferred staff:', updatedTask.preferredStaffId);
      
      toast.success("Task updated successfully", {
        description: data.preferredStaffId 
          ? "Staff preference has been saved"
          : "Task will be assigned automatically"
      });
    } catch (error) {
      console.error("💥 [useEditTaskForm] Error saving task:", {
        error,
        taskId: task?.id,
        timestamp: new Date().toISOString()
      });
      
      const handledError = StaffSelectionErrorHandler.handleError(error, {
        context: 'form_submission',
        taskId: task.id,
        preferredStaffId: data.preferredStaffId,
        formData: data
      }, {
        showToast: true,
        logError: true
      });
      
      setFormError(handledError.message);
    } finally {
      setIsSaving(false);
    }
  }, [task, selectedSkills, onSave, onSuccess]);

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
