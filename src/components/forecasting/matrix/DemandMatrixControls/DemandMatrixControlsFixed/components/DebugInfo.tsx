
import React from 'react';
import { DemandMatrixData } from '@/types/demand';

interface DebugInfoProps {
  filteredData: DemandMatrixData | null;
  preferredStaffFilterMode: string;
  selectedPreferredStaffCount: number;
}

/**
 * Debug info component
 * Preserves exact debug display logic from DemandMatrixControlsFixed
 */
export const DebugInfo: React.FC<DebugInfoProps> = ({
  filteredData,
  preferredStaffFilterMode,
  selectedPreferredStaffCount
}) => {
  if (process.env.NODE_ENV !== 'development' || !filteredData) {
    return null;
  }

  return (
    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
      Debug: {filteredData.dataPoints.length} points | Mode: {preferredStaffFilterMode} | 
      Staff: {selectedPreferredStaffCount} selected
    </div>
  );
};
