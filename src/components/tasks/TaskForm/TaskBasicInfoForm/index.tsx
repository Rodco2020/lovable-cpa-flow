
import React from 'react';
import { TaskPriority, TaskCategory, TaskTemplate } from '@/types/task';
import { Client } from '@/types/client';
import TemplateSelector from './TemplateSelector';
import ClientSelector from './ClientSelector';
import TaskDetailsForm from './TaskDetailsForm';
import TaskDescriptionField from './TaskDescriptionField';
import TaskCategoryPriorityForm from './TaskCategoryPriorityForm';

interface TaskBasicInfoFormProps {
  taskTemplates: TaskTemplate[];
  clients: Client[];
  selectedTemplate: TaskTemplate | null;
  taskForm: {
    name: string;
    description: string;
    clientId: string;
    estimatedHours: number;
    priority: TaskPriority;
    category: TaskCategory;
  };
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onTemplateSelect: (templateId: string) => void;
  onClientChange: (clientId: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Task Basic Information Form Component
 * 
 * Refactored form component that maintains the exact same functionality and UI
 * as the original implementation, but with improved code organization.
 * 
 * This component orchestrates all the basic task creation fields:
 * - Template selection
 * - Client selection
 * - Task name and estimated hours
 * - Description
 * - Priority and category
 */
const TaskBasicInfoForm: React.FC<TaskBasicInfoFormProps> = ({
  taskTemplates,
  clients,
  selectedTemplate,
  taskForm,
  formErrors,
  isSubmitting,
  onTemplateSelect,
  onClientChange,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <TemplateSelector
        taskTemplates={taskTemplates}
        selectedTemplate={selectedTemplate}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
        onTemplateSelect={onTemplateSelect}
      />

      {selectedTemplate && (
        <>
          {/* Client Selection */}
          <ClientSelector
            clients={clients}
            clientId={taskForm.clientId}
            isSubmitting={isSubmitting}
            formErrors={formErrors}
            onClientChange={onClientChange}
          />

          {/* Task Name and Hours */}
          <TaskDetailsForm
            name={taskForm.name}
            estimatedHours={taskForm.estimatedHours}
            isSubmitting={isSubmitting}
            formErrors={formErrors}
            onInputChange={onInputChange}
          />

          {/* Description */}
          <TaskDescriptionField
            description={taskForm.description}
            isSubmitting={isSubmitting}
            onInputChange={onInputChange}
          />

          {/* Priority and Category */}
          <TaskCategoryPriorityForm
            priority={taskForm.priority}
            category={taskForm.category}
            isSubmitting={isSubmitting}
            onInputChange={onInputChange}
          />
        </>
      )}
    </div>
  );
};

export default TaskBasicInfoForm;
