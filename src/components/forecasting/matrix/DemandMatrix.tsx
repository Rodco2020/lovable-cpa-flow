
import React from 'react';
import { DemandMatrixStateProvider } from './DemandMatrixStateProvider';
import { DemandMatrixContainer } from './DemandMatrixContainer';

interface DemandMatrixProps {
  className?: string;
  groupingMode: 'skill' | 'client';
}

/**
 * Enhanced Demand Matrix Component with Refactored Architecture
 * 
 * This component now serves as the main entry point for the Demand Matrix feature,
 * providing a clean separation of concerns:
 * 
 * - DemandMatrixStateProvider: Manages all component state
 * - DemandMatrixContainer: Handles business logic and data operations
 * - DemandMatrixPresentation: Pure UI rendering component
 * 
 * The refactoring maintains exact functionality and UI appearance while improving
 * code structure, maintainability, and testability.
 */
export const DemandMatrix: React.FC<DemandMatrixProps> = ({ 
  className,
  groupingMode 
}) => {
  return (
    <DemandMatrixStateProvider>
      <DemandMatrixContainer 
        className={className}
        groupingMode={groupingMode}
      />
    </DemandMatrixStateProvider>
  );
};

export default DemandMatrix;
