
import { useQuery } from '@tanstack/react-query';
import { getAvailableTemplates } from '@/services/templateAssignmentService';

/**
 * Hook for fetching available templates
 */
export const useTemplatesData = () => {
  return useQuery({
    queryKey: ['available-templates'],
    queryFn: getAvailableTemplates
  });
};
