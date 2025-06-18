
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { RecurringTask } from '@/types/task';
import { updateRecurringTask } from '@/services/taskService';
import { skillValidationService } from '@/services/skillValidationService';
import { toast } from 'sonner';
import { EditTaskSchema, EditTaskFormValues, UseEditTaskFormOptions } from '../types';

export const useEditTaskForm = ({ task, onSave, onSuccess }: UseEditTaskFormOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
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

  // Initialize form with task data - mapping from RecurringTask interface to form values
  useEffect(() => {
    if (task) {
      // Map RecurringTask properties to form values using the consistent interface
      form.reset({
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
      });
      
      // Set selected skills (these are already skill IDs from the database)
      setSelectedSkills(task.requiredSkills || []);
    }
  }, [task, form]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
      
      // Update form field as well
      form.setValue('requiredSkills', newSkills);
      return newSkills;
    });
    setSkillsError(null);
  };

  const resetForm = () => {
    form.reset();
    setSelectedSkills([]);
    setFormError(null);
    setSkillsError(null);
  };

  const onSubmit = async (formData: EditTaskFormValues) => {
    if (!task) return;

    // Validate that at least one skill is selected
    if (selectedSkills.length === 0) {
      setSkillsError('At least one skill must be selected');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      // Validate selected skills against database
      const skillValidation = await skillValidationService.validateSkillIds(selectedSkills);
      
      if (skillValidation.invalid.length > 0) {
        setSkillsError('Some selected skills are invalid. Please refresh and try again.');
        return;
      }

      // Prepare update data - mapping form values back to the service layer format
      const updateData = {
        name: formData.name,
        description: formData.description,
        estimated_hours: formData.estimatedHours,
        priority: formData.priority,
        category: formData.category,
        required_skills: skillValidation.valid, // Use validated skill IDs
        preferred_staff_id: formData.preferredStaffId,
        
        // Map recurrence pattern back to database format
        recurrence_type: formData.recurrenceType,
        recurrence_interval: formData.interval,
        weekdays: formData.weekdays,
        day_of_month: formData.dayOfMonth,
        month_of_year: formData.monthOfYear,
        end_date: formData.endDate,
        custom_offset_days: formData.customOffsetDays,
        due_date: formData.dueDate,
      };

      const updatedTask = await updateRecurringTask(task.id, updateData);
      
      if (updatedTask) {
        toast.success('Task updated successfully');
        onSave(updatedTask);
        onSuccess();
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setFormError(errorMessage);
      toast.error(errorMessage);
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
