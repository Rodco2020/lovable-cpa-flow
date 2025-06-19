
import { SkillType } from '@/types/task';
import { Skill } from '@/types/skill';
import { SkillCache, SKILLS_CACHE_DURATION } from './types';
import { getAllSkills } from '@/services/skills/skillsService';
import { SkillNormalizationService } from '@/services/skillNormalizationService';
import { debugLog } from '../logger';

/**
 * Enhanced Skills Integration Cache Manager
 * Addresses the "0 skills loaded" error with comprehensive logging and validation
 */
export class EnhancedSkillsCacheManager {
  private static cache: SkillCache = {
    skillsMap: new Map(),
    skillIdToNameMap: new Map(),
    lastCacheUpdate: 0
  };

  /**
   * Update skills cache with enhanced error handling and logging
   */
  static async updateCacheWithDiagnostics(): Promise<{
    success: boolean;
    skillsCount: number;
    errors: string[];
    diagnostics: Record<string, any>;
  }> {
    const diagnostics: Record<string, any> = {};
    const errors: string[] = [];
    let skillsCount = 0;

    try {
      console.log('🔧 [ENHANCED CACHE] Starting skills cache update...');
      
      // Step 1: Test database connection
      diagnostics.step1_dbConnection = 'testing';
      try {
        const dbTestResult = await this.testDatabaseConnection();
        diagnostics.step1_dbConnection = dbTestResult;
        console.log('📊 [ENHANCED CACHE] Database connection test:', dbTestResult);
      } catch (dbError) {
        const errorMsg = `Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        diagnostics.step1_dbConnection = { error: errorMsg };
        console.error('❌ [ENHANCED CACHE] Database connection failed:', dbError);
      }

      // Step 2: Load skills from database
      diagnostics.step2_skillsLoading = 'loading';
      let rawSkills: Skill[] = [];
      try {
        console.log('📥 [ENHANCED CACHE] Loading skills from database...');
        rawSkills = await getAllSkills();
        diagnostics.step2_skillsLoading = {
          success: true,
          rawSkillsCount: rawSkills.length,
          sampleSkills: rawSkills.slice(0, 3).map(s => ({ id: s.id, name: s.name }))
        };
        console.log(`✅ [ENHANCED CACHE] Loaded ${rawSkills.length} raw skills from database`);
      } catch (skillsError) {
        const errorMsg = `Skills loading failed: ${skillsError instanceof Error ? skillsError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        diagnostics.step2_skillsLoading = { error: errorMsg };
        console.error('❌ [ENHANCED CACHE] Skills loading failed:', skillsError);
        throw skillsError; // Don't continue if we can't load skills
      }

      // Step 3: Validate skills data
      diagnostics.step3_validation = 'validating';
      const validSkills = rawSkills.filter(skill => {
        const isValid = skill && skill.id && skill.name && skill.name.trim().length > 0;
        if (!isValid) {
          console.warn('⚠️ [ENHANCED CACHE] Invalid skill found:', skill);
        }
        return isValid;
      });
      
      diagnostics.step3_validation = {
        totalSkills: rawSkills.length,
        validSkills: validSkills.length,
        invalidSkills: rawSkills.length - validSkills.length
      };
      
      if (validSkills.length === 0) {
        const errorMsg = 'No valid skills found in database';
        errors.push(errorMsg);
        console.error('❌ [ENHANCED CACHE] No valid skills found');
        throw new Error(errorMsg);
      }

      // Step 4: Convert and normalize skills
      diagnostics.step4_normalization = 'normalizing';
      try {
        const skillTypes = await this.convertSkillsToSkillTypesEnhanced(validSkills);
        diagnostics.step4_normalization = {
          success: true,
          skillTypesCount: skillTypes.length,
          sampleSkillTypes: skillTypes.slice(0, 5)
        };
        
        // Step 5: Update caches
        diagnostics.step5_cacheUpdate = 'updating';
        this.updateSkillsCache(skillTypes);
        this.updateSkillIdCache(validSkills);
        
        // Update normalization service cache
        await SkillNormalizationService.updateSkillMappingCache();
        
        this.cache.lastCacheUpdate = Date.now();
        skillsCount = skillTypes.length;
        
        diagnostics.step5_cacheUpdate = {
          success: true,
          finalSkillsCount: skillsCount,
          cacheSize: this.cache.skillsMap.size,
          idMappingSize: this.cache.skillIdToNameMap.size
        };
        
        console.log(`🎉 [ENHANCED CACHE] Successfully updated cache with ${skillsCount} skills`);
        
        return {
          success: true,
          skillsCount,
          errors: [],
          diagnostics
        };
        
      } catch (normalizationError) {
        const errorMsg = `Skills normalization failed: ${normalizationError instanceof Error ? normalizationError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        diagnostics.step4_normalization = { error: errorMsg };
        console.error('❌ [ENHANCED CACHE] Skills normalization failed:', normalizationError);
        throw normalizationError;
      }
      
    } catch (error) {
      console.error('❌ [ENHANCED CACHE] Cache update failed:', error);
      return {
        success: false,
        skillsCount: 0,
        errors,
        diagnostics
      };
    }
  }

  /**
   * Test database connection specifically for skills table
   */
  private static async testDatabaseConnection(): Promise<Record<string, any>> {
    try {
      // Try a simple count query on skills table
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { count, error } = await supabase
        .from('skills')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Database query error: ${error.message}`);
      }
      
      return {
        success: true,
        skillsCount: count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Enhanced skill conversion with detailed logging
   */
  private static async convertSkillsToSkillTypesEnhanced(skills: Skill[]): Promise<SkillType[]> {
    console.log(`🔄 [ENHANCED CACHE] Converting ${skills.length} skills to skill types...`);
    
    const skillTypes = skills
      .filter(skill => skill.name && skill.name.trim().length > 0)
      .map(skill => {
        const normalized = SkillNormalizationService.normalizeSkill(skill.name);
        console.log(`  🎯 [ENHANCED CACHE] ${skill.name} -> ${normalized}`);
        return normalized;
      })
      .filter((skill, index, array) => array.indexOf(skill) === index) // Remove duplicates
      .sort();

    console.log(`✅ [ENHANCED CACHE] Converted to ${skillTypes.length} unique skill types:`, skillTypes);

    // Ensure we have some standard skills if database is empty
    if (skillTypes.length === 0) {
      console.log('⚠️ [ENHANCED CACHE] No skills found, using standard fallback skills');
      return SkillNormalizationService.getStandardForecastSkills();
    }

    return skillTypes;
  }

  /**
   * Update skills cache with skill types
   */
  private static updateSkillsCache(skills: SkillType[]): void {
    this.cache.skillsMap.clear();
    skills.forEach(skill => {
      this.cache.skillsMap.set(skill, skill);
    });
    console.log(`📦 [ENHANCED CACHE] Updated skills cache with ${skills.length} entries`);
  }

  /**
   * Update skill ID to name cache
   */
  private static updateSkillIdCache(skills: Skill[]): void {
    this.cache.skillIdToNameMap.clear();
    skills.forEach(skill => {
      this.cache.skillIdToNameMap.set(skill.id, skill.name);
    });
    console.log(`🆔 [ENHANCED CACHE] Updated skill ID cache with ${skills.length} entries`);
  }

  /**
   * Get cached skills with fallback
   */
  static getCachedSkillsWithFallback(): SkillType[] {
    const cachedSkills = Array.from(this.cache.skillsMap.values());
    
    if (cachedSkills.length === 0) {
      console.warn('⚠️ [ENHANCED CACHE] No cached skills found, using fallback');
      return SkillNormalizationService.getStandardForecastSkills();
    }
    
    return cachedSkills;
  }

  /**
   * Check if cache is valid
   */
  static isCacheValid(): boolean {
    const isValid = (
      this.cache.skillsMap.size > 0 &&
      Date.now() - this.cache.lastCacheUpdate < SKILLS_CACHE_DURATION
    );
    
    console.log(`🔍 [ENHANCED CACHE] Cache validity check:`, {
      skillsCount: this.cache.skillsMap.size,
      lastUpdate: this.cache.lastCacheUpdate,
      age: Date.now() - this.cache.lastCacheUpdate,
      isValid
    });
    
    return isValid;
  }

  /**
   * Force cache refresh with diagnostics
   */
  static async forceCacheRefresh(): Promise<{
    success: boolean;
    skillsCount: number;
    errors: string[];
    diagnostics: Record<string, any>;
  }> {
    console.log('🔄 [ENHANCED CACHE] Force cache refresh initiated');
    this.clearCache();
    return await this.updateCacheWithDiagnostics();
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.skillsMap.clear();
    this.cache.skillIdToNameMap.clear();
    this.cache.lastCacheUpdate = 0;
    SkillNormalizationService.clearCache();
    console.log('🗑️ [ENHANCED CACHE] Cache cleared');
  }

  /**
   * Get detailed cache stats
   */
  static getDetailedCacheStats(): {
    skillsCount: number;
    lastUpdate: number;
    age: number;
    isValid: boolean;
    skillTypes: SkillType[];
    idMappingCount: number;
  } {
    return {
      skillsCount: this.cache.skillsMap.size,
      lastUpdate: this.cache.lastCacheUpdate,
      age: Date.now() - this.cache.lastCacheUpdate,
      isValid: this.isCacheValid(),
      skillTypes: Array.from(this.cache.skillsMap.values()),
      idMappingCount: this.cache.skillIdToNameMap.size
    };
  }
}
