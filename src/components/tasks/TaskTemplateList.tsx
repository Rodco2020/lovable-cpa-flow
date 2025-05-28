
import React, { useState } from 'react';
import { TaskTemplate } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import { useTaskTemplateListData } from './hooks/useTaskTemplateListData';
import TaskTemplateListHeader from './TaskTemplateListHeader';
import TaskTemplateTable from './TaskTemplateTable';
import TaskTemplateDialog from './TaskTemplateDialog';

/**
 * Main component for managing task templates
 * Orchestrates the header, table, and dialog components
 * Uses custom hooks for data management and state
 */
const TaskTemplateList: React.FC = () => {
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use custom hook for all data operations
  const {
    templates,
    skills,
    showArchived,
    isLoading,
    isLoadingSkills,
    refreshTemplates,
    handleToggleArchived,
    handleArchiveTemplate,
    createTemplate,
    updateTemplate
  } = useTaskTemplateListData();

  const handleCreateTemplate = () => {
    console.log('Creating new template');
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    console.log('TaskTemplateList: Starting edit for template:', {
      id: template.id,
      name: template.name,
      requiredSkills: template.requiredSkills
    });
    
    // Ensure we have the template data properly set
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleSubmitTemplate = async (submissionData: any, isEditing: boolean, templateId?: string) => {
    try {
      if (isEditing && templateId) {
        // Update existing template
        await updateTemplate(templateId, submissionData);
      } else {
        // Create new template
        await createTemplate(submissionData);
      }
      
      // Refresh the list after successful operation
      refreshTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the template.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the dialog handle the error state
    }
  };

  return (
    <div className="space-y-4">
      <TaskTemplateListHeader 
        showArchived={showArchived}
        onToggleArchived={handleToggleArchived}
        onCreateTemplate={handleCreateTemplate}
      />
      
      <TaskTemplateTable 
        templates={templates}
        skills={skills}
        isLoading={isLoading}
        onEditTemplate={handleEditTemplate}
        onArchiveTemplate={handleArchiveTemplate}
      />
      
      <TaskTemplateDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingTemplate={editingTemplate}
        skills={skills}
        isLoadingSkills={isLoadingSkills}
        onSubmit={handleSubmitTemplate}
      />
    </div>
  );
};

export default TaskTemplateList;
