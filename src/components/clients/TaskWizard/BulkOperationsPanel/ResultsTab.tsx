
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { BulkOperationResult } from '../types';

interface ResultsTabProps {
  result?: BulkOperationResult;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No results available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-green-600">
            <CheckCircle className="h-6 w-6" />
            <span>{result.successfulOperations}</span>
          </div>
          <p className="text-sm text-green-600">Successful</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <span>{result.failedOperations}</span>
          </div>
          <p className="text-sm text-red-600">Failed</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{result.totalOperations}</div>
          <p className="text-sm text-blue-600">Total</p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Processing time: {(result.processingTime / 1000).toFixed(1)}s
      </div>

      {result.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-red-600">Errors:</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {result.errors.map((error, index) => (
              <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                {error.clientId && <span className="font-medium">Client {error.clientId}: </span>}
                {error.error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
