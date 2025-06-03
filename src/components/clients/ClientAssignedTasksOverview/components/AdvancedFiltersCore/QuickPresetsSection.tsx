
import React from 'react';
import { Button } from '@/components/ui/button';
import { AdvancedFilterState, QUICK_PRESETS } from './types';

interface QuickPresetsSectionProps {
  filters: AdvancedFilterState;
  onApplyPreset: (presetId: string) => void;
}

/**
 * Quick Presets Section Component
 * Handles preset filter buttons
 */
export const QuickPresetsSection: React.FC<QuickPresetsSectionProps> = ({
  filters,
  onApplyPreset
}) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
      <div className="flex flex-wrap gap-2">
        {QUICK_PRESETS.map(preset => (
          <Button
            key={preset.id}
            variant={filters.preset === preset.id ? "default" : "outline"}
            size="sm"
            onClick={() => onApplyPreset(preset.id)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
