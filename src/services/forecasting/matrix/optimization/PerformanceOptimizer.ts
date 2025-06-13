
import { MatrixData, ForecastType } from '../types';
import { DemandMatrixData } from '@/types/demand';
import { SkillType } from '@/types/task';
import { debugLog } from '../../logger';

/**
 * Performance Optimizer
 * 
 * Optimizes skill mapping performance, reduces redundant transformations,
 * and maintains caching effectiveness for matrix operations.
 */

export interface PerformanceMetrics {
  skillMappingTime: number;
  transformationTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  redundantOperations: number;
}

export interface OptimizationResult {
  originalMetrics: PerformanceMetrics;
  optimizedMetrics: PerformanceMetrics;
  improvements: {
    timeReduction: number;
    memoryReduction: number;
    redundancyReduction: number;
  };
  recommendations: string[];
}

export class PerformanceOptimizer {
  private static skillMappingCache = new Map<string, SkillType[]>();
  private static transformationCache = new Map<string, any>();
  private static operationCounter = new Map<string, number>();

  /**
   * Optimize skill mapping operations
   */
  static optimizeSkillMapping(
    demandSkills: SkillType[],
    capacitySkills: SkillType[]
  ): { skills: SkillType[]; metrics: Partial<PerformanceMetrics> } {
    const startTime = Date.now();
    
    // Create cache key for skill combination
    const cacheKey = this.createSkillCacheKey(demandSkills, capacitySkills);
    
    // Check cache first
    if (this.skillMappingCache.has(cacheKey)) {
      const cached = this.skillMappingCache.get(cacheKey)!;
      return {
        skills: cached,
        metrics: {
          skillMappingTime: Date.now() - startTime,
          cacheHitRate: 1
        }
      };
    }
    
    // Optimized skill union creation
    const skillSet = new Set<SkillType>();
    
    // Use single pass for demand skills (priority)
    for (const skill of demandSkills) {
      if (skill != null && skill !== '') {
        skillSet.add(skill);
      }
    }
    
    // Single pass for capacity skills (only new ones)
    for (const skill of capacitySkills) {
      if (skill != null && skill !== '' && !skillSet.has(skill)) {
        skillSet.add(skill);
      }
    }
    
    const optimizedSkills = Array.from(skillSet).sort() as SkillType[];
    
    // Cache the result
    this.skillMappingCache.set(cacheKey, optimizedSkills);
    
    // Maintain cache size (LRU-style cleanup)
    if (this.skillMappingCache.size > 100) {
      const firstKey = this.skillMappingCache.keys().next().value;
      this.skillMappingCache.delete(firstKey);
    }
    
    return {
      skills: optimizedSkills,
      metrics: {
        skillMappingTime: Date.now() - startTime,
        cacheHitRate: 0
      }
    };
  }

  /**
   * Optimize data transformations
   */
  static optimizeTransformation(
    sourceData: DemandMatrixData | MatrixData,
    transformationType: 'demand-to-capacity' | 'capacity-to-demand'
  ): { transformedData: any; metrics: Partial<PerformanceMetrics> } {
    const startTime = Date.now();
    
    // Create transformation cache key
    const cacheKey = this.createTransformationCacheKey(sourceData, transformationType);
    
    // Check cache
    if (this.transformationCache.has(cacheKey)) {
      return {
        transformedData: this.transformationCache.get(cacheKey),
        metrics: {
          transformationTime: Date.now() - startTime,
          cacheHitRate: 1
        }
      };
    }
    
    // Track redundant operations
    const operationKey = `${transformationType}-${sourceData.skills.length}-${sourceData.months.length}`;
    const operationCount = (this.operationCounter.get(operationKey) || 0) + 1;
    this.operationCounter.set(operationKey, operationCount);
    
    // Perform optimized transformation (placeholder - actual implementation depends on type)
    let transformedData;
    if (transformationType === 'demand-to-capacity') {
      transformedData = this.optimizedDemandToCapacityTransform(sourceData as DemandMatrixData);
    } else {
      transformedData = this.optimizedCapacityToDemandTransform(sourceData as MatrixData);
    }
    
    // Cache the result
    this.transformationCache.set(cacheKey, transformedData);
    
    // Maintain cache size
    if (this.transformationCache.size > 50) {
      const firstKey = this.transformationCache.keys().next().value;
      this.transformationCache.delete(firstKey);
    }
    
    return {
      transformedData,
      metrics: {
        transformationTime: Date.now() - startTime,
        cacheHitRate: 0,
        redundantOperations: operationCount > 1 ? operationCount - 1 : 0
      }
    };
  }

