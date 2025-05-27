
import { supabase } from '@/lib/supabaseClient';
import { TaskTemplate } from '@/types/task';

/**
 * Template Data Service for Bulk Operations
 * 
 * Provides specialized data access functions for bulk operations
 * that require template information and validation.
 */

/**
 * Get templates specifically formatted for bulk operations
 * 
 * Retrieves task templates with additional processing to ensure
 * they're suitable for bulk assignment operations.
 */
export const getTemplatesForBulkOperations = async (): Promise<TaskTemplate[]> => {
  console.log('Fetching templates for bulk operations');

  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('is_archived', false)
    .order('name');

  if (error) {
    console.error('Error fetching templates for bulk operations:', error);
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  // Transform database format to application format
  const templates: TaskTemplate[] = data.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description || '',
    defaultEstimatedHours: template.default_estimated_hours,
    requiredSkills: template.required_skills || [],
    defaultPriority: template.default_priority,
    category: template.category,
    isArchived: template.is_archived,
    createdAt: new Date(template.created_at),
    updatedAt: new Date(template.updated_at),
    version: template.version
  }));

  console.log(`Retrieved ${templates.length} templates for bulk operations`);
  return templates;
};

/**
 * Validate templates for bulk operations
 * 
 * Ensures that selected templates are valid and suitable
 * for bulk assignment operations.
 */
export const validateTemplatesForBulkOperations = async (templateIds: string[]): Promise<{
  valid: TaskTemplate[];
  invalid: string[];
}> => {
  console.log(`Validating ${templateIds.length} templates for bulk operations`);

  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .in('id', templateIds);

  if (error) {
    console.error('Error validating templates:', error);
    throw new Error(`Failed to validate templates: ${error.message}`);
  }

  const foundTemplates = data || [];
  const foundIds = foundTemplates.map(t => t.id);
  const invalidIds = templateIds.filter(id => !foundIds.includes(id));

  // Filter out archived templates
  const validTemplates = foundTemplates
    .filter(template => !template.is_archived)
    .map(template => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      defaultEstimatedHours: template.default_estimated_hours,
      requiredSkills: template.required_skills || [],
      defaultPriority: template.default_priority,
      category: template.category,
      isArchived: template.is_archived,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      version: template.version
    }));

  // Add archived templates to invalid list
  const archivedTemplates = foundTemplates
    .filter(template => template.is_archived)
    .map(t => t.id);

  const allInvalidIds = [...invalidIds, ...archivedTemplates];

  console.log(`Template validation complete: ${validTemplates.length} valid, ${allInvalidIds.length} invalid`);

  return {
    valid: validTemplates,
    invalid: allInvalidIds
  };
};

/**
 * Get template details for operation summary
 */
export const getTemplatesSummaryForBulkOperations = async (templateIds: string[]): Promise<Array<{
  id: string;
  name: string;
  category: string;
  estimatedHours: number;
}>> => {
  console.log(`Getting template summary for ${templateIds.length} templates`);

  const { data, error } = await supabase
    .from('task_templates')
    .select('id, name, category, default_estimated_hours')
    .in('id', templateIds);

  if (error) {
    console.error('Error fetching template summary:', error);
    throw new Error(`Failed to fetch template summary: ${error.message}`);
  }

  return (data || []).map(template => ({
    id: template.id,
    name: template.name,
    category: template.category,
    estimatedHours: template.default_estimated_hours
  }));
};
