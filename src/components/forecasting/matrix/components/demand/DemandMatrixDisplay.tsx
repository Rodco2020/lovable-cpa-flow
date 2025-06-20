
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
  error = null
}) => {
  // Loading state
  if (isLoading) {
    return <DemandMatrixLoadingState />;
  }

  // Error state
  if (error) {
    return <DemandMatrixErrorState error={error} />;
  }

  // Empty state
  if (!matrixData || !matrixData.dataPoints || matrixData.dataPoints.length === 0) {
    return <DemandMatrixEmptyState />;
  }

  // Main content
  return (
    <DemandMatrixGrid
      matrixData={matrixData}
      groupingMode={groupingMode}
    />
  );
};

export default DemandMatrixDisplay;
