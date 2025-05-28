
import { useState, useEffect } from 'react';
import { TaskTemplate } from '@/types/task';
import { 
  getTaskTemplates, 
  createTaskTemplate, 
  updateTaskTemplate, 
  archiveTaskTemplate 
} from '@/services/taskService';
import { getAllSkills } from '@/services/skillService';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to manage task template list data and operations
 * Handles fetching templates, creating, updating, and archiving
 */
export const useTaskTemplateListData = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch skills from the database using React Query
  const { data: skills = [], isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: getAllSkills
  });

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

  const createTemplate = async (submissionData: any) => {
    const newTemplate = await createTaskTemplate({
      name: submissionData.name!,
      description: submissionData.description!,
      defaultEstimatedHours: submissionData.defaultEstimatedHours!,
      requiredSkills: submissionData.requiredSkills as string[], 
      defaultPriority: submissionData.defaultPriority!,
      category: submissionData.category!
    });
    
    if (!newTemplate) {
      throw new Error("Failed to create template");
    }
    
    toast({
      title: "Template Created",
      description: "The new task template has been created successfully.",
    });

    return newTemplate;
  };

  const updateTemplate = async (templateId: string, submissionData: any) => {
    const updated = await updateTaskTemplate(templateId, submissionData);
    
    if (updated) {
      console.log('Template updated successfully:', updated);
      toast({
        title: "Template Updated",
        description: "The task template has been updated successfully.",
      });
    } else {
      throw new Error("Failed to update template");
    }

    return updated;
  };

  return {
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
  };
};
