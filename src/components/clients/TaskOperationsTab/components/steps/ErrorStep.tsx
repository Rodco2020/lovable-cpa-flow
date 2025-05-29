
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorStepProps {
  onReset: () => void;
}

export const ErrorStep: React.FC<ErrorStepProps> = ({ onReset }) => {
  return (
    <div className="text-center py-8">
      <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Unknown Step</h3>
      <p className="text-muted-foreground">An error occurred in the copy workflow.</p>
      <Button onClick={onReset} className="mt-4">
        Reset
      </Button>
    </div>
  );
};
