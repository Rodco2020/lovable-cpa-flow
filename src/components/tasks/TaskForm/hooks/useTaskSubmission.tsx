
import { useState } from 'react';
import { TaskTemplate, RecurringTask, SkillType } from '@/types/task';
import { createRecurringTask, createAdHocTask } from '@/services/taskService';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface UseTaskSubmissionProps {
  selectedTemplate: TaskTemplate | null;
  isRecurring: boolean;
  taskForm: any;
  buildRecurrencePattern: () => any;
  validateForm: () => boolean;
  formErrors: Record<string, string>;
  resetForm: () => void;
  onClose: () => void;
  onSuccess?: (task: RecurringTask) => void;
}

/**
 * Custom hook for handling task form submission
 * Manages submission state, validation, and API calls
 */
export const useTaskSubmission = ({
  selectedTemplate,
  isRecurring,
  taskForm,
  buildRecurrencePattern,
  validateForm,
  formErrors,
  resetForm,
  onClose,
  onSuccess
}: UseTaskSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles form submission to create a task
   * Validates form, creates task via API, and shows appropriate notifications
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (!selectedTemplate) {
      toast.error("Please select a task template");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const loadingToastId = toast.loading(
        isRecurring ? "Creating recurring task..." : "Creating ad-hoc task..."
      );
      
      let newTask;
      
      const requiredSkills = taskForm.requiredSkills.filter((skill): skill is SkillType => {
        return ['Junior', 'Senior', 'CPA', 'Tax Specialist', 'Audit', 'Advisory', 'Bookkeeping'].includes(skill);
      });
      
      if (isRecurring) {
        const recurrencePattern = buildRecurrencePattern();
        
        newTask = await createRecurringTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills,
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate),
          recurrenceType: taskForm.recurrenceType, // Added missing recurrenceType
          recurrencePattern
        });
      } else {
        newTask = await createAdHocTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills,
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate),
          recurringTaskId: 'temp-id' // Added missing required field
        });
      }
      
      toast.dismiss(loadingToastId);
      
      if (newTask) {
        toast.success(
          isRecurring ? "Recurring task created successfully!" : "Ad-hoc task created successfully!",
          {
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
          }
        );
        
        if (onSuccess && isRecurring) {
          onSuccess(newTask as RecurringTask);
        }
        
        resetForm();
        onClose();
      } else {
        toast.error("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(
        "Failed to create task. Please try again.",
        {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
