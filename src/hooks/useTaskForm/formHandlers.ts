
import { TaskTemplate } from '@/types/task';
import { TaskFormData } from './types';

/**
 * Custom hook for form input change handlers
 * 
 * @param taskForm - Current form data
 * @param setTaskForm - Function to update form data
 * @param formErrors - Current form errors
 * @param setFormErrors - Function to update form errors
 * @param setSelectedTemplate - Function to update selected template
 * @returns Object containing all form handler functions
 */
export function useFormHandlers(
  taskForm: TaskFormData,
  setTaskForm: (updater: (prev: TaskFormData) => TaskFormData) => void,
  formErrors: Record<string, string>,
  setFormErrors: (updater: (prev: Record<string, string>) => Record<string, string>) => void,
  setSelectedTemplate: (template: TaskTemplate | null) => void
) {
  /**
   * Handles changes to form input fields
   * 
   * @param e - The input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'estimatedHours' || name === 'interval' || name === 'dayOfMonth' || 
        name === 'monthOfYear' || name === 'customOffsetDays') {
      setTaskForm(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setTaskForm(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handles selection of a task template
   * Auto-populates form values based on the selected template
   * 
   * @param templateId - ID of the selected template
   * @param templates - Array of available templates
   */
  const handleTemplateSelect = (templateId: string, templates: TaskTemplate[]) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setTaskForm(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        estimatedHours: template.defaultEstimatedHours,
        priority: template.defaultPriority,
        category: template.category,
        requiredSkills: [...template.requiredSkills]
      }));
    }
  };

  /**
   * Handles client selection in the form
   * 
   * @param clientId - ID of the selected client
   */
  const handleClientChange = (clientId: string) => {
    setTaskForm(prev => ({ ...prev, clientId }));
    // Clear validation error
    if (formErrors.clientId) {
      setFormErrors(prev => ({
        ...prev,
        clientId: ''
      }));
    }
  };

  /**
   * Handles selection/deselection of weekdays for weekly recurring tasks
   * 
   * @param day - Day number (0-6, where 0 is Sunday)
   * @param checked - Whether the day is selected
   */
  const handleWeekdayChange = (day: number, checked: boolean) => {
    if (checked) {
      setTaskForm(prev => ({
        ...prev,
        weekdays: [...prev.weekdays, day]
      }));
    } else {
      setTaskForm(prev => ({
        ...prev,
        weekdays: prev.weekdays.filter(d => d !== day)
      }));
    }
    
    // Clear weekdays validation error if any day is selected
    if (formErrors.weekdays && checked) {
      setFormErrors(prev => ({
        ...prev,
        weekdays: ''
      }));
    }
  };

  return {
    handleInputChange,
    handleTemplateSelect,
    handleClientChange,
    handleWeekdayChange
  };
}
