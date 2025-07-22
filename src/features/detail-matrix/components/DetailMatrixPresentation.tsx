import React from 'react';
import { Button } from '@/components/ui/button';
import { DemandMatrixControlsPanel } from '@/components/forecasting/matrix/components/demand/DemandMatrixControlsPanel';
import { useDetailMatrixState } from '@/components/forecasting/matrix/detail/DetailMatrixStateProvider';
import { Maximize2, Minimize2 } from 'lucide-react';

interface DetailMatrixPresentationProps {
  demandMatrixControls: any; // Controls data from useDetailMatrixData
  isLoading: boolean;
  error: string | null;
  children: React.ReactNode; // DetailMatrixView component
}

/**
 * Detail Matrix Presentation Component
 * 
 * Implements two-panel layout for Detail Matrix using the same responsive grid
 * structure as DemandMatrixPresentation. Reuses DemandMatrixControlsPanel
 * with matrixType="detail" for consistency.
 */
export const DetailMatrixPresentation: React.FC<DetailMatrixPresentationProps> = ({
  demandMatrixControls,
  isLoading,
  error,
  children
}) => {
  const { isControlsExpanded, setIsControlsExpanded } = useDetailMatrixState();

  const handleToggleControls = () => {
    setIsControlsExpanded(!isControlsExpanded);
  };

  // If loading or error, render children directly without layout complexity
  if (isLoading || error) {
    return <>{children}</>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Mobile Controls Toggle */}
      <div className="xl:hidden">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleToggleControls}
          className="w-full mb-4"
        >
          {isControlsExpanded ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
          {isControlsExpanded ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </div>

      {/* Controls Panel */}
      <div className={`xl:col-span-1 ${isControlsExpanded ? 'xl:col-span-2' : ''}`}>
        <div className={`${isControlsExpanded ? 'block' : 'hidden xl:block'}`}>
          <DemandMatrixControlsPanel
            isControlsExpanded={isControlsExpanded}
            onToggleControls={handleToggleControls}
            matrixType="detail"
            {...demandMatrixControls}
          />
        </div>
      </div>

      {/* Content Panel */}
      <div className={`xl:col-span-4 ${isControlsExpanded ? 'xl:col-span-3' : ''}`}>
        {children}
      </div>
    </div>
  );
};