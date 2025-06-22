
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Download } from 'lucide-react';

interface ActionButtonsProps {
  onReset: () => void;
  onExport?: () => void;
  preferredStaffFilterMode: string;
  selectedPreferredStaffCount: number;
  filteredDataPointsCount: number;
}

/**
 * Action buttons component
 * Preserves exact button layout and functionality from DemandMatrixControlsFixed
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onReset,
  onExport,
  preferredStaffFilterMode,
  selectedPreferredStaffCount,
  filteredDataPointsCount
}) => {
  const handleExport = React.useCallback(() => {
    console.log('📤 [FIXED] Exporting with current filters:', {
      preferredStaffFilterMode,
      selectedPreferredStaffCount,
      filteredDataPointsCount
    });
    onExport?.();
  }, [onExport, preferredStaffFilterMode, selectedPreferredStaffCount, filteredDataPointsCount]);

  return (
    <div className="flex gap-2 pt-4 border-t">
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>
    </div>
  );
};
