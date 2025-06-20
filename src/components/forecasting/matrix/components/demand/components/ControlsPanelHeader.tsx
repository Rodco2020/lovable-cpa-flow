
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface ControlsPanelHeaderProps {
  isControlsExpanded: boolean;
  onToggleControls: () => void;
}

/**
 * Refactored Controls Panel Header Component
 * 
 * FUNCTIONALITY PRESERVED:
 * - Toggle controls expansion/collapse
 * - Visual feedback with chevron icons
 * - Accessibility labels for screen readers
 * - Consistent styling with card header
 */
export const ControlsPanelHeader: React.FC<ControlsPanelHeaderProps> = ({
  isControlsExpanded,
  onToggleControls
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Matrix Controls
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleControls}
          aria-label={isControlsExpanded ? "Collapse controls" : "Expand controls"}
        >
          {isControlsExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </CardHeader>
  );
};
