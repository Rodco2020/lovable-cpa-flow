
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskTemplates, createTaskTemplate, updateTaskTemplate, archiveTaskTemplate } from '@/services/taskService';
import { getAllSkills } from '@/services/skills/skillsService';
import { useToast } from '@/hooks/use-toast';
import TaskTemplateTable from './TaskTemplateTable';
import TaskTemplateDialog from './TaskTemplateDialog';
import { TaskTemplate } from '@/types/task';

/**
 * Main component for managing task templates
 * Handles CRUD operations, modal states, and data fetching
 */
const TaskTemplateManagement: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: templates = [], isLoading: isLoadingTemplates, error: templatesError } = useQuery({
    queryKey: ['task-templates'],
    queryFn: () => getTaskTemplates(),
  });

  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills,
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: createTaskTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: 'Success',
        description: 'Task template created successfully',
      });
      setIsDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task template',
        variant: 'destructive',
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateTaskTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: 'Success',
        description: 'Task template updated successfully',
      });
      setIsDialogOpen(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task template',
        variant: 'destructive',
      });
    },
  });

  const archiveTemplateMutation = useMutation({
    mutationFn: archiveTaskTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-templates'] });
      toast({
        title: 'Success',
        description: 'Task template archived successfully',
      });
    },
    onError: (error) => {
      console.error('Error archiving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive task template',
        variant: 'destructive',
      });
    },
  });

  // Event handlers
  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleArchiveTemplate = async (templateId: string) => {
    try {
      await archiveTemplateMutation.mutateAsync(templateId);
    } catch (error) {
      // Error handling is done in the mutation onError callback
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    console.log('Delete template:', templateId, templateName);
    toast({
      title: 'Info',
      description: 'Delete functionality will be implemented soon',
    });
  };

  const handleSubmit = async (submissionData: any, isEditing: boolean, templateId?: string) => {
    try {
      if (isEditing && templateId) {
        await updateTemplateMutation.mutateAsync({ id: templateId, updates: submissionData });
      } else {
        await createTemplateMutation.mutateAsync(submissionData);
      }
    } catch (error) {
      throw error; // Let the dialog handle the error
    }
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['task-templates'] });
    queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  if (templatesError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading templates: {String(templatesError)}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Task Templates</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreateNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TaskTemplateTable
          templates={templates}
          skills={skills}
          isLoading={isLoadingTemplates}
          onEditTemplate={handleEditTemplate}
          onArchiveTemplate={handleArchiveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />

        <TaskTemplateDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingTemplate={editingTemplate}
          skills={skills}
          isLoadingSkills={isLoadingSkills}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
};

export default TaskTemplateManagement;
