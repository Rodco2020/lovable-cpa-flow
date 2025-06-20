
import React from 'react';
import { DemandMatrixData } from '@/types/demand';
import { DemandMatrixGrid } from './DemandMatrixGrid';
import { DemandMatrixLoadingState } from './DemandMatrixLoadingState';
import { DemandMatrixErrorState } from './DemandMatrixErrorState';
import { DemandMatrixEmptyState } from './DemandMatrixEmptyState';

interface DemandMatrixDisplayProps {
  matrixData: DemandMatrixData | null;
  groupingMode: 'skill' | 'client';
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

/**
 * DemandMatrixDisplay Component
 * 
 * Handles the display logic for the demand matrix data with proper
 * loading, error, and empty states
 */
export const DemandMatrixDisplay: React.FC<DemandMatrixDisplayProps> = ({
  matrixData,
  groupingMode,
  isLoading = false,
  error = null,
  onRetry
}) => {
  // Loading state
  if (isLoading) {
    return <DemandMatrixLoadingState groupingMode={groupingMode} />;
  }

  // Error state
  if (error) {
    return (
      <DemandMatrixErrorState 
        error={error} 
        onRetry={onRetry || (() => {})} 
        groupingMode={groupingMode} 
      />
    );
  }

  // Empty state
  if (!matrixData || !matrixData.dataPoints || matrixData.dataPoints.length === 0) {
    return <DemandMatrixEmptyState groupingMode={groupingMode} onRefresh={onRetry} />;
  }

  // Main content
  return (
    <DemandMatrixGrid
      filteredData={matrixData}
      groupingMode={groupingMode}
    />
  );
};

export default DemandMatrixDisplay;
