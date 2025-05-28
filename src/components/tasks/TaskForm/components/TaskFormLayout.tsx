
import React from 'react';
import { TaskTemplate, RecurringTask } from '@/types/task';
import { Client } from '@/types/client';
import TaskBasicInfoForm from '../TaskBasicInfoForm';
import RecurrenceSettingsForm from '../RecurrenceSettingsForm';
import TaskDateSelector from '../TaskDateSelector';
import TaskSummary from '../TaskSummary';
import RecurringTaskToggle from './RecurringTaskToggle';
import TaskFormActions from './TaskFormActions';

interface TaskFormLayoutProps {
  taskTemplates: TaskTemplate[];
  clients: Client[];
  selectedTemplate: TaskTemplate | null;
  taskForm: any;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  onTemplateSelect: (templateId: string) => void;
  onClientChange: (clientId: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleWeekdayChange: (day: number, checked: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

/**
 * Main layout component for the task form
 * Orchestrates all form sections and maintains the original structure
 */
const TaskFormLayout: React.FC<TaskFormLayoutProps> = ({
  taskTemplates,
  clients,
  selectedTemplate,
  taskForm,
  formErrors,
  isSubmitting,
  isRecurring,
  setIsRecurring,
  onTemplateSelect,
  onClientChange,
  onInputChange,
  handleWeekdayChange,
  onClose,
  onSubmit
}) => {
  /**
   * Handles changes to recurrence type select element
   */
  const handleRecurrenceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onInputChange(e);
  };

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
        onTemplateSelect={onTemplateSelect}
        onClientChange={onClientChange}
        onInputChange={onInputChange}
      />
      
      {selectedTemplate && (
        <>
          {/* Recurring Task Toggle */}
          <RecurringTaskToggle 
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            isSubmitting={isSubmitting}
          />
          
          {/* Due Date and Recurrence */}
          <div className="grid grid-cols-2 gap-4">
            <TaskDateSelector 
              isRecurring={isRecurring}
              dueDate={taskForm.dueDate}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              onInputChange={onInputChange}
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
              onInputChange={onInputChange}
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
          <TaskFormActions 
            isSubmitting={isSubmitting}
            isRecurring={isRecurring}
            selectedTemplate={selectedTemplate}
            taskForm={taskForm}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </>
      )}
    </div>
  );
};

export default TaskFormLayout;
