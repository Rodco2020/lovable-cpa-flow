
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ControlsPanelHeaderProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
}

/**
 * Controls Panel Header Component
 * Handles the header section with expand/collapse functionality
 */
export const ControlsPanelHeader: React.FC<ControlsPanelHeaderProps> = ({
  isControlsExpanded,
  onToggleControls
}) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">Matrix Controls</h3>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleControls}
          className="flex items-center gap-1"
        >
          {isControlsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {isControlsExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
    </div>
  );
};
