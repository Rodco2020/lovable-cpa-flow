
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Download } from 'lucide-react';
import { OperationResults } from '../hooks/utils/progressTracker';

interface CompleteStepProps {
  operationResults?: OperationResults | null;
  onReset: () => void;
  error?: string | null;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  operationResults,
  onReset,
  error
}) => {
  const handleDownloadResults = () => {
    if (!operationResults) return;

    const csvData = [
      ['Operation', 'Status', 'Details'],
      ...operationResults.results.map((result, index) => [
        `Operation ${index + 1}`,
        'Success',
        JSON.stringify(result)
      ]),
      ...operationResults.errors.map((error, index) => [
        `Error ${index + 1}`,
        'Failed',
        error
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700">Operation Failed</h3>
          <p className="text-sm text-muted-foreground">
            An error occurred during the assignment process
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-700">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={onReset} className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Start Over</span>
          </Button>
        </div>
      </div>
    );
  }

  if (!operationResults) {
    return (
      <div className="text-center py-8">
        <p>No results available</p>
        <Button onClick={onReset} className="mt-4">
          Start Over
        </Button>
      </div>
    );
  }

  const successRate = operationResults.totalOperations > 0 
    ? (operationResults.successfulOperations / operationResults.totalOperations) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-700">Assignment Complete</h3>
        <p className="text-sm text-muted-foreground">
          Your bulk assignment operation has been completed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {operationResults.successfulOperations}
            </div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {operationResults.failedOperations}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Operations:</span>
              <span className="ml-2">{operationResults.totalOperations}</span>
            </div>
            <div>
              <span className="font-medium">Processing Time:</span>
              <span className="ml-2">{(operationResults.processingTime / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {operationResults.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-700">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {operationResults.errors.map((error, index) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-3">
        <Button variant="outline" onClick={handleDownloadResults} className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download Results</span>
        </Button>
        <Button onClick={onReset} className="flex items-center space-x-2">
          <RotateCcw className="w-4 h-4" />
          <span>New Assignment</span>
        </Button>
      </div>
    </div>
  );
};