  /**
   * Analyze performance bottlenecks
   */
  static analyzePerformance(): {
    bottlenecks: string[];
    recommendations: string[];
    cacheStats: {
      skillMappingCacheSize: number;
      transformationCacheSize: number;
      redundantOperations: number;
    };
  } {
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze cache hit rates
    const redundantOperations = Array.from(this.operationCounter.values())
      .reduce((sum, count) => sum + Math.max(0, count - 1), 0);
    
    if (redundantOperations > 10) {
      bottlenecks.push('High number of redundant transformations detected');
      recommendations.push('Implement more aggressive caching for transformations');
    }
    
    if (this.skillMappingCache.size > 80) {
      bottlenecks.push('Skill mapping cache approaching capacity');
      recommendations.push('Consider increasing cache size or implementing better eviction policy');
    }
    
    if (this.transformationCache.size > 40) {
      bottlenecks.push('Transformation cache approaching capacity');
      recommendations.push('Optimize transformation caching strategy');
    }
    
    return {
      bottlenecks,
      recommendations,
      cacheStats: {
        skillMappingCacheSize: this.skillMappingCache.size,
        transformationCacheSize: this.transformationCache.size,
        redundantOperations
      }
    };
  }

  /**
   * Clear optimization caches
   */
  static clearCaches(): void {
    this.skillMappingCache.clear();
    this.transformationCache.clear();
    this.operationCounter.clear();
    debugLog('Performance optimization caches cleared');
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats() {
    return {
      skillMappingCacheHits: this.skillMappingCache.size,
      transformationCacheHits: this.transformationCache.size,
      totalOperations: Array.from(this.operationCounter.values()).reduce((sum, count) => sum + count, 0),
      redundantOperations: Array.from(this.operationCounter.values())
        .reduce((sum, count) => sum + Math.max(0, count - 1), 0)
    };
  }

  /**
   * Create cache key for skill mapping
   */
  private static createSkillCacheKey(demandSkills: SkillType[], capacitySkills: SkillType[]): string {
    return `skills:${demandSkills.sort().join(',')}:${capacitySkills.sort().join(',')}`;
  }

  /**
   * Create cache key for transformations
   */
  private static createTransformationCacheKey(data: any, type: string): string {
    return `transform:${type}:${data.skills.length}:${data.months.length}:${data.totalDemand || 0}`;
  }

  /**
   * Optimized demand to capacity transformation
   */
  private static optimizedDemandToCapacityTransform(demandData: DemandMatrixData): MatrixData {
    // Simplified transformation preserving skill keys
    return {
      months: demandData.months.map((m, index) => ({ ...m, index })),
      skills: demandData.skills,
      dataPoints: demandData.dataPoints.map(dp => ({
        skillType: dp.skillType,
        month: dp.month,
        monthLabel: dp.monthLabel,
        demandHours: dp.demandHours,
        capacityHours: 0, // No capacity in demand-only mode
        gap: -dp.demandHours,
        utilizationPercent: 0
      })),
      totalDemand: demandData.totalDemand,
      totalCapacity: 0,
      totalGap: -demandData.totalDemand
    };
  }

  /**
   * Optimized capacity to demand transformation
   */
  private static optimizedCapacityToDemandTransform(capacityData: MatrixData): DemandMatrixData {
    // Extract demand information from capacity matrix
    return {
      months: capacityData.months,
      skills: capacityData.skills,
      dataPoints: capacityData.dataPoints.map(dp => ({
        skillType: dp.skillType,
        month: dp.month,
        monthLabel: dp.monthLabel,
        demandHours: dp.demandHours,
        taskCount: 0, // Not available in capacity matrix
        clientCount: 0,
        taskBreakdown: []
      })),
      totalDemand: capacityData.totalDemand,
      totalTasks: 0,
      totalClients: 0
    };
  }
}
