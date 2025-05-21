
import React, { useState, useEffect } from 'react';
import { TaskTemplate } from '@/types/task';
import { 
  getTaskTemplates, 
  createTaskTemplate, 
  updateTaskTemplate, 
  archiveTaskTemplate 
} from '@/services/taskService';
import { 
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllSkills } from '@/services/skillService';
import { useTaskTemplateForm } from '@/hooks/useTaskTemplateForm';
import TaskTemplateTable from './TaskTemplateTable';
import TaskTemplateForm from './TaskTemplateForm';

/**
 * Main component for managing task templates
 * Handles fetching templates, editing, creating, and archiving templates
 */
const TaskTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch skills from the database using React Query
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills
  });

  // Use custom hook for form state management
  const { formData, resetForm, updateField, handleSkillChange, isSkillSelected } = useTaskTemplateForm();

  // Fetch templates on component mount and when showArchived changes
  useEffect(() => {
    refreshTemplates();
  }, [showArchived]);

  const refreshTemplates = async () => {
    setIsLoading(true);
    try {
      const fetchedTemplates = await getTaskTemplates(showArchived);
      console.log('Fetched templates:', fetchedTemplates);
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load task templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    // The useEffect will trigger the refreshTemplates
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    console.log('Editing template with skills:', template.requiredSkills);
    setEditingTemplate(template);
    resetForm(template);
    setIsDialogOpen(true);
  };

  const handleArchiveTemplate = async (id: string) => {
    try {
      const result = await archiveTaskTemplate(id);
      if (result) {
        toast({
          title: "Template Archived",
          description: "The task template has been archived successfully.",
        });
        refreshTemplates();
      } else {
        toast({
          title: "Error",
          description: "Could not archive template.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error archiving template:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while archiving the template.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Form data before submission:', formData);
      
      if (editingTemplate) {
        // Update existing template
        const updated = await updateTaskTemplate(editingTemplate.id, {
          ...formData,
          requiredSkills: formData.requiredSkills || [] // Ensure we're sending an array even if it's empty
        });
        
        if (updated) {
          console.log('Template updated successfully:', updated);
          toast({
            title: "Template Updated",
            description: "The task template has been updated successfully.",
          });
        } else {
          throw new Error("Failed to update template");
        }
      } else {
        // Create new template
        const newTemplate = await createTaskTemplate({
          name: formData.name!,
          description: formData.description!,
          defaultEstimatedHours: formData.defaultEstimatedHours!,
          requiredSkills: formData.requiredSkills as string[], 
          defaultPriority: formData.defaultPriority!,
          category: formData.category!
        });
        
        if (!newTemplate) {
          throw new Error("Failed to create template");
        }
        
        toast({
          title: "Template Created",
          description: "The new task template has been created successfully.",
        });
      }
      
      // Close dialog and refresh list
      setIsDialogOpen(false);
      refreshTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the template.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Templates</h2>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-archived"
              checked={showArchived}
              onCheckedChange={handleToggleArchived}
            />
            <label htmlFor="show-archived" className="text-sm font-medium">
              Show Archived
            </label>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>
      
      <TaskTemplateTable 
        templates={templates}
        skills={skills}
        isLoading={isLoading}
        onEditTemplate={handleEditTemplate}
        onArchiveTemplate={handleArchiveTemplate}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TaskTemplateForm 
          editingTemplate={editingTemplate}
          isSubmitting={isSubmitting}
          formData={formData}
          skills={skills}
          isLoadingSkills={isLoadingSkills}
          onFormChange={updateField}
          onSkillChange={handleSkillChange}
          onSubmit={handleSubmit}
          isSkillSelected={isSkillSelected}
        />
      </Dialog>
    </div>
  );
};

export default TaskTemplateList;
