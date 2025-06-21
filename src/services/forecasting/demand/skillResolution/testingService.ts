
/**
 * Skill Resolution Testing Service
 * Provides comprehensive testing and validation for the skill resolution system
 */

import { SkillResolutionService } from './skillResolutionService';
import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  testName: string;
  passed: boolean;
  details: any;
  duration: number;
  error?: string;
}

export interface ValidationReport {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  summary: {
    skillCacheTest: boolean;
    uuidResolutionTest: boolean;
    nameValidationTest: boolean;
    performanceTest: boolean;
    dataIntegrityTest: boolean;
  };
}

export class SkillResolutionTestingService {
  /**
   * Run comprehensive validation tests
   */
  static async runValidationTests(): Promise<ValidationReport> {
    console.log('🧪 [SKILL TESTING] Starting comprehensive validation tests...');
    
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: Skill Cache Initialization
    results.push(await this.testSkillCacheInitialization());

    // Test 2: UUID Resolution
    results.push(await this.testUUIDResolution());

    // Test 3: Name Validation
    results.push(await this.testNameValidation());

    // Test 4: Performance Benchmarks
    results.push(await this.testPerformance());

    // Test 5: Data Integrity
    results.push(await this.testDataIntegrity());

    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    const totalDuration = Date.now() - startTime;

    const report: ValidationReport = {
      passed: failedTests === 0,
      totalTests: results.length,
      passedTests,
      failedTests,
      results,
      summary: {
        skillCacheTest: results[0]?.passed || false,
        uuidResolutionTest: results[1]?.passed || false,
        nameValidationTest: results[2]?.passed || false,
        performanceTest: results[3]?.passed || false,
        dataIntegrityTest: results[4]?.passed || false
      }
    };

    console.log(`🧪 [SKILL TESTING] Validation complete in ${totalDuration}ms:`, {
      passed: report.passed,
      passedTests,
      failedTests,
      totalTests: results.length
    });

    return report;
  }

  /**
   * Test skill cache initialization
   */
  private static async testSkillCacheInitialization(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Clear cache first
      SkillResolutionService.clearCache();
      
      // Initialize cache
      await SkillResolutionService.initializeSkillCache();
      
      // Get all skill names
      const skillNames = await SkillResolutionService.getAllSkillNames();
      
      const passed = Array.isArray(skillNames) && skillNames.length > 0;
      
      return {
        testName: 'Skill Cache Initialization',
        passed,
        details: {
          skillCount: skillNames.length,
          sampleSkills: skillNames.slice(0, 3)
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Skill Cache Initialization',
        passed: false,
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test UUID resolution
   */
  private static async testUUIDResolution(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Get sample UUIDs from database
      const { data: skills } = await supabase
        .from('skills')
        .select('id, name')
        .limit(3);

      if (!skills || skills.length === 0) {
        return {
          testName: 'UUID Resolution',
          passed: false,
          details: { error: 'No skills found in database' },
          duration: Date.now() - startTime,
          error: 'No skills found in database'
        };
      }

      const testUuids = skills.map(s => s.id);
      const expectedNames = skills.map(s => s.name);
      
      // Test resolution
      const resolvedNames = await SkillResolutionService.getSkillNames(testUuids);
      
      // Validate results
      const passed = resolvedNames.length === testUuids.length &&
                    resolvedNames.every((name, index) => name === expectedNames[index]);
      
      return {
        testName: 'UUID Resolution',
        passed,
        details: {
          testUuids,
          expectedNames,
          resolvedNames,
          matches: resolvedNames.map((name, i) => name === expectedNames[i])
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'UUID Resolution',
        passed: false,
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test name validation
   */
  private static async testNameValidation(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const testRefs = ['Senior', 'Junior', 'CPA', 'invalid-uuid', '123'];
      
      const validationResult = await SkillResolutionService.validateSkillReferences(testRefs);
      
      const passed = validationResult.resolved.length > 0;
      
      return {
        testName: 'Name Validation',
        passed,
        details: {
          testRefs,
          validationResult,
          resolvedCount: validationResult.resolved.length,
          invalidCount: validationResult.invalid.length
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Name Validation',
        passed: false,
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test performance benchmarks
   */
  private static async testPerformance(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Get sample data for performance testing
      const { data: skills } = await supabase
        .from('skills')
        .select('id')
        .limit(10);

      if (!skills || skills.length === 0) {
        return {
          testName: 'Performance Test',
          passed: false,
          details: { error: 'No skills available for performance testing' },
          duration: Date.now() - startTime,
          error: 'No skills available for performance testing'
        };
      }

      const testUuids = skills.map(s => s.id);
      
      // Test multiple resolutions
      const iterations = 5;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const iterStart = Date.now();
        await SkillResolutionService.getSkillNames(testUuids);
        times.push(Date.now() - iterStart);
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      // Performance should be under 500ms for 10 skills
      const passed = avgTime < 500 && maxTime < 1000;
      
      return {
        testName: 'Performance Test',
        passed,
        details: {
          iterations,
          skillCount: testUuids.length,
          averageTime: avgTime,
          maxTime,
          allTimes: times
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Performance Test',
        passed: false,
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test data integrity with real recurring tasks
   */
  private static async testDataIntegrity(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Get sample recurring tasks
      const { data: tasks } = await supabase
        .from('recurring_tasks')
        .select('required_skills')
        .limit(5);

      if (!tasks || tasks.length === 0) {
        return {
          testName: 'Data Integrity Test',
          passed: true, // No data to validate is considered pass
          details: { message: 'No recurring tasks found - nothing to validate' },
          duration: Date.now() - startTime
        };
      }

      let totalSkillRefs = 0;
      let validSkillRefs = 0;
      let invalidSkillRefs = 0;
      
      for (const task of tasks) {
        if (Array.isArray(task.required_skills)) {
          totalSkillRefs += task.required_skills.length;
          
          const validation = await SkillResolutionService.validateSkillReferences(task.required_skills);
          validSkillRefs += validation.valid.length;
          invalidSkillRefs += validation.invalid.length;
        }
      }
      
      const integrityScore = totalSkillRefs > 0 ? (validSkillRefs / totalSkillRefs) : 1;
      const passed = integrityScore > 0.8; // 80% or better integrity
      
      return {
        testName: 'Data Integrity Test',
        passed,
        details: {
          tasksChecked: tasks.length,
          totalSkillRefs,
          validSkillRefs,
          invalidSkillRefs,
          integrityScore: Math.round(integrityScore * 100) + '%'
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        testName: 'Data Integrity Test',
        passed: false,
        details: { error: error instanceof Error ? error.message : String(error) },
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
