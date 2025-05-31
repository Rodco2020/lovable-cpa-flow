
import { MatrixData } from '../matrixUtils';
import { 
  TrendAnalysis,
  CapacityRecommendation,
  ThresholdAlert,
  DrillDownData
} from '../analyticsService';
import { PerformanceMetrics } from '../cache/matrixCacheManager';

/**
 * Enhanced Matrix Service Types
 * Centralized type definitions for the enhanced matrix functionality
 */

export interface EnhancedMatrixOptions {
  includeAnalytics?: boolean;
  useCache?: boolean;
  progressCallback?: (progress: number) => void;
}

export interface EnhancedMatrixResult {
  matrixData: MatrixData;
  trends: TrendAnalysis[];
  recommendations: CapacityRecommendation[];
  alerts: ThresholdAlert[];
  performance: PerformanceMetrics;
}

export interface ExportOptions {
  selectedSkills: string[];
  monthRange: { start: number; end: number };
  includeAnalytics?: boolean;
  trends?: TrendAnalysis[];
  alerts?: ThresholdAlert[];
}
