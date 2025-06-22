
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ControlsHeaderProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
  filteredDataPointsCount?: number;
  totalDemand?: number;
}

/**
 * Controls header component
 * Preserves exact UI and functionality from DemandMatrixControlsFixed
 */
export const ControlsHeader: React.FC<ControlsHeaderProps> = ({
  isControlsExpanded,
  onToggleControls,
  filteredDataPointsCount,
  totalDemand
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Demand Matrix Controls (Fixed)</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleControls}
        >
          {isControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {filteredDataPointsCount !== undefined && totalDemand !== undefined && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredDataPointsCount} data points ({totalDemand.toFixed(1)}h total)
        </div>
      )}
    </CardHeader>
  );
};
