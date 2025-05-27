
import { useQuery } from '@tanstack/react-query';
import { getAllTaskTemplates } from '@/services/taskTemplateService';

/**
 * Hook for fetching template data used in operations
 */
export const useTemplatesData = () => {
  return useQuery({
    queryKey: ['task-templates'],
    queryFn: getAllTaskTemplates,
  });
};
