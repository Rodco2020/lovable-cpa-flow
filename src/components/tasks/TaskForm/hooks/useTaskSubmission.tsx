
import { useState } from 'react';
import { TaskTemplate, RecurringTask } from '@/types/task';
import { createRecurringTask, createAdHocTask } from '@/services/taskService';
import { skillValidationService } from '@/services/skillValidationService';
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
    // Validate the form
    if (!validateForm()) {
      // Show a toast for validation errors
      toast.error("Please fix the form errors before submitting");
      
      // Scroll to the first error if any
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
      // Show in-progress toast with ID for later reference
      const loadingToastId = toast.loading(
        isRecurring ? "Creating recurring task..." : "Creating ad-hoc task..."
      );
      
      // Validate required skills against database
      const skillValidation = await skillValidationService.validateSkillIds(taskForm.requiredSkills);
      
      if (skillValidation.invalid.length > 0) {
        toast.dismiss(loadingToastId);
        toast.error(
          "Some selected skills are invalid",
          {
            description: `Invalid skills found. Please refresh the page and try again.`,
            icon: <AlertCircle className="h-5 w-5 text-red-500" />
          }
        );
        return;
      }
      
      let newTask;
      
      if (isRecurring) {
        // Create recurring task
        const recurrencePattern = buildRecurrencePattern();
        
        newTask = await createRecurringTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills: skillValidation.valid, // Use validated skill IDs
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate),
          recurrencePattern
        });
      } else {
        // Create ad-hoc task
        newTask = await createAdHocTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills: skillValidation.valid, // Use validated skill IDs
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate)
        });
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      if (newTask) {
        // Show success toast with checkmark icon
        toast.success(
          isRecurring ? "Recurring task created successfully!" : "Ad-hoc task created successfully!",
          {
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
          }
        );
        
        // Call onSuccess if provided
        if (onSuccess && isRecurring) {
          onSuccess(newTask as RecurringTask);
        }
        
        // Reset form and close dialog
        resetForm();
        onClose();
      } else {
        toast.error("Failed to create task. Please try again.");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(
        "An error occurred while creating the task", 
        { 
          description: error instanceof Error ? error.message : "Please try again or contact support",
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
