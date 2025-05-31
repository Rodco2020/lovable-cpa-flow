
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface MatrixControlsHeaderProps {
  onReset: () => void;
}

/**
 * Matrix Controls Header Component
 * Contains the title and reset button
 */
export const MatrixControlsHeader: React.FC<MatrixControlsHeaderProps> = ({ onReset }) => {
  return (
    <CardTitle className="text-sm font-medium flex items-center justify-between">
      Matrix Controls
      <Button variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset
      </Button>
    </CardTitle>
  );
};
