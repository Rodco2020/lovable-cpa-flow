
import React, { useState, useEffect } from 'react';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { Skill } from '@/types/skill';
import { 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface TaskTemplateFormProps {
  editingTemplate: TaskTemplate | null;
  isSubmitting: boolean;
  formData: Partial<TaskTemplate>;
  skills: Skill[];
  isLoadingSkills: boolean;
  onFormChange: (key: string, value: any) => void;
  onSkillChange: (skillId: string, checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSkillSelected: (skillId: string) => boolean;
}

/**
 * Component for creating and editing task templates
 * Handles the form UI and input changes
 */
const TaskTemplateForm: React.FC<TaskTemplateFormProps> = ({
  editingTemplate,
  isSubmitting,
  formData,
  skills,
  isLoadingSkills,
  onFormChange,
  onSkillChange,
  onSubmit,
  isSkillSelected
}) => {
  // Define available priorities and categories
  const priorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];
  const categories: TaskCategory[] = ["Tax", "Audit", "Advisory", "Compliance", "Bookkeeping", "Other"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'defaultEstimatedHours') {
      onFormChange(name, parseFloat(value));
    } else {
      onFormChange(name, value);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editingTemplate ? 'Edit Task Template' : 'Create New Task Template'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Template Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
            onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isSubmitting}
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Required Skills</label>
          {isLoadingSkills ? (
            <div className="flex items-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
              <span className="text-sm">Loading skills...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {skills.length > 0 ? (
                skills.map(skill => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`skill-${skill.id}`}
                      checked={isSkillSelected(skill.id)}
                      onCheckedChange={(checked) => 
                        onSkillChange(skill.id, checked === true)
                      }
                      disabled={isSubmitting}
                    />
                    <label htmlFor={`skill-${skill.id}`} className="text-sm">
                      {skill.name}
                      {skill.proficiencyLevel && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({skill.proficiencyLevel})
                        </span>
                      )}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills found. Please add skills in the Skills Module.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingTemplate ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingTemplate ? 'Update Template' : 'Create Template'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default TaskTemplateForm;
