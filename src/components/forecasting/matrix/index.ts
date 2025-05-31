
export { MatrixTab } from './MatrixTab';
export { CapacityMatrix } from './CapacityMatrix';
export { EnhancedCapacityMatrix } from './EnhancedCapacityMatrix';
export { AccessibilityEnhancedMatrix } from './AccessibilityEnhancedMatrix';
export { ProductionOptimizedMatrix } from './ProductionOptimizedMatrix';
export { MatrixCell } from './MatrixCell';
export { EnhancedMatrixCell } from './EnhancedMatrixCell';
export { MatrixLegend } from './MatrixLegend';
export { EnhancedMatrixLegend } from './EnhancedMatrixLegend';
export { MatrixControls } from './MatrixControls';
export { IntegratedMatrixControls } from './IntegratedMatrixControls';
export { DrillDownDialog } from './DrillDownDialog';
export { MatrixErrorBoundary } from './MatrixErrorBoundary';
export { useMatrixControls } from './hooks/useMatrixControls';

// Export new advanced features
export type { 
  TrendAnalysis, 
  CapacityRecommendation, 
  ThresholdAlert, 
  DrillDownData 
} from '@/services/forecasting/analyticsService';

export { AdvancedAnalyticsService } from '@/services/forecasting/analyticsService';
export { EnhancedMatrixService } from '@/services/forecasting/enhancedMatrixService';
export { MatrixTestingService } from '@/services/forecasting/matrixTesting';
export { ProductionOptimizationService } from '@/services/forecasting/productionOptimizationService';

// Export production-ready components
export type { BundleAnalysis, PerformanceMetrics } from '@/services/forecasting/productionOptimizationService';
