
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface CompleteStepProps {
  operationResults: any;
  onStartOver: () => void;
}

/**
 * CompleteStep Component
 * 
 * Final step of the template assignment wizard.
 * Shows operation results and provides option to start over.
 */
export const CompleteStep: React.FC<CompleteStepProps> = ({
  operationResults,
  onStartOver
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Assignment Complete
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600">{operationResults?.tasksCreated || 0}</div>
              <div className="text-sm text-muted-foreground">Tasks Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{operationResults?.errors?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>

          {operationResults?.errors?.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {operationResults.errors.slice(0, 3).map((error: string, index: number) => (
                    <div key={index}>• {error}</div>
                  ))}
                  {operationResults.errors.length > 3 && (
                    <div>• ... and {operationResults.errors.length - 3} more errors</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-center">
      <Button onClick={onStartOver}>
        Start New Assignment
      </Button>
    </div>
  </div>
);
