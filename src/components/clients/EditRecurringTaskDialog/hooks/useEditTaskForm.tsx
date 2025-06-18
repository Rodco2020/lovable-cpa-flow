import { useState, useEffect } from 'react';
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
  
  // PHASE 4: Enhanced error tracking and recovery state
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSuccessfulSave, setLastSuccessfulSave] = useState<Date | null>(null);
  
  console.log('🚀 [useEditTaskForm] PHASE 4 - Hook initialized with enhanced error handling:', {
    taskId: task?.id,
    taskPreferredStaffId: task?.preferredStaffId,
    taskPreferredStaffIdType: typeof task?.preferredStaffId,
    isTaskAvailable: !!task,
    submitAttempts,
    lastSuccessfulSave,
    timestamp: new Date().toISOString()
  });

  // PHASE 4: Enhanced helper function with error handling
  const normalizePreferredStaffId = (value: string | null | undefined): string | null => {
    try {
      if (value === undefined || value === '') {
        return null;
      }
      
      // PHASE 4: Additional validation for UUID format
      if (value !== null && typeof value === 'string') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
          console.warn('⚠️ [useEditTaskForm] PHASE 4 - Invalid UUID format detected:', value);
          return null;
        }
      }
      
      return value;
    } catch (error) {
      console.error('💥 [useEditTaskForm] PHASE 4 - Error normalizing staff ID:', error);
      return null;
    }
  };
  
  // Initialize form with enhanced error handling
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
      preferredStaffId: normalizePreferredStaffId(task.preferredStaffId),
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

  // PHASE 4: Enhanced form initialization logging
  useEffect(() => {
    const formValues = form.getValues();
    console.log('📋 [useEditTaskForm] PHASE 4 - Form initialized with enhanced error handling:', {
      preferredStaffId: formValues.preferredStaffId,
      preferredStaffIdType: typeof formValues.preferredStaffId,
      allFormValues: formValues,
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

  // PHASE 4: Enhanced form reset with better error recovery
  useEffect(() => {
    if (task) {
      console.log('🔄 [useEditTaskForm] PHASE 4 - Resetting form with enhanced error handling:', {
        taskId: task.id,
        originalPreferredStaffId: task.preferredStaffId,
        normalizedPreferredStaffId: normalizePreferredStaffId(task.preferredStaffId),
        preferredStaffIdType: typeof task.preferredStaffId,
        submitAttempts,
        timestamp: new Date().toISOString()
      });

      const normalizedStaffId = normalizePreferredStaffId(task.preferredStaffId);

      const resetValues = {
        name: task.name,
        description: task.description || '',
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        category: task.category,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        isRecurring: true,
        requiredSkills: task.requiredSkills || [],
        preferredStaffId: normalizedStaffId,
        recurrenceType: task.recurrencePattern.type,
        interval: task.recurrencePattern.interval || 1,
        weekdays: task.recurrencePattern.weekdays || [],
        dayOfMonth: task.recurrencePattern.dayOfMonth,
        monthOfYear: task.recurrencePattern.monthOfYear,
        endDate: task.recurrencePattern.endDate ? new Date(task.recurrencePattern.endDate) : null,
        customOffsetDays: task.recurrencePattern.customOffsetDays
      };

      form.reset(resetValues);
      setSelectedSkills(task.requiredSkills || []);
      setFormError(null);
      setSkillsError(null);
      setSubmitAttempts(0); // PHASE 4: Reset attempt counter

      // PHASE 4: Enhanced reset verification with error recovery
      setTimeout(() => {
        const currentFormValues = form.getValues();
        const preferredStaffMatch = currentFormValues.preferredStaffId === resetValues.preferredStaffId;
        console.log('✅ [useEditTaskForm] PHASE 4 - Form reset verification with error handling:', {
          expectedPreferredStaffId: resetValues.preferredStaffId,
          actualPreferredStaffId: currentFormValues.preferredStaffId,
          resetSuccessful: preferredStaffMatch,
          allCurrentValues: currentFormValues,
          timestamp: new Date().toISOString()
        });

        if (!preferredStaffMatch) {
          console.error('💥 [useEditTaskForm] PHASE 4 - Form reset failed, attempting recovery...');
          // PHASE 4: Attempt to recover from reset failure
          try {
            form.setValue('preferredStaffId', resetValues.preferredStaffId);
          } catch (recoveryError) {
            console.error('💥 [useEditTaskForm] PHASE 4 - Reset recovery failed:', recoveryError);
            StaffSelectionErrorHandler.handleError(recoveryError, {
              context: 'form_reset_recovery',
              taskId: task.id,
              expectedValue: resetValues.preferredStaffId
            });
          }
        }
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
  
  // PHASE 4: Enhanced form submission with comprehensive error handling
  const onSubmit = async (data: EditTaskFormValues) => {
    console.log('🚀 [useEditTaskForm] PHASE 4 - Form submission with enhanced error handling:', {
      formData: data,
      preferredStaffId: data.preferredStaffId,
      preferredStaffIdType: typeof data.preferredStaffId,
      isPreferredStaffNull: data.preferredStaffId === null,
      submitAttempt: submitAttempts + 1,
      timestamp: new Date().toISOString()
    });

    if (!task) {
      const error = "No task data available to update";
      setFormError(error);
      console.error('❌ [useEditTaskForm] PHASE 4 - No task data available');
      StaffSelectionErrorHandler.handleError(new Error(error), {
        context: 'missing_task_data',
        submitAttempt: submitAttempts + 1
      });
      return;
    }
    
    if (selectedSkills.length === 0) {
      const error = 'At least one skill is required';
      setSkillsError(error);
      console.error('❌ [useEditTaskForm] PHASE 4 - No skills selected');
      return;
    }

    // PHASE 4: Enhanced validation for preferred staff
    if (data.preferredStaffId !== null && typeof data.preferredStaffId !== 'string') {
      const error = "Invalid preferred staff selection";
      setFormError(error);
      console.error('❌ [useEditTaskForm] PHASE 4 - Invalid preferred staff value type:', {
        value: data.preferredStaffId,
        type: typeof data.preferredStaffId
      });
      StaffSelectionErrorHandler.handleError(new Error(error), {
        context: 'invalid_staff_type',
        staffId: data.preferredStaffId,
        expectedType: 'string',
        actualType: typeof data.preferredStaffId
      });
      return;
    }
    
    setIsSaving(true);
    setFormError(null);
    setSubmitAttempts(prev => prev + 1);
    
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

      // PHASE 4: Enhanced task object construction with proper null handling
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

      console.log('📤 [useEditTaskForm] PHASE 4 - Sending update with enhanced error handling:', {
        taskId: task.id,
        updatedTask,
        preferredStaffId: updatedTask.preferredStaffId,
        preferredStaffIdType: typeof updatedTask.preferredStaffId,
        isPreferredStaffNull: updatedTask.preferredStaffId === null,
        submitAttempt: submitAttempts,
        timestamp: new Date().toISOString()
      });

      await onSave(updatedTask);
      
      // PHASE 4: Track successful save
      setLastSuccessfulSave(new Date());
      setSubmitAttempts(0); // Reset on success
      onSuccess();
      
      console.log('✅ [useEditTaskForm] PHASE 4 - Task update completed successfully with enhanced handling:', {
        taskId: task.id,
        lastSuccessfulSave: new Date(),
        timestamp: new Date().toISOString()
      });
      
      toast.success("Task updated successfully", {
        description: data.preferredStaffId 
          ? "Staff preference has been saved"
          : "Task will be assigned automatically"
      });
    } catch (error) {
      console.error("💥 [useEditTaskForm] PHASE 4 - Error saving task with enhanced handling:", {
        error,
        taskId: task?.id,
        submitAttempt: submitAttempts,
        timestamp: new Date().toISOString()
      });
      
      // PHASE 4: Use enhanced error handler
      const handledError = StaffSelectionErrorHandler.handleError(error, {
        context: 'form_submission',
        taskId: task.id,
        submitAttempt: submitAttempts,
        preferredStaffId: data.preferredStaffId,
        formData: data
      }, {
        showToast: true,
        logError: true
      });
      
      setFormError(handledError.message);
      
      // PHASE 4: Provide recovery suggestions
      const recoverySuggestion = StaffSelectionErrorHandler.getRecoverySuggestion(handledError);
      if (recoverySuggestion) {
        setTimeout(() => {
          toast.info("Suggestion", {
            description: recoverySuggestion,
            duration: 6000
          });
        }, 1000);
      }
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
