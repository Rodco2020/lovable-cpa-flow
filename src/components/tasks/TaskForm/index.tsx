
import React, { useState, useEffect } from 'react';
import { TaskTemplate, RecurringTask, SkillType } from '@/types/task';
import { Client } from '@/types/client';
import { getTaskTemplates } from '@/services/taskService';
import { getAllClients } from '@/services/clientService';
import { toast } from 'sonner';
import { createRecurringTask, createAdHocTask } from '@/services/taskService';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader, CheckCircle2 } from 'lucide-react';
import TaskBasicInfoForm from './TaskBasicInfoForm';
import RecurrenceSettingsForm from './RecurrenceSettingsForm';
import TaskDateSelector from './TaskDateSelector';
import TaskSummary from './TaskSummary';
import useTaskForm from '@/hooks/useTaskForm';

interface TaskFormProps {
  onClose: () => void;
  onSuccess?: (task: RecurringTask) => void;
}

/**
 * TaskForm Component
 * 
 * A comprehensive form for creating new client-assigned tasks, both ad-hoc and recurring.
 * This component handles the entire workflow from template selection to task submission,
 * including validation, error handling, and success notifications.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to call when the form is closed
 * @param {Function} props.onSuccess - Optional callback when a task is created successfully
 */
const TaskForm: React.FC<TaskFormProps> = ({ onClose, onSuccess }) => {
  // Use the task form custom hook for form state and logic
  const {
    taskForm,
    selectedTemplate,
    formErrors,
    isRecurring,
    setIsRecurring,
    handleInputChange,
    handleTemplateSelect,
    handleClientChange,
    handleWeekdayChange,
    validateForm,
    resetForm,
    setFormErrors,
    buildRecurrencePattern
  } = useTaskForm();
  
  // Component state
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Load task templates and clients when component mounts
   */
  useEffect(() => {
    loadResources();
  }, []);
  
  /**
   * Fetches templates and clients data from API
   */
  const loadResources = async () => {
    setIsLoading(true);
    try {
      // Load both resources in parallel for better performance
      const [templateData, clientData] = await Promise.all([
        getTaskTemplates(),
        getAllClients()
      ]);
      
      setTaskTemplates(templateData);
      setClients(clientData);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error("Failed to load necessary data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handles changes to recurrence type select element
   */
  const handleRecurrenceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(e);
  };
  
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
      
      let newTask;
      
      // Convert string[] to SkillType[] - ensuring the values are valid SkillType values
      const requiredSkills = taskForm.requiredSkills.filter((skill): skill is SkillType => {
        return ['Junior', 'Senior', 'CPA', 'Tax Specialist', 'Audit', 'Advisory', 'Bookkeeping'].includes(skill);
      });
      
      if (isRecurring) {
        // Create recurring task
        const recurrencePattern = buildRecurrencePattern();
        
        newTask = await createRecurringTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills, // Using the filtered SkillType array
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate),
          recurrencePattern,
          status: 'Unscheduled' // Add the status field
        });
      } else {
        // Create ad-hoc task
        newTask = await createAdHocTask({
          templateId: selectedTemplate.id,
          clientId: taskForm.clientId,
          name: taskForm.name,
          description: taskForm.description,
          estimatedHours: taskForm.estimatedHours,
          requiredSkills, // Using the filtered SkillType array
          priority: taskForm.priority,
          category: taskForm.category,
          dueDate: new Date(taskForm.dueDate),
          status: 'Unscheduled' // Add the status field for ad-hoc tasks too
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
  
  /**
   * Handler for template selection that calls the hook's handler
   */
  const onTemplateSelectHandler = (templateId: string) => {
    handleTemplateSelect(templateId, taskTemplates);
  };
  
  // Show loading state while resources are being fetched
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading resources...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4" role="form" aria-label="Task Creation Form">
      {/* Basic Information Form */}
      <TaskBasicInfoForm 
        taskTemplates={taskTemplates}
        clients={clients}
        selectedTemplate={selectedTemplate}
        taskForm={taskForm}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onTemplateSelect={onTemplateSelectHandler}
        onClientChange={handleClientChange}
        onInputChange={handleInputChange}
      />
      
      {selectedTemplate && (
        <>
          {/* Recurring Task Toggle */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={isSubmitting}
                aria-label="Enable recurring task"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium">
                This is a recurring task
              </label>
            </div>
          </div>
          
          {/* Due Date and Recurrence */}
          <div className="grid grid-cols-2 gap-4">
            <TaskDateSelector 
              isRecurring={isRecurring}
              dueDate={taskForm.dueDate}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
            />
            
            {isRecurring && (
              <div className="space-y-2">
                <label htmlFor="recurrenceType" className="text-sm font-medium">
                  Recurrence Pattern
                </label>
                <select
                  id="recurrenceType"
                  name="recurrenceType"
                  value={taskForm.recurrenceType}
                  onChange={handleRecurrenceTypeChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={isSubmitting}
                  aria-label="Recurrence Pattern"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            )}
          </div>
          
          {/* Recurrence Settings */}
          {isRecurring && (
            <RecurrenceSettingsForm 
              taskForm={taskForm}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              onInputChange={handleInputChange}
              handleWeekdayChange={handleWeekdayChange}
            />
          )}
          
          {/* Summary before submission */}
          <TaskSummary 
            isRecurring={isRecurring}
            category={taskForm.category}
            dueDate={taskForm.dueDate}
            recurrenceType={taskForm.recurrenceType}
            endDate={taskForm.endDate}
          />
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Cancel task creation"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedTemplate || !taskForm.clientId}
              aria-label={isRecurring ? "Create recurring task" : "Create ad-hoc task"}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {isRecurring ? 'Creating Recurring Task...' : 'Creating Ad-hoc Task...'}
                </>
              ) : (
                isRecurring ? 'Create Recurring Task' : 'Create Ad-hoc Task'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskForm;
