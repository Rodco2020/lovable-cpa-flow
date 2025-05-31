
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ViewModeSectionProps {
  viewMode: 'hours' | 'percentage';
  onViewModeChange: (mode: 'hours' | 'percentage') => void;
}

/**
 * View Mode Selection Component
 * Handles switching between hours and percentage display modes
 */
export const ViewModeSection: React.FC<ViewModeSectionProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">View Mode</Label>
      <Select value={viewMode} onValueChange={onViewModeChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hours">Hours View</SelectItem>
          <SelectItem value="percentage">Percentage View</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
