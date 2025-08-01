
import { supabase } from '@/integrations/supabase/client';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { toast } from '@/hooks/use-toast';

/**
 * Template Data Service
 * 
 * Handles fetching and managing task template data for assignment operations.
 */

/**
 * Fetch a single template by ID
 */
export const fetchTemplateById = async (templateId: string) => {
  const { data: template, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error || !template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  return template;
};

/**
 * Get available templates for assignment
 */
export const getAvailableTemplates = async (): Promise<TaskTemplate[]> => {
  try {
    const { data: templates, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('is_archived', false)
      .order('name');

    if (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load task templates.",
        variant: "destructive",
      });
      return [];
    }

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      defaultEstimatedHours: template.default_estimated_hours,
      requiredSkills: template.required_skills || [],
      defaultPriority: template.default_priority as TaskPriority,
      category: template.category as TaskCategory,
      isArchived: template.is_archived,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      version: template.version
    }));
  } catch (error) {
    console.error('Unexpected error fetching templates:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while loading templates.",
      variant: "destructive",
    });
    return [];
  }
};
