
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
  
  // Enhanced state tracking
  const [lastSuccessfulSave, setLastSuccessfulSave] = useState<Date | null>(null);
  
  console.log('🚀 [useEditTaskForm] Hook initialization with simplified preferred staff handling:', {
    taskId: task?.id,
    taskPreferredStaffId: task?.preferredStaffId,
    taskPreferredStaffIdType: typeof task?.preferredStaffId,
    isTaskAvailable: !!task,
    timestamp: new Date().toISOString()
  });
  
  // Initialize form with simplified defaultValues
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
      preferredStaffId: task.preferredStaffId || null, // Simplified: direct assignment
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
      preferredStaffId: null, // Always null for new tasks
      interval: 1,
      weekdays: [],
      dayOfMonth: 15,
      monthOfYear: 1,
      customOffsetDays: 0
    }
  });

  // Enhanced form initialization logging
  useEffect(() => {
    const formValues = form.getValues();
    console.log('📋 [useEditTaskForm] Form initialized with simplified preferred staff handling:', {
      preferredStaffId: formValues.preferredStaffId,
      preferredStaffIdType: typeof formValues.preferredStaffId,
      taskPreferredStaffId: task?.preferredStaffId,
      taskPreferredStaffIdType: typeof task?.preferredStaffId,
      formInitializedCorrectly: formValues.preferredStaffId === (task?.preferredStaffId || null),
      allFormValues: formValues,
      timestamp: new Date().toISOString()
    });
  }, [form, task]);

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

  // Enhanced form reset with simplified preferred staff handling
  useEffect(() => {
    if (task) {
      console.log('🔄 [useEditTaskForm] Resetting form with simplified preferred staff handling:', {
        taskId: task.id,
        taskPreferredStaffId: task.preferredStaffId,
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
        preferredStaffId: task.preferredStaffId || null, // Simplified: direct assignment
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

      // Enhanced reset verification
      setTimeout(() => {
        const currentFormValues = form.getValues();
        const preferredStaffMatch = currentFormValues.preferredStaffId === resetValues.preferredStaffId;
        console.log('✅ [useEditTaskForm] Form reset verification with simplified handling:', {
          expectedPreferredStaffId: resetValues.preferredStaffId,
          actualPreferredStaffId: currentFormValues.preferredStaffId,
          resetSuccessful: preferredStaffMatch,
          taskPreferredStaffId: task.preferredStaffId,
          timestamp: new Date().toISOString()
        });

        if (!preferredStaffMatch) {
          console.error('💥 [useEditTaskForm] Form reset failed, attempting recovery...');
          try {
            form.setValue('preferredStaffId', resetValues.preferredStaffId);
            console.log('🔧 [useEditTaskForm] Recovery setValue completed');
          } catch (recoveryError) {
            console.error('💥 [useEditTaskForm] Reset recovery failed:', recoveryError);
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
  
  // Enhanced form submission with comprehensive validation
  const onSubmit = async (data: EditTaskFormValues) => {
    console.log('🚀 [useEditTaskForm] Form submission with simplified preferred staff handling:', {
      formData: data,
      preferredStaffId: data.preferredStaffId,
      preferredStaffIdType: typeof data.preferredStaffId,
      isPreferredStaffNull: data.preferredStaffId === null,
      timestamp: new Date().toISOString()
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
      console.error('❌ [useEditTaskForm] Invalid preferred staff value type:', {
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

      // Build task object with simplified preferred staff handling
      const updatedTask: Partial<RecurringTask> = {
        id: task.id,
        name: data.name,
        description: data.description,
        estimatedHours: data.estimatedHours,
        priority: data.priority,
        category: data.category,
        dueDate: data.dueDate,
        requiredSkills: selectedSkills as SkillType[],
        preferredStaffId: data.preferredStaffId, // Direct assignment - no normalization
        recurrencePattern: recurrencePattern,
        isActive: task.isActive
      };

      console.log('📤 [useEditTaskForm] Sending update with simplified preferred staff handling:', {
        taskId: task.id,
        updatedTask,
        preferredStaffId: updatedTask.preferredStaffId,
        preferredStaffIdType: typeof updatedTask.preferredStaffId,
        isPreferredStaffNull: updatedTask.preferredStaffId === null,
        timestamp: new Date().toISOString()
      });

      await onSave(updatedTask);
      
      // Track successful save
      setLastSuccessfulSave(new Date());
      onSuccess();
      
      console.log('✅ [useEditTaskForm] Task update completed successfully with simplified handling:', {
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
      console.error("💥 [useEditTaskForm] Error saving task with simplified handling:", {
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
