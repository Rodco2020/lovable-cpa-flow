
import React from 'react';
import { DemandMatrixStateProvider } from '../DemandMatrixStateProvider';
import { DetailMatrixContainer } from './DetailMatrixContainer';

interface DetailMatrixProps {
  groupingMode: 'skill' | 'client';
  initialViewMode: string;
}

/**
 * DetailMatrix component that wraps DetailMatrixContainer with required state provider.
 * This mirrors the architecture of DemandMatrix for consistency.
 * 
 * SURGICAL FIX: Provides DemandMatrixStateProvider context that DetailMatrixContainer requires
 * when calling useDemandMatrixState() hook.
 */
export const DetailMatrix: React.FC<DetailMatrixProps> = ({ 
  groupingMode, 
  initialViewMode 
}) => {
  return (
    <DemandMatrixStateProvider>
      <DetailMatrixContainer 
        groupingMode={groupingMode} 
        initialViewMode={initialViewMode} 
      />
    </DemandMatrixStateProvider>
  );
};
