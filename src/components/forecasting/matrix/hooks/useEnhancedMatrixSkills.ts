
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SkillType } from '@/types/task';
import { EnhancedSkillsIntegrationService } from '@/services/forecasting/skillsIntegration/enhancedSkillsIntegrationService';
import { debugLog } from '@/services/forecasting/logger';

interface UseEnhancedMatrixSkillsResult {
  availableSkills: SkillType[];
  isLoading: boolean;
  error: string | null;
  refetchSkills: () => void;
  forceRefreshSkills: () => Promise<void>;
  diagnostics: Record<string, any> | null;
  validateSkillSelection: (skills: SkillType[]) => Promise<{
    valid: SkillType[];
    invalid: SkillType[];
  }>;
}

/**
 * Enhanced hook for managing skills data in matrix components
 * Addresses the "0 skills loaded" error with comprehensive diagnostics
 */
export const useEnhancedMatrixSkills = (): UseEnhancedMatrixSkillsResult => {
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<Record<string, any> | null>(null);

  // Enhanced query for skills data
  const {
    data: skillsResult,
    isLoading,
    refetch,
    error: queryError
  } = useQuery({
    queryKey: ['enhanced-matrix-skills'],
    queryFn: async () => {
      try {
        setError(null);
        console.log('🔍 [ENHANCED MATRIX SKILLS] Starting skills query...');
        
        const result = await EnhancedSkillsIntegrationService.getAvailableSkillsWithDiagnostics();
        
        setDiagnostics(result.diagnostics);
        
        if (!result.success && result.errors.length > 0) {
          const errorMessage = `Skills loading issues: ${result.errors.join(', ')}`;
          setError(errorMessage);
          console.warn('⚠️ [ENHANCED MATRIX SKILLS] Skills loading had issues:', result.errors);
        }
        
        console.log(`✅ [ENHANCED MATRIX SKILLS] Query completed - ${result.skills.length} skills loaded`);
        console.log('📊 [ENHANCED MATRIX SKILLS] Diagnostics:', result.diagnostics);
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load skills';
        setError(errorMessage);
        debugLog('Enhanced skills query error:', err);
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for debugging)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true
  });

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Failed to load skills';
      setError(errorMessage);
      debugLog('Query error in useEnhancedMatrixSkills:', queryError);
    }
  }, [queryError]);

  // Regular refetch function
  const refetchSkills = useCallback(() => {
    console.log('🔄 [ENHANCED MATRIX SKILLS] Regular refetch requested');
    EnhancedSkillsIntegrationService.clearCache();
    refetch();
  }, [refetch]);

  // Force refresh with cache clearing
  const forceRefreshSkills = useCallback(async () => {
    console.log('🔥 [ENHANCED MATRIX SKILLS] Force refresh requested');
    try {
      const refreshResult = await EnhancedSkillsIntegrationService.refreshSkillsCache();
      setDiagnostics(refreshResult.diagnostics);
      
      if (!refreshResult.success) {
        setError(`Force refresh failed: ${refreshResult.errors.join(', ')}`);
      } else {
        setError(null);
      }
      
      // Refetch the query to update the UI
      refetch();
      
      console.log('🎉 [ENHANCED MATRIX SKILLS] Force refresh completed:', refreshResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Force refresh failed';
      setError(errorMessage);
      console.error('❌ [ENHANCED MATRIX SKILLS] Force refresh error:', err);
    }
  }, [refetch]);

  // Skill validation function
  const validateSkillSelection = useCallback(async (skills: SkillType[]) => {
    return await EnhancedSkillsIntegrationService.validateSkills(skills);
  }, []);

  // Extract skills from result
  const availableSkills = skillsResult?.skills || [];

  // Log current state for debugging
  useEffect(() => {
    console.log('📊 [ENHANCED MATRIX SKILLS] Current state:', {
      skillsCount: availableSkills.length,
      isLoading,
      hasError: !!error,
      error,
      diagnostics
    });
  }, [availableSkills.length, isLoading, error, diagnostics]);

  return {
    availableSkills,
    isLoading,
    error,
    refetchSkills,
    forceRefreshSkills,
    diagnostics,
    validateSkillSelection
  };
};

export default useEnhancedMatrixSkills;
