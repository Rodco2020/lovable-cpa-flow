
import React from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import {
  MatrixLoadingState,
  MatrixErrorState,
  MatrixEmptyState
} from './';

interface EnhancedMatrixStateProps {
  className?: string;
  viewMode: 'hours' | 'percentage';
  isLoading: boolean;
  skillsLoading: boolean;
  error: string | null;
  skillsError: any;
  filteredData: MatrixData | null;
  onRetryMatrix: () => void;
  onRetrySkills: () => void;
}

export const EnhancedMatrixState: React.FC<EnhancedMatrixStateProps> = ({
  className,
  viewMode,
  isLoading,
  skillsLoading,
  error,
  skillsError,
  filteredData,
  onRetryMatrix,
  onRetrySkills
}) => {
  // Loading state
  if (isLoading || skillsLoading) {
    return (
      <MatrixLoadingState 
        className={className}
        viewMode={viewMode}
        skillsLoading={skillsLoading}
      />
    );
  }

  // Error state
  if (error || skillsError) {
    return (
      <MatrixErrorState
        className={className}
        viewMode={viewMode}
        error={error}
        skillsError={skillsError}
        onRetryMatrix={onRetryMatrix}
        onRetrySkills={onRetrySkills}
      />
    );
  }

  // No data state
  if (!filteredData) {
    return (
      <MatrixEmptyState
        className={className}
        viewMode={viewMode}
      />
    );
  }

  return null;
};
