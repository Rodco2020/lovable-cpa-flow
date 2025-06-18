
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { RecurringTask } from '@/types/task';
import { updateRecurringTask } from '@/services/taskService';
import { skillValidationService } from '@/services/skillValidationService';
import { toast } from 'sonner';

// Form validation schema
const editTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  estimatedHours: z.number().min(0.25, 'Estimated hours must be at least 0.25'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  category: z.enum(['Tax', 'Audit', 'Advisory', 'Compliance', 'Bookkeeping', 'Other']),
  recurrenceType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually']),
  recurrenceInterval: z.number().min(1).optional(),
  weekdays: z.array(z.number()).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  monthOfYear: z.number().min(1).max(12).optional(),
  preferredStaffId: z.string().nullable().optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

interface UseEditTaskFormProps {
  task: RecurringTask | null;
  onSave: (updatedTask: RecurringTask) => void;
  onSuccess: () => void;
}

export const useEditTaskForm = ({ task, onSave, onSuccess }: UseEditTaskFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: '',
      description: '',
      estimatedHours: 1,
      priority: 'Medium',
      category: 'Other',
      recurrenceType: 'Monthly',
      recurrenceInterval: 1,
      weekdays: [],
      dayOfMonth: 1,
      monthOfYear: 1,
      preferredStaffId: null,
    },
  });

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description || '',
        estimatedHours: Number(task.estimated_hours),
        priority: task.priority as EditTaskFormData['priority'],
        category: task.category as EditTaskFormData['category'],
        recurrenceType: task.recurrence_type as EditTaskFormData['recurrenceType'],
        recurrenceInterval: task.recurrence_interval || 1,
        weekdays: task.weekdays || [],
        dayOfMonth: task.day_of_month || 1,
        monthOfYear: task.month_of_year || 1,
        preferredStaffId: task.preferred_staff_id || null,
      });
      
      // Set selected skills (these are already skill IDs from the database)
      setSelectedSkills(task.required_skills || []);
    }
  }, [task, form]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
    setSkillsError(null);
  };

  const onSubmit = async (formData: EditTaskFormData) => {
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

      // Prepare update data
      const updateData = {
        ...formData,
        required_skills: skillValidation.valid, // Use validated skill IDs
        estimated_hours: formData.estimatedHours,
        recurrence_interval: formData.recurrenceInterval,
        day_of_month: formData.dayOfMonth,
        month_of_year: formData.monthOfYear,
        preferred_staff_id: formData.preferredStaffId,
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
    skillsError,
    toggleSkill,
    onSubmit,
  };
};
