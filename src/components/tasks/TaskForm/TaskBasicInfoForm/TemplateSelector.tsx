
import React from 'react';
import { TaskTemplate } from '@/types/task';

interface TemplateSelectorProps {
  taskTemplates: TaskTemplate[];
  selectedTemplate: TaskTemplate | null;
  isSubmitting: boolean;
  formErrors: Record<string, string>;
  onTemplateSelect: (templateId: string) => void;
}

/**
 * Template Selector Component
 * 
 * Handles the selection of task templates with validation feedback
 */
const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  taskTemplates,
  selectedTemplate,
  isSubmitting,
  formErrors,
  onTemplateSelect
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="template" className="text-sm font-medium">
        Select Task Template
      </label>
      <select
        id="template"
        value={selectedTemplate?.id || ''}
        onChange={(e) => onTemplateSelect(e.target.value)}
        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        disabled={isSubmitting}
      >
        <option value="">-- Select Template --</option>
        {taskTemplates.map(template => (
          <option key={template.id} value={template.id}>
            {template.name} ({template.category})
          </option>
        ))}
      </select>
      {formErrors.templateId && (
        <p className="text-sm font-medium text-destructive">{formErrors.templateId}</p>
      )}
    </div>
  );
};

export default TemplateSelector;
