
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SkillType } from '@/types/task';
import { SkillsIntegrationService } from '@/services/forecasting/skillsIntegrationService';
import { debugLog } from '@/services/forecasting/logger';

interface UseMatrixSkillsResult {
  availableSkills: SkillType[];
  isLoading: boolean;
  error: string | null;
  refetchSkills: () => void;
  validateSkillSelection: (skills: SkillType[]) => Promise<{
    valid: SkillType[];
    invalid: SkillType[];
  }>;
}

/**
 * Hook for managing skills data in matrix components
 */
export const useMatrixSkills = (): UseMatrixSkillsResult => {
  const [error, setError] = useState<string | null>(null);

  // Query for skills data
  const {
    data: availableSkills = [],
    isLoading,
    refetch,
    error: queryError
  } = useQuery({
    queryKey: ['matrix-skills'],
    queryFn: async () => {
      try {
        setError(null);
        return await SkillsIntegrationService.getAvailableSkills();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load skills';
        setError(errorMessage);
        debugLog('Skills query error:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Failed to load skills';
      setError(errorMessage);
      debugLog('Query error in useMatrixSkills:', queryError);
    }
  }, [queryError]);

  // Refetch function
  const refetchSkills = useCallback(() => {
    SkillsIntegrationService.clearCache();
    refetch();
  }, [refetch]);

  // Skill validation function
  const validateSkillSelection = useCallback(async (skills: SkillType[]) => {
    return await SkillsIntegrationService.validateSkills(skills);
  }, []);

  return {
    availableSkills,
    isLoading,
    error,
    refetchSkills,
    validateSkillSelection
  };
};

export default useMatrixSkills;
