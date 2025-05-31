
// Enhanced Matrix Service Module
// 
// This module provides a refactored, maintainable architecture for enhanced matrix operations
// while preserving all existing functionality and APIs.

export { EnhancedMatrixService } from './enhancedMatrixService';
export { MatrixDataLoader } from './dataLoader';
export { AnalyticsProcessor } from './analyticsProcessor';
export { EnhancedCacheManager } from './cacheManager';
export { ExportManager } from './exportManager';
export { DrillDownProvider } from './drillDownProvider';
export { ReportGenerator } from './reportGenerator';

export type {
  EnhancedMatrixOptions,
  EnhancedMatrixResult,
  ExportOptions
} from './types';
