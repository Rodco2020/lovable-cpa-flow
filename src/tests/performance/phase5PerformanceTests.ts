
/**
 * Phase 5: Performance Testing & Optimization Suite
 * 
 * Comprehensive performance testing and monitoring for the demand matrix system
 */

import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { SkillResolutionService } from '@/services/forecasting/demand/skillResolution/skillResolutionService';
import { DemandFilters } from '@/types/demand';

export interface PerformanceTestResult {
  testName: string;
  passed: boolean;
  metrics: {
    executionTime: number;
    memoryUsed: number;
    cacheHitRate?: number;
    throughput?: number;
  };
  benchmark: {
    threshold: number;
    target: number;
    achieved: number;
  };
}

export interface Phase5PerformanceReport {
  overallPassed: boolean;
  executionTime: number;
  testResults: PerformanceTestResult[];
  recommendations: string[];
  performanceSummary: {
    averageResponseTime: number;
    peakMemoryUsage: number;
    cacheEfficiency: number;
    systemThroughput: number;
  };
}

export class Phase5PerformanceTests {
  private static readonly PERFORMANCE_THRESHOLDS = {
    matrixGeneration: 2000, // 2 seconds
    skillResolution: 500,   // 500ms
    dataFiltering: 200,     // 200ms
    cacheAccess: 50,        // 50ms
    memoryLimit: 50 * 1024 * 1024, // 50MB
    cacheHitRate: 80        // 80%
  };

  /**
   * Run comprehensive performance test suite
   */
  public static async runPerformanceTests(): Promise<Phase5PerformanceReport> {
    console.log('⚡ [PHASE 5 PERFORMANCE] Starting comprehensive performance testing...');
    
    const startTime = performance.now();
    const testResults: PerformanceTestResult[] = [];

    // Initialize services
    await SkillResolutionService.initializeSkillCache();

    // Core Performance Tests
    testResults.push(await this.testMatrixGenerationPerformance());
    testResults.push(await this.testSkillResolutionPerformance());
    testResults.push(await this.testDataFilteringPerformance());
    testResults.push(await this.testCachePerformance());
    testResults.push(await this.testMemoryUsagePerformance());
    testResults.push(await this.testConcurrentRequestsPerformance());
    testResults.push(await this.testLargeDatasetPerformance());

    const executionTime = performance.now() - startTime;
    const overallPassed = testResults.every(test => test.passed);

    // Calculate performance summary
    const performanceSummary = this.calculatePerformanceSummary(testResults);
    const recommendations = this.generatePerformanceRecommendations(testResults, performanceSummary);

    console.log(`⚡ [PHASE 5 PERFORMANCE] Testing completed in ${Math.round(executionTime)}ms`);
    console.log(`📊 Overall Performance: ${overallPassed ? 'PASSED' : 'FAILED'}`);

    return {
      overallPassed,
      executionTime: Math.round(executionTime),
      testResults,
      recommendations,
      performanceSummary
    };
  }

  /**
   * Test matrix generation performance
   */
  private static async testMatrixGenerationPerformance(): Promise<PerformanceTestResult> {
    console.log('📊 Testing matrix generation performance...');
    
    const iterations = 5;
    const times: number[] = [];
    const memoryUsages: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const initialMemory = this.getMemoryUsage();
      const startTime = performance.now();
      
      try {
        await DemandMatrixService.generateDemandMatrix('demand-only');
        const endTime = performance.now();
        const finalMemory = this.getMemoryUsage();
        
        times.push(endTime - startTime);
        memoryUsages.push(finalMemory - initialMemory);
      } catch (error) {
        times.push(this.PERFORMANCE_THRESHOLDS.matrixGeneration + 1); // Mark as failed
      }
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const averageMemory = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length;
    const passed = averageTime <= this.PERFORMANCE_THRESHOLDS.matrixGeneration;

    return {
      testName: 'Matrix Generation Performance',
      passed,
      metrics: {
        executionTime: Math.round(averageTime),
        memoryUsed: Math.round(averageMemory)
      },
      benchmark: {
        threshold: this.PERFORMANCE_THRESHOLDS.matrixGeneration,
        target: this.PERFORMANCE_THRESHOLDS.matrixGeneration * 0.7, // 30% buffer
        achieved: Math.round(averageTime)
      }
    };
  }

  /**
   * Test skill resolution performance
   */
  private static async testSkillResolutionPerformance(): Promise<PerformanceTestResult> {
    console.log('🎯 Testing skill resolution performance...');
    
    const skillNames = await SkillResolutionService.getAllSkillNames();
    const testSkills = skillNames.slice(0, Math.min(10, skillNames.length));
    
    const iterations = 10;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        await SkillResolutionService.getSkillNames(testSkills);
        const endTime = performance.now();
        times.push(endTime - startTime);
      } catch (error) {
        times.push(this.PERFORMANCE_THRESHOLDS.skillResolution + 1);
      }
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const passed = averageTime <= this.PERFORMANCE_THRESHOLDS.skillResolution;

