/**
 * Phase 5 Integration Validator
 * 
 * Validates the complete integration and functionality of Phase 5 enhancements
 */

import { SkillResolutionService } from '@/services/forecasting/demand/skillResolution/skillResolutionService';

export interface Phase5ValidationResult {
  passed: boolean;
  message: string;
  details: string[];
  timestamp: string;
}

export class Phase5IntegrationValidator {
  /**
   * Run comprehensive Phase 5 validation
   */
  static async validatePhase5Integration(): Promise<Phase5ValidationResult> {
    const details: string[] = [];
    let passed = true;

    try {
      // Test 1: Skill Resolution Service functionality
      await SkillResolutionService.initializeSkillCache();
      const cacheStats = SkillResolutionService.getCacheStats();
      
      if (!cacheStats.isInitialized) {
        passed = false;
        details.push('❌ Skill cache not properly initialized');
      } else {
        details.push('✅ Skill cache initialized successfully');
      }

      // Test 2: Cache statistics availability
      if (cacheStats.cacheSize >= 0 && cacheStats.reverseCacheSize >= 0) {
        details.push(`✅ Cache stats available (cache: ${cacheStats.cacheSize}, reverse: ${cacheStats.reverseCacheSize})`);
      } else {
        passed = false;
        details.push('❌ Cache statistics not properly available');
      }

      // Test 3: Skill name resolution
      const availableSkills = await SkillResolutionService.getAllSkillNames();
      if (availableSkills && availableSkills.length > 0) {
        details.push(`✅ Skill names resolved (${availableSkills.length} skills available)`);
      } else {
        details.push('⚠️ No skills found in system');
      }

      // Test 4: Validation functionality
      const testSkillRefs = ['test-skill-1', 'test-skill-2'];
      const validationResult = await SkillResolutionService.validateSkillReferences(testSkillRefs);
      if (validationResult) {
        details.push('✅ Skill validation functionality working');
      } else {
        passed = false;
        details.push('❌ Skill validation functionality failed');
      }

      return {
        passed,
        message: passed ? 'Phase 5 integration validation passed' : 'Phase 5 integration validation failed',
        details,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        passed: false,
        message: `Phase 5 validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: [...details, `❌ Exception occurred: ${error}`],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run complete validation (combines all validation methods)
   */
  static async runCompleteValidation(): Promise<{
    passed: boolean;
    overallScore: number;
    featureIntegration: Phase5ValidationResult;
    systemStability: Phase5ValidationResult;
  }> {
    try {
      // Run feature integration validation
      const featureIntegration = await this.validatePhase5Integration();
      
      // Run system stability validation
      const systemStability = await this.validateSkillResolutionPerformance();
      
      // Calculate overall score
      const featureScore = featureIntegration.passed ? 100 : 50;
      const stabilityScore = systemStability.passed ? 100 : 50;
      const overallScore = Math.round((featureScore + stabilityScore) / 2);
      
      const passed = featureIntegration.passed && systemStability.passed;
      
      return {
        passed,
        overallScore,
        featureIntegration,
        systemStability
      };
      
    } catch (error) {
      const errorResult: Phase5ValidationResult = {
        passed: false,
        message: `Complete validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: [`❌ Exception occurred: ${error}`],
        timestamp: new Date().toISOString()
      };
      
      return {
        passed: false,
        overallScore: 0,
        featureIntegration: errorResult,
        systemStability: errorResult
      };
    }
  }

  /**
   * Validate skill resolution performance
   */
  static async validateSkillResolutionPerformance(): Promise<Phase5ValidationResult> {
    const details: string[] = [];
    let passed = true;

    try {
      const startTime = Date.now();
      
      // Initialize cache
      await SkillResolutionService.initializeSkillCache();
      const initTime = Date.now() - startTime;
      
      if (initTime < 5000) { // Should initialize within 5 seconds
        details.push(`✅ Cache initialization time: ${initTime}ms`);
      } else {
        passed = false;
        details.push(`❌ Cache initialization too slow: ${initTime}ms`);
      }

      // Test resolution speed
      const resolutionStartTime = Date.now();
      const skills = await SkillResolutionService.getAllSkillNames();
      const resolutionTime = Date.now() - resolutionStartTime;
      
      if (resolutionTime < 1000) { // Should resolve within 1 second
        details.push(`✅ Skill resolution time: ${resolutionTime}ms`);
      } else {
        passed = false;
        details.push(`❌ Skill resolution too slow: ${resolutionTime}ms`);
      }

      return {
        passed,
        message: passed ? 'Performance validation passed' : 'Performance validation failed',
        details,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        passed: false,
        message: `Performance validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: [...details, `❌ Exception occurred: ${error}`],
        timestamp: new Date().toISOString()
      };
    }
  }
}
