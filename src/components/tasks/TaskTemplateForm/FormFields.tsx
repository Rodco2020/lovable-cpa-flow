
import React from 'react';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldsProps {
  formData: Partial<TaskTemplate>;
  isSubmitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Component for basic form fields in task template form
 * Handles name, description, hours, priority, and category inputs
 */
const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  isSubmitting,
  onInputChange
}) => {
  // Define available priorities and categories
  const priorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
  const categories: TaskCategory[] = ["Tax", "Audit", "Advisory", "Compliance", "Bookkeeping", "Other"];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Template Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={onInputChange}
            placeholder="Enter template name"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category || 'Other'}
            onChange={onInputChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isSubmitting}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={onInputChange}
          placeholder="Describe the task template"
          rows={3}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="defaultEstimatedHours" className="text-sm font-medium">
            Default Estimated Hours
          </label>
          <Input
            id="defaultEstimatedHours"
            name="defaultEstimatedHours"
            type="number"
            min="0.25"
            step="0.25"
            value={formData.defaultEstimatedHours || 1}
            onChange={onInputChange}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="defaultPriority" className="text-sm font-medium">
            Default Priority
          </label>
          <select
            id="defaultPriority"
            name="defaultPriority"
            value={formData.defaultPriority || 'Medium'}
            onChange={onInputChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isSubmitting}
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default FormFields;
