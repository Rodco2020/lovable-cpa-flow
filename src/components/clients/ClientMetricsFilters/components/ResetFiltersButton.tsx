
import React from 'react';
import { Button } from '@/components/ui/button';

interface ResetFiltersButtonProps {
  onReset: () => void;
}

/**
 * Reset Filters Button Component
 * 
 * Renders a button to reset all applied filters
 */
export const ResetFiltersButton: React.FC<ResetFiltersButtonProps> = ({
  onReset
}) => {
  return (
    <Button 
      variant="outline" 
      onClick={onReset}
      size="sm"
    >
      Reset Filters
    </Button>
  );
};
