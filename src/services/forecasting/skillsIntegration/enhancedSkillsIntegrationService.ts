
import { SkillType } from '@/types/task';
import { SkillValidationResult } from './types';
import { EnhancedSkillsCacheManager } from './enhancedCacheManager';
import { SkillsValidator } from './skillValidator';
import { debugLog } from '../logger';

/**
 * Enhanced Skills Integration Service
 * Addresses the "0 skills loaded" error with improved error handling
 */
export class EnhancedSkillsIntegrationService {
  /**
   * Get available skills with comprehensive error handling
   */
  static async getAvailableSkillsWithDiagnostics(): Promise<{
    skills: SkillType[];
    diagnostics: Record<string, any>;
    success: boolean;
    errors: string[];
  }> {
    const startTime = performance.now();
    let skills: SkillType[] = [];
    let diagnostics: Record<string, any> = {};
    let errors: string[] = [];

    try {
      console.log('🚀 [ENHANCED SKILLS] Starting enhanced skills loading...');

      // Check cache first
      if (EnhancedSkillsCacheManager.isCacheValid()) {
        skills = EnhancedSkillsCacheManager.getCachedSkillsWithFallback();
        diagnostics.cacheHit = true;
        diagnostics.cacheStats = EnhancedSkillsCacheManager.getDetailedCacheStats();
        
        console.log(`⚡ [ENHANCED SKILLS] Cache hit - returning ${skills.length} cached skills`);
        
        return {
          skills,
          diagnostics: {
            ...diagnostics,
            loadTime: performance.now() - startTime,
            source: 'cache'
          },
          success: true,
          errors: []
        };
      }

      // Cache miss - update with diagnostics
      console.log('💾 [ENHANCED SKILLS] Cache miss - updating cache...');
      diagnostics.cacheHit = false;
      
      const cacheResult = await EnhancedSkillsCacheManager.updateCacheWithDiagnostics();
      diagnostics.cacheUpdate = cacheResult.diagnostics;
      
      if (!cacheResult.success) {
        errors = cacheResult.errors;
        console.error('❌ [ENHANCED SKILLS] Cache update failed:', errors);
        
        // Try to use fallback skills
        skills = EnhancedSkillsCacheManager.getCachedSkillsWithFallback();
        diagnostics.fallbackUsed = true;
        
        return {
          skills,
          diagnostics: {
            ...diagnostics,
            loadTime: performance.now() - startTime,
            source: 'fallback'
          },
          success: false,
          errors
        };
      }

      // Success - get updated skills
      skills = EnhancedSkillsCacheManager.getCachedSkillsWithFallback();
      diagnostics.finalStats = EnhancedSkillsCacheManager.getDetailedCacheStats();
      
      console.log(`✅ [ENHANCED SKILLS] Successfully loaded ${skills.length} skills from database`);
      
      return {
        skills,
        diagnostics: {
          ...diagnostics,
          loadTime: performance.now() - startTime,
          source: 'database'
        },
        success: true,
        errors: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading skills';
      errors.push(errorMessage);
      
      console.error('❌ [ENHANCED SKILLS] Critical error:', error);
      
      // Emergency fallback
      skills = EnhancedSkillsCacheManager.getCachedSkillsWithFallback();
      diagnostics.emergencyFallback = true;
      diagnostics.error = errorMessage;
      
      return {
        skills,
        diagnostics: {
          ...diagnostics,
          loadTime: performance.now() - startTime,
          source: 'emergency_fallback'
        },
        success: false,
        errors
      };
    }
  }

  /**
   * Simplified interface for existing code compatibility
   */
  static async getAvailableSkills(): Promise<SkillType[]> {
    const result = await this.getAvailableSkillsWithDiagnostics();
    
    // Log diagnostic information for debugging
    if (!result.success) {
      console.warn('⚠️ [ENHANCED SKILLS] Skills loading had issues:', result.errors);
      console.warn('📊 [ENHANCED SKILLS] Diagnostics:', result.diagnostics);
    }
    
    return result.skills;
  }

  /**
   * Validate skills with enhanced error reporting
   */
  static async validateSkills(skills: SkillType[]): Promise<SkillValidationResult> {
    return SkillsValidator.validateSkills(skills);
  }

  /**
   * Force refresh cache for troubleshooting
   */
  static async refreshSkillsCache(): Promise<{
    success: boolean;
    skillsCount: number;
    errors: string[];
    diagnostics: Record<string, any>;
  }> {
    console.log('🔄 [ENHANCED SKILLS] Manual cache refresh requested');
    return await EnhancedSkillsCacheManager.forceCacheRefresh();
  }

  /**
   * Get diagnostic information for troubleshooting
   */
  static getDiagnosticInfo(): Record<string, any> {
    return {
      cacheStats: EnhancedSkillsCacheManager.getDetailedCacheStats(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear all caches
   */
  static clearCache(): void {
    EnhancedSkillsCacheManager.clearCache();
  }
}