    return {
      testName: 'Skill Resolution Performance',
      passed,
      metrics: {
        executionTime: Math.round(averageTime),
        memoryUsed: 0, // Minimal memory impact
        throughput: Math.round(testSkills.length / (averageTime / 1000)) // skills per second
      },
      benchmark: {
        threshold: this.PERFORMANCE_THRESHOLDS.skillResolution,
        target: this.PERFORMANCE_THRESHOLDS.skillResolution * 0.5,
        achieved: Math.round(averageTime)
      }
    };
  }

  /**
   * Test data filtering performance
   */
  private static async testDataFilteringPerformance(): Promise<PerformanceTestResult> {
    console.log('🔍 Testing data filtering performance...');
    
    // Generate base data first
    const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
    
    if (!matrixData) {
      return {
        testName: 'Data Filtering Performance',
        passed: false,
        metrics: { executionTime: 0, memoryUsed: 0 },
        benchmark: { threshold: 0, target: 0, achieved: 0 }
      };
    }

    const skillNames = await SkillResolutionService.getAllSkillNames();
    const filters: DemandFilters = {
      skills: skillNames.slice(0, 3),
      clients: [],
      timeHorizon: {
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31')
      }
    };

    const iterations = 5;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        await DemandMatrixService.generateDemandMatrix('demand-only', new Date(), filters);
        const endTime = performance.now();
        times.push(endTime - startTime);
      } catch (error) {
        times.push(this.PERFORMANCE_THRESHOLDS.dataFiltering + 1);
      }
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const passed = averageTime <= this.PERFORMANCE_THRESHOLDS.dataFiltering * 10; // More lenient for full filtering

    return {
      testName: 'Data Filtering Performance',
      passed,
      metrics: {
        executionTime: Math.round(averageTime),
        memoryUsed: 0
      },
      benchmark: {
        threshold: this.PERFORMANCE_THRESHOLDS.dataFiltering * 10,
        target: this.PERFORMANCE_THRESHOLDS.dataFiltering * 5,
        achieved: Math.round(averageTime)
      }
    };
  }

  /**
   * Test cache performance
   */
  private static async testCachePerformance(): Promise<PerformanceTestResult> {
    console.log('💾 Testing cache performance...');
    
    const skillNames = await SkillResolutionService.getAllSkillNames();
    const testSkills = skillNames.slice(0, 5);
    
    // Cold cache test
    SkillResolutionService.clearCache();
    await SkillResolutionService.initializeSkillCache();
    
    const coldStartTime = performance.now();
    await SkillResolutionService.getSkillNames(testSkills);
    const coldEndTime = performance.now();
    const coldTime = coldEndTime - coldStartTime;

    // Warm cache test
    const warmStartTime = performance.now();
    await SkillResolutionService.getSkillNames(testSkills);
    const warmEndTime = performance.now();
    const warmTime = warmEndTime - warmStartTime;

    const cacheEffectiveness = coldTime > warmTime ? ((coldTime - warmTime) / coldTime) * 100 : 0;
    const passed = warmTime <= this.PERFORMANCE_THRESHOLDS.cacheAccess && cacheEffectiveness >= 50;

    return {
      testName: 'Cache Performance',
      passed,
      metrics: {
        executionTime: Math.round(warmTime),
        memoryUsed: 0,
        cacheHitRate: Math.round(cacheEffectiveness)
      },
      benchmark: {
        threshold: this.PERFORMANCE_THRESHOLDS.cacheAccess,
        target: this.PERFORMANCE_THRESHOLDS.cacheAccess * 0.3,
        achieved: Math.round(warmTime)
      }
    };
  }

  /**
   * Test memory usage performance
   */
  private static async testMemoryUsagePerformance(): Promise<PerformanceTestResult> {
    console.log('🧠 Testing memory usage performance...');
    
    const initialMemory = this.getMemoryUsage();
    
    // Perform multiple operations to test memory accumulation
    const iterations = 3;
    for (let i = 0; i < iterations; i++) {
      await DemandMatrixService.generateDemandMatrix('demand-only');
    }
    
    const finalMemory = this.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    const passed = memoryIncrease <= this.PERFORMANCE_THRESHOLDS.memoryLimit;

    return {
      testName: 'Memory Usage Performance',
      passed,
      metrics: {
        executionTime: 0,
        memoryUsed: memoryIncrease
      },
      benchmark: {
        threshold: this.PERFORMANCE_THRESHOLDS.memoryLimit,
        target: this.PERFORMANCE_THRESHOLDS.memoryLimit * 0.5,
        achieved: memoryIncrease
      }
    };
  }

  /**
   * Test concurrent requests performance
   */
  private static async testConcurrentRequestsPerformance(): Promise<PerformanceTestResult> {
    console.log('🔄 Testing concurrent requests performance...');
    
    const concurrentRequests = 3;
    const startTime = performance.now();
    
    const requests = Array.from({ length: concurrentRequests }, (_, i) => 
      DemandMatrixService.generateDemandMatrix('demand-only').catch(() => null)
    );
    
    const results = await Promise.all(requests);
    const endTime = performance.now();
    
    const totalTime = endTime - startTime;
    const successfulRequests = results.filter(result => result !== null).length;
    const throughput = successfulRequests / (totalTime / 1000); // requests per second
    
    const passed = totalTime <= this.PERFORMANCE_THRESHOLDS.matrixGeneration * 1.5 && 
                   successfulRequests >= concurrentRequests * 0.8; // 80% success rate

    return {
      testName: 'Concurrent Requests Performance',
      passed,
      metrics: {
        executionTime: Math.round(totalTime),
        memoryUsed: 0,
        throughput: Math.round(throughput * 100) / 100
      },
      benchmark: {
        threshold: this.PERFORMANCE_THRESHOLDS.matrixGeneration * 1.5,
        target: this.PERFORMANCE_THRESHOLDS.matrixGeneration,
        achieved: Math.round(totalTime)
      }
    };
  }

  /**
   * Test large dataset performance
   */
  private static async testLargeDatasetPerformance(): Promise<PerformanceTestResult> {
    console.log('📈 Testing large dataset performance...');
    
    // Simulate large dataset by using multiple filters
    const skillNames = await SkillResolutionService.getAllSkillNames();
    const filters: DemandFilters = {
      skills: skillNames,
      clients: Array.from({ length: 20 }, (_, i) => `large-client-${i}`),
      timeHorizon: {
        start: new Date('2025-01-01'),
        end: new Date('2025-12-31')
      }
    };

    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();
    
    try {
      await DemandMatrixService.generateDemandMatrix('demand-only', new Date(), filters);
      const endTime = performance.now();
      const finalMemory = this.getMemoryUsage();
      
      const executionTime = endTime - startTime;
      const memoryUsed = finalMemory - initialMemory;
      const passed = executionTime <= this.PERFORMANCE_THRESHOLDS.matrixGeneration * 2; // More lenient for large data

      return {
        testName: 'Large Dataset Performance',
        passed,
        metrics: {
          executionTime: Math.round(executionTime),
          memoryUsed
        },
        benchmark: {
          threshold: this.PERFORMANCE_THRESHOLDS.matrixGeneration * 2,
          target: this.PERFORMANCE_THRESHOLDS.matrixGeneration,
          achieved: Math.round(executionTime)
        }
      };
    } catch (error) {
      return {
        testName: 'Large Dataset Performance',
        passed: false,
        metrics: {
          executionTime: this.PERFORMANCE_THRESHOLDS.matrixGeneration * 2 + 1,
          memoryUsed: 0
        },
        benchmark: {
          threshold: this.PERFORMANCE_THRESHOLDS.matrixGeneration * 2,
          target: this.PERFORMANCE_THRESHOLDS.matrixGeneration,
          achieved: this.PERFORMANCE_THRESHOLDS.matrixGeneration * 2 + 1
        }
      };
    }
  }

  /**
   * Calculate performance summary
   */
  private static calculatePerformanceSummary(results: PerformanceTestResult[]): {
    averageResponseTime: number;
    peakMemoryUsage: number;
    cacheEfficiency: number;
    systemThroughput: number;
  } {
    const responseTimes = results.map(r => r.metrics.executionTime);
    const memoryUsages = results.map(r => r.metrics.memoryUsed);
    const cacheRates = results.filter(r => r.metrics.cacheHitRate).map(r => r.metrics.cacheHitRate!);
    const throughputs = results.filter(r => r.metrics.throughput).map(r => r.metrics.throughput!);

    return {
      averageResponseTime: Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length),
      peakMemoryUsage: Math.max(...memoryUsages),
      cacheEfficiency: cacheRates.length > 0 ? Math.round(cacheRates.reduce((sum, rate) => sum + rate, 0) / cacheRates.length) : 0,
      systemThroughput: throughputs.length > 0 ? Math.round((throughputs.reduce((sum, tp) => sum + tp, 0) / throughputs.length) * 100) / 100 : 0
    };
  }

  /**
   * Generate performance recommendations
   */
  private static generatePerformanceRecommendations(
    results: PerformanceTestResult[], 
    summary: any
  ): string[] {
    const recommendations: string[] = [];
    
    const failedTests = results.filter(test => !test.passed);
    
    if (failedTests.length > 0) {
      recommendations.push(`Address ${failedTests.length} failed performance tests`);
      
      failedTests.forEach(test => {
        if (test.testName.includes('Matrix Generation')) {
          recommendations.push('Consider implementing database query optimization for matrix generation');
        }
        if (test.testName.includes('Skill Resolution')) {
          recommendations.push('Optimize skill resolution caching strategy');
        }
        if (test.testName.includes('Memory')) {
          recommendations.push('Implement memory cleanup and garbage collection optimization');
        }
      });
    }
    
    if (summary.averageResponseTime > 1000) {
      recommendations.push('Implement lazy loading and progressive rendering for better response times');
    }
    
    if (summary.cacheEfficiency < 70) {
      recommendations.push('Improve caching strategy to increase cache hit rates');
    }
    
    if (summary.systemThroughput < 1) {
      recommendations.push('Consider implementing request queuing and parallel processing');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance benchmarks met - system is optimized for production');
    }
    
    return recommendations;
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }
}
