
import React from 'react';
import { CapacityMatrix } from './CapacityMatrix';

interface MatrixTabProps {
  className?: string;
}

/**
 * Matrix tab component for the forecast dashboard
 * Provides the 12-month matrix view of capacity vs demand
 */
export const MatrixTab: React.FC<MatrixTabProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Capacity Forecast Matrix</h3>
            <p className="text-sm text-muted-foreground">
              12-month view of demand vs capacity by skill type
            </p>
          </div>
        </div>
        
        <CapacityMatrix />
      </div>
    </div>
  );
};

export default MatrixTab;
