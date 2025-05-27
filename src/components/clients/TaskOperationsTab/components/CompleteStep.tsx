
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface CompleteStepProps {
  operationResults: {
    success: boolean;
    tasksCreated: number;
    errors: string[];
  } | null;
  onReset: () => void;
  onClose?: () => void;
  error: Error | null;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  operationResults,
  onReset,
  onClose,
  error
}) => {
  const isSuccess = operationResults?.success && !error;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSuccess ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              Assignment Complete
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-red-600" />
              Assignment Error
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-4">
                <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Success!</h3>
                <p className="text-sm text-muted-foreground">
                  {operationResults?.tasksCreated} task(s) created successfully
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-red-600 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Error Occurred</h3>
                <p className="text-sm text-muted-foreground">
                  {error?.message || 'An error occurred during assignment'}
                </p>
                {operationResults?.errors && operationResults.errors.length > 0 && (
                  <div className="mt-2 text-left">
                    <p className="font-medium">Errors:</p>
                    <ul className="text-sm list-disc list-inside">
                      {operationResults.errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onReset}>
              Start Over
            </Button>
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
