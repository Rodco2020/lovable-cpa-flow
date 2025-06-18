
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { RecurringTask } from '@/types/task';
import { skillValidationService } from '@/services/skillValidationService';
import { toast } from 'sonner';
import { EditTaskSchema, EditTaskFormValues, UseEditTaskFormOptions } from '../types';

export const useEditTaskForm = ({ task, onSave, onSuccess }: UseEditTaskFormOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(EditTaskSchema),
    defaultValues: {
      name: '',
      description: '',
      estimatedHours: 1,
      priority: 'Medium',
      category: 'Other',
      requiredSkills: [],
      preferredStaffId: null,
      isRecurring: true,
      recurrenceType: 'Monthly',
      interval: 1,
      weekdays: [],
      dayOfMonth: 1,
      monthOfYear: 1,
      endDate: null,
      customOffsetDays: undefined,
      dueDate: undefined,
    },
  });

  // Watch requiredSkills to keep it in sync
  const selectedSkills = form.watch('requiredSkills') || [];

  // Initialize form with task data - proper mapping from RecurringTask interface to form values
  useEffect(() => {
    if (task) {
      console.log('[useEditTaskForm] ============= FORM INITIALIZATION START =============');
      console.log('[useEditTaskForm] Initializing form with task data:', JSON.stringify(task, null, 2));
      console.log('[useEditTaskForm] Task preferredStaffId:', task.preferredStaffId);
      console.log('[useEditTaskForm] Task preferredStaffId type:', typeof task.preferredStaffId);
      
      // Map RecurringTask properties to form values using consistent interface
      const formValues = {
        name: task.name,
        description: task.description || '',
        estimatedHours: Number(task.estimatedHours),
        priority: task.priority as EditTaskFormValues['priority'],
        category: task.category as EditTaskFormValues['category'],
        requiredSkills: task.requiredSkills || [],
        preferredStaffId: task.preferredStaffId || null,
        isRecurring: true,
        
        // Map recurrence pattern properties
        recurrenceType: task.recurrencePattern?.type as EditTaskFormValues['recurrenceType'] || 'Monthly',
        interval: task.recurrencePattern?.interval || 1,
        weekdays: task.recurrencePattern?.weekdays || [],
        dayOfMonth: task.recurrencePattern?.dayOfMonth || 1,
        monthOfYear: task.recurrencePattern?.monthOfYear || 1,
        endDate: task.recurrencePattern?.endDate || null,
        customOffsetDays: task.recurrencePattern?.customOffsetDays,
        dueDate: task.dueDate || undefined,
      };
      
      console.log('[useEditTaskForm] Form values to be set:', JSON.stringify(formValues, null, 2));
      console.log('[useEditTaskForm] Form preferredStaffId value:', formValues.preferredStaffId);
      
      form.reset(formValues);
      
      console.log('[useEditTaskForm] Form values after reset:', JSON.stringify(form.getValues(), null, 2));
      console.log('[useEditTaskForm] Form preferredStaffId after reset:', form.getValues('preferredStaffId'));
      console.log('[useEditTaskForm] ============= FORM INITIALIZATION END =============');
    }
  }, [task, form]);

  const setSelectedSkills = (skills: string[]) => {
    form.setValue('requiredSkills', skills, { shouldValidate: true });
    setSkillsError(null);
  };

  const toggleSkill = (skillId: string) => {
    const currentSkills = form.getValues('requiredSkills') || [];
    const newSkills = currentSkills.includes(skillId) 
      ? currentSkills.filter(id => id !== skillId)
      : [...currentSkills, skillId];
    
    form.setValue('requiredSkills', newSkills, { shouldValidate: true });
    setSkillsError(null);
  };

  const resetForm = () => {
    form.reset();
    setFormError(null);
    setSkillsError(null);
  };

  const onSubmit = async (formData: EditTaskFormValues) => {
    if (!task) {
      setFormError('Task data is not available');
      return;
    }

    console.log('[useEditTaskForm] ============= FORM SUBMISSION START =============');
    console.log('[useEditTaskForm] Starting form submission with data:', JSON.stringify(formData, null, 2));
    console.log('[useEditTaskForm] Form preferredStaffId:', formData.preferredStaffId);
    console.log('[useEditTaskForm] Form preferredStaffId type:', typeof formData.preferredStaffId);

    // Validate that at least one skill is selected
    if (!formData.requiredSkills || formData.requiredSkills.length === 0) {
      setSkillsError('At least one skill must be selected');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSkillsError(null);

    try {
      // Validate selected skills against database using enhanced service
      console.log('[useEditTaskForm] Validating skills:', formData.requiredSkills);
      const skillValidation = await skillValidationService.validateSkillIds(formData.requiredSkills);
      
      if (skillValidation.invalid.length > 0) {
        const invalidSkillsMessage = `Invalid skills detected: ${skillValidation.invalid.join(', ')}`;
        console.error('[useEditTaskForm] Skill validation failed:', invalidSkillsMessage);
        setSkillsError('Some selected skills are invalid. Please refresh and try again.');
        return;
      }

      console.log('[useEditTaskForm] Skills validated successfully, proceeding with update');

      // Create the update data object that matches the RecurringTask interface
      const updateData: Partial<RecurringTask> = {
        id: task.id, // Include ID for service layer
        name: formData.name,
        description: formData.description,
        estimatedHours: formData.estimatedHours,
        priority: formData.priority,
        category: formData.category,
        requiredSkills: skillValidation.valid, // Use validated skill IDs
        preferredStaffId: formData.preferredStaffId, // CRITICAL: Ensure this is included
        
        // Map recurrence pattern back to RecurringTask format
        recurrencePattern: {
          type: formData.recurrenceType,
          interval: formData.interval,
          weekdays: formData.weekdays,
          dayOfMonth: formData.dayOfMonth,
          monthOfYear: formData.monthOfYear,
          endDate: formData.endDate || undefined,
          customOffsetDays: formData.customOffsetDays,
        },
        dueDate: formData.dueDate || null,
      };

      console.log('[useEditTaskForm] Update data prepared:', JSON.stringify(updateData, null, 2));
      console.log('[useEditTaskForm] CRITICAL - preferredStaffId in update data:', updateData.preferredStaffId);

      // Call the parent's onSave function which will handle the actual service call
      await onSave(updateData);
      
      console.log('[useEditTaskForm] Update successful');
      console.log('[useEditTaskForm] ============= FORM SUBMISSION END =============');
      toast.success('Task updated successfully');
      onSuccess();
    } catch (error) {
      console.error('[useEditTaskForm] Error updating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setFormError(errorMessage);
      toast.error('Failed to update task');
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
    onSubmit,
    resetForm,
  };
};
