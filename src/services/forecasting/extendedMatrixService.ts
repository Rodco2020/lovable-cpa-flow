import { debugLog } from './logger';
import { MatrixData } from './matrixUtils';
import { DemandMatrixData } from '@/types/demand';
import { generateMatrixForecast, validateMatrixData, getMatrixCacheKey } from './matrixService';
import { DemandMatrixService } from './demandMatrixService';

/**
 * Extended Matrix Service
 * Provides unified interface for both capacity and demand matrix generation
 * UNIFIED: Now supports consistent data sources across all matrix types
 */
export class ExtendedMatrixService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate matrix forecast supporting both capacity and demand modes
   * UNIFIED: Capacity mode now uses same demand pipeline as demand mode
   */
  static async generateUnifiedMatrix(
    matrixType: 'capacity' | 'demand',
    forecastType: 'virtual' | 'actual' = 'virtual',
    startDate: Date = new Date()
  ): Promise<{
    matrixData?: MatrixData;
    demandMatrixData?: DemandMatrixData;
    matrixType: 'capacity' | 'demand';
  }> {
    debugLog('Generating UNIFIED matrix', { matrixType, forecastType, startDate });

    try {
      if (matrixType === 'capacity') {
        // UNIFIED: Use updated generateMatrixForecast with unified demand pipeline
        const { matrixData } = await generateMatrixForecast(forecastType);
        
        return {
          matrixData,
          matrixType: 'capacity'
        };
      } else {
        // Use new demand matrix service
        const { matrixData: demandMatrixData } = await DemandMatrixService.generateDemandMatrix(
          'demand-only',
          startDate
        );
        
        return {
          demandMatrixData,
          matrixType: 'demand'
        };
      }
    } catch (error) {
      console.error(`Error generating UNIFIED ${matrixType} matrix:`, error);
      throw new Error(`${matrixType} matrix generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate matrix data based on type
   */
  static validateMatrixData(
    matrixData: MatrixData | DemandMatrixData,
    matrixType: 'capacity' | 'demand'
  ): string[] {
    if (matrixType === 'capacity') {
      // Use unified validation from matrixService
      return validateMatrixData(matrixData as MatrixData);
    } else {
      // Use demand-specific validation
      return DemandMatrixService.validateDemandMatrixData(matrixData as DemandMatrixData);
    }
  }

  /**
   * Get appropriate cache key based on matrix type
   */
  static getCacheKey(
    matrixType: 'capacity' | 'demand',
    forecastType: 'virtual' | 'actual' | 'demand-only',
    startDate: Date
  ): string {
    if (matrixType === 'capacity') {
      return getMatrixCacheKey(forecastType as 'virtual' | 'actual', startDate);
    } else {
      return DemandMatrixService.getDemandMatrixCacheKey('demand-only', startDate);
    }
  }

  /**
   * Enhanced matrix generation with caching and validation
   */
  static async generateEnhancedDemandMatrix(
    mode: DemandMatrixMode = 'demand-only',
    options?: ExtendedMatrixOptions
  ): Promise<ExtendedMatrixResult> {
    const startTime = performance.now();
    
    try {
      // Use the correct method signature
      const { matrixData } = await DemandMatrixService.generateDemandMatrix(mode);
      
      // Apply any additional processing based on options
      const enhancedData = this.applyEnhancements(matrixData, options);
      
      const processingTime = performance.now() - startTime;
      
      return {
        matrixData: enhancedData,
        metadata: {
          generatedAt: new Date(),
          processingTime,
          mode,
          options: options || {}
        }
      };
    } catch (error) {
      console.error('Error in enhanced matrix generation:', error);
      throw error;
    }
  }

  /**
   * Get cached matrix with validation
   */
  static async getCachedMatrix(mode: DemandMatrixMode = 'demand-only'): Promise<ExtendedMatrixResult | null> {
    try {
      const cacheKey = DemandMatrixService.getDemandMatrixCacheKey(mode);
      const cached = this.cache.get(cacheKey);
      
      if (!cached) return null;
      
      const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
      if (isExpired) {
        this.cache.delete(cacheKey);
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Error retrieving cached matrix:', error);
      return null;
    }
  }

  private static applyEnhancements(matrixData: DemandMatrixData, options?: ExtendedMatrixOptions): DemandMatrixData {
    // Apply any enhancements based on options
    return matrixData;
  }
}

interface ExtendedMatrixOptions {
  includeAnalytics?: boolean;
  enhancePerformance?: boolean;
  customValidation?: boolean;
}

interface ExtendedMatrixResult {
  matrixData: DemandMatrixData;
  metadata: {
    generatedAt: Date;
    processingTime: number;
    mode: DemandMatrixMode;
    options: ExtendedMatrixOptions;
  };
}

type DemandMatrixMode = 'demand-only' | 'capacity-vs-demand';

interface DemandMatrixData {
  months: Array<{ key: string; label: string }>;
  skills: string[];
  dataPoints: any[];
  totalDemand: number;
  totalTasks: number;
  totalClients: number;
  skillSummary: Record<string, any>;
}
