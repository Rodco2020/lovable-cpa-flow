
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { ControlHeaderProps } from '../types';

/**
 * Reusable control header component
 * Handles expansion/collapse and reset functionality
 */
export const ControlHeader: React.FC<ControlHeaderProps> = ({
  isControlsExpanded,
  onToggleControls,
  onReset
}) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">Matrix Controls</h3>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onReset}
          variant="outline" 
          size="sm"
          className="h-6 px-2 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
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
