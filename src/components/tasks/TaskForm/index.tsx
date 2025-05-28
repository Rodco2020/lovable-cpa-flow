
import React from 'react';
import { RecurringTask } from '@/types/task';
import TaskFormHeader from './components/TaskFormHeader';
import TaskFormLayout from './components/TaskFormLayout';
import useTaskForm from '@/hooks/useTaskForm';
import { useTaskFormData } from './hooks/useTaskFormData';
import { useTaskSubmission } from './hooks/useTaskSubmission';

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
    buildRecurrencePattern
  } = useTaskForm();
  
  // Use custom hook for data loading
  const { taskTemplates, clients, isLoading } = useTaskFormData();
  
  // Use custom hook for form submission
  const { isSubmitting, handleSubmit } = useTaskSubmission({
    selectedTemplate,
    isRecurring,
    taskForm,
    buildRecurrencePattern,
    validateForm,
    formErrors,
    resetForm,
    onClose,
    onSuccess
  });
  
  /**
   * Handler for template selection that calls the hook's handler
   */
  const onTemplateSelectHandler = (templateId: string) => {
    handleTemplateSelect(templateId, taskTemplates);
  };
  
  // Show loading state while resources are being fetched
  if (isLoading) {
    return <TaskFormHeader />;
  }
  
  return (
    <TaskFormLayout 
      taskTemplates={taskTemplates}
      clients={clients}
      selectedTemplate={selectedTemplate}
      taskForm={taskForm}
      formErrors={formErrors}
      isSubmitting={isSubmitting}
      isRecurring={isRecurring}
      setIsRecurring={setIsRecurring}
      onTemplateSelect={onTemplateSelectHandler}
      onClientChange={handleClientChange}
      onInputChange={handleInputChange}
      handleWeekdayChange={handleWeekdayChange}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default TaskForm;
