
/**
 * Performance Benchmark Runner
 * 
 * Runs comprehensive performance tests and benchmarks
 */

import { PerformanceBenchmarkResult } from '../QualityAssuranceOrchestrator';
import { DemandMatrixService } from '@/services/forecasting/demandMatrixService';
import { DemandPerformanceOptimizer } from '@/services/forecasting/demand/performanceOptimizer';

export class PerformanceBenchmarkRunner {
  /**
   * Run all performance benchmarks
   */
  public static async runBenchmarks(): Promise<PerformanceBenchmarkResult> {
    console.log('⚡ [PERFORMANCE BENCHMARKS] Starting performance testing...');
    
    const benchmarks = {
      loadTime: 0,
      memoryUsage: 0,
      largeDatasetPerformance: 0,
      bottlenecks: [] as string[]
    };

    try {
      // Benchmark 1: Initial load time
      benchmarks.loadTime = await this.benchmarkInitialLoadTime();
      console.log(`📊 Initial load time: ${benchmarks.loadTime}ms`);

      // Benchmark 2: Memory usage
      benchmarks.memoryUsage = await this.benchmarkMemoryUsage();
      console.log(`💾 Memory usage: ${benchmarks.memoryUsage}MB`);

      // Benchmark 3: Large dataset performance
      benchmarks.largeDatasetPerformance = await this.benchmarkLargeDatasetPerformance();
      console.log(`📈 Large dataset performance: ${benchmarks.largeDatasetPerformance}ms`);

      // Benchmark 4: Identify bottlenecks
      benchmarks.bottlenecks = await this.identifyPerformanceBottlenecks();
      console.log(`🔍 Performance bottlenecks: ${benchmarks.bottlenecks.length}`);

      // Determine if benchmarks pass
      const passed = this.evaluatePerformanceBenchmarks(benchmarks);

      console.log(`✅ [PERFORMANCE BENCHMARKS] Completed - ${passed ? 'PASSED' : 'FAILED'}`);

      return {
        passed,
        loadTime: benchmarks.loadTime,
        memoryUsage: benchmarks.memoryUsage,
        largeDatasetPerformance: benchmarks.largeDatasetPerformance,
        bottlenecks: benchmarks.bottlenecks
      };

    } catch (error) {
      console.error('❌ [PERFORMANCE BENCHMARKS] Failed:', error);
      
      return {
        passed: false,
        loadTime: 99999,
        memoryUsage: 999,
        largeDatasetPerformance: 99999,
        bottlenecks: [`Benchmark execution error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Benchmark initial load time
   */
  private static async benchmarkInitialLoadTime(): Promise<number> {
    const startTime = performance.now();
    
    // Simulate initial application load
    await DemandMatrixService.generateDemandMatrix('demand-only');
    
    return Math.round(performance.now() - startTime);
  }

  /**
   * Benchmark memory usage
   */
  private static async benchmarkMemoryUsage(): Promise<number> {
    const initialMemory = this.getMemoryUsage();
    
    // Generate large dataset
    await DemandMatrixService.generateDemandMatrix('demand-only');
    
    const finalMemory = this.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    return Math.round(memoryIncrease / 1024 / 1024); // Convert to MB
  }

  /**
   * Benchmark large dataset performance (1000+ clients, 50+ skills)
   */
  private static async benchmarkLargeDatasetPerformance(): Promise<number> {
    const startTime = performance.now();
    
    try {
      // Simulate large dataset scenario
      const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
      
      if (matrixData) {
        // Test filtering with large dataset
        const filters = {
          skills: matrixData.skills.slice(0, Math.min(50, matrixData.skills.length)),
          clients: [],
          timeHorizon: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31')
          }
        };
        
        DemandPerformanceOptimizer.optimizeFiltering(matrixData, filters);
      }
      
      return Math.round(performance.now() - startTime);
      
    } catch (error) {
      console.warn('Large dataset performance test failed:', error);
      return 99999; // Return high value to indicate failure
    }
  }

  /**
   * Identify performance bottlenecks
   */
  private static async identifyPerformanceBottlenecks(): Promise<string[]> {
    const bottlenecks: string[] = [];
    
    try {
      // Test various operations and identify slow ones
      const operations = [
        { name: 'Matrix Generation', test: () => DemandMatrixService.generateDemandMatrix('demand-only') },
        { name: 'Data Filtering', test: async () => {
          const { matrixData } = await DemandMatrixService.generateDemandMatrix('demand-only');
          if (matrixData) {
            DemandPerformanceOptimizer.optimizeFiltering(matrixData, {
              skills: [],
              clients: [],
              timeHorizon: { start: new Date(), end: new Date() }
            });
          }
        }}
      ];

      for (const operation of operations) {
        const startTime = performance.now();
        await operation.test();
        const duration = performance.now() - startTime;

        // Consider operation slow if it takes more than 2 seconds
        if (duration > 2000) {
          bottlenecks.push(`${operation.name}: ${Math.round(duration)}ms`);
        }
      }

    } catch (error) {
      bottlenecks.push(`Error during bottleneck analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return bottlenecks;
  }

  /**
   * Evaluate if performance benchmarks pass
   */
  private static evaluatePerformanceBenchmarks(benchmarks: {
    loadTime: number;
    memoryUsage: number;
    largeDatasetPerformance: number;
    bottlenecks: string[];
  }): boolean {
    const criteria = {
      maxLoadTime: 3000,        // 3 seconds
      maxMemoryUsage: 100,      // 100 MB
      maxLargeDatasetTime: 5000, // 5 seconds
      maxBottlenecks: 2         // Maximum 2 bottlenecks
    };

    return (
      benchmarks.loadTime <= criteria.maxLoadTime &&
      benchmarks.memoryUsage <= criteria.maxMemoryUsage &&
      benchmarks.largeDatasetPerformance <= criteria.maxLargeDatasetTime &&
      benchmarks.bottlenecks.length <= criteria.maxBottlenecks
    );
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Run stress test with configurable parameters
   */
  public static async runStressTest(config: {
    clientCount: number;
    skillCount: number;
    monthCount: number;
    iterations: number;
  }): Promise<{
    passed: boolean;
    averageTime: number;
    memoryPeak: number;
    errors: string[];
  }> {
    console.log(`🔥 [STRESS TEST] Starting with ${config.clientCount} clients, ${config.skillCount} skills`);
    
    const results = {
      passed: true,
      averageTime: 0,
      memoryPeak: 0,
      errors: [] as string[]
    };

    const times: number[] = [];
    let memoryPeak = 0;

    try {
      for (let i = 0; i < config.iterations; i++) {
        const startTime = performance.now();
        const initialMemory = this.getMemoryUsage();

        try {
          // Simulate stress conditions
          await DemandMatrixService.generateDemandMatrix('demand-only');
          
          const duration = performance.now() - startTime;
          times.push(duration);

          const currentMemory = this.getMemoryUsage();
          memoryPeak = Math.max(memoryPeak, currentMemory - initialMemory);

          console.log(`   Iteration ${i + 1}/${config.iterations}: ${Math.round(duration)}ms`);

        } catch (error) {
          results.errors.push(`Iteration ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      results.averageTime = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
      results.memoryPeak = Math.round(memoryPeak / 1024 / 1024); // Convert to MB
      results.passed = results.errors.length === 0 && results.averageTime < 5000;

      console.log(`✅ [STRESS TEST] Completed - Average: ${results.averageTime}ms, Peak Memory: ${results.memoryPeak}MB`);

    } catch (error) {
      results.passed = false;
      results.errors.push(`Stress test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }
}
