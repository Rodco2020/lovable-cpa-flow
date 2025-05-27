
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OperationProgress } from '../OperationProgress';

interface ProcessingStepProps {
  progress: any;
  isProcessing: boolean;
  operationResults: any;
  error: string | null;
}

/**
 * ProcessingStep Component
 * 
 * Fourth step of the template assignment wizard.
 * Shows real-time progress of the assignment operation.
 */
export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  progress,
  isProcessing,
  operationResults,
  error
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Processing Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <OperationProgress
          progress={progress}
          isProcessing={isProcessing}
          results={operationResults}
          error={error}
        />
      </CardContent>
    </Card>
  </div>
);
