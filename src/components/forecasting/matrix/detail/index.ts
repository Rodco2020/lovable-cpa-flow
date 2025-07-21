/**
 * Detail Matrix Module Exports
 * 
 * Phase 4: Complete integration of DetailForecastMatrixGrid
 * SURGICAL FIX: Added DetailMatrix wrapper export
 */

// NEW: Main wrapper component with context provider
export { DetailMatrix } from './DetailMatrix';

// Existing exports for backwards compatibility
export { DetailMatrixContainer } from './DetailMatrixContainer';
export { DetailMatrixStateProvider } from './DetailMatrixStateProvider';
export { DetailMatrixErrorBoundary } from './DetailMatrixErrorBoundary';

// New Detail Forecast Matrix Grid components
export { DetailForecastMatrixGrid } from './components/DetailForecastMatrixGrid';
export { DetailForecastMatrixHeader } from './components/DetailForecastMatrixHeader';
export { DetailForecastMatrixRow } from './components/DetailForecastMatrixRow';

// Staff Forecast Summary Components - Phase 4 Integration
export { StaffForecastSummaryGrid } from './components/StaffForecastSummaryGrid';
export { StaffForecastSummaryHeader } from './components/StaffForecastSummaryHeader';
export { StaffForecastSummaryRow } from './components/StaffForecastSummaryRow';
export { StaffSummaryTotalsRow } from './components/StaffSummaryTotalsRow';

// Hooks
export { useStaffForecastSummary } from './hooks/useStaffForecastSummary';
