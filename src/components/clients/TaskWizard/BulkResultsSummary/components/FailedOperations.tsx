
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle } from 'lucide-react';
import { FailedOperationsProps } from '../types';

export const FailedOperations: React.FC<FailedOperationsProps> = ({
  result
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Failed Operations ({result.failedOperations})</h4>
        <Badge variant="destructive">{result.errors.length} errors</Badge>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-2">
          {result.errors.map((error, index) => (
            <div 
              key={index}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-800">
                    Operation {index + 1} Failed
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    {error.clientId && <span>Client: {error.clientId} | </span>}
                    {error.templateId && <span>Template: {error.templateId}</span>}
                  </div>
                  <div className="text-sm text-red-700 mt-2 p-2 bg-red-100 rounded">
                    {error.error}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {result.errors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No errors recorded
        </div>
      )}
    </div>
  );
};
