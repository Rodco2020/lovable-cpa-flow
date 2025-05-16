
import React from 'react';
import { TaskPriority, TaskCategory, TaskTemplate } from '@/types/task';
import { Client } from '@/types/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

      {selectedTemplate && (
        <>
          {/* Client Selection */}
          <div className="space-y-2">
            <label htmlFor="clientId" className="text-sm font-medium">
              Client
            </label>
            <Select 
              value={taskForm.clientId} 
              onValueChange={onClientChange}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.length > 0 ? (
                  clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.legalName}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No clients found
                  </div>
                )}
              </SelectContent>
            </Select>
            {formErrors.clientId && (
              <p className="text-sm font-medium text-destructive">{formErrors.clientId}</p>
            )}
          </div>

          {/* Task Name and Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Task Name
              </label>
              <Input
                id="name"
                name="name"
                value={taskForm.name}
                onChange={onInputChange}
                placeholder="Enter task name"
                required
                disabled={isSubmitting}
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-sm font-medium text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="estimatedHours" className="text-sm font-medium">
                Estimated Hours
              </label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                min="0.25"
                step="0.25"
                value={taskForm.estimatedHours}
                onChange={onInputChange}
                required
                disabled={isSubmitting}
                className={formErrors.estimatedHours ? "border-destructive" : ""}
              />
              {formErrors.estimatedHours && (
                <p className="text-sm font-medium text-destructive">{formErrors.estimatedHours}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={taskForm.description}
              onChange={onInputChange}
              placeholder="Describe the task"
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={taskForm.priority}
                onChange={onInputChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={taskForm.category}
                onChange={onInputChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isSubmitting}
              >
                <option value="Tax">Tax</option>
                <option value="Audit">Audit</option>
                <option value="Advisory">Advisory</option>
                <option value="Compliance">Compliance</option>
                <option value="Bookkeeping">Bookkeeping</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskBasicInfoForm;
