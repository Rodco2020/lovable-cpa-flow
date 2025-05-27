
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, AlertTriangle } from 'lucide-react';
import { FailedOperationsProps } from '../types';

export const FailedOperations: React.FC<FailedOperationsProps> = ({
  result
}) => {
  if (result.errors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Failed Operations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No failed operations to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <XCircle className="h-4 w-4 text-red-500" />
          <span>Failed Operations ({result.errors.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {result.errors.map((error, index) => (
            <div key={index} className="p-3 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      Error
                    </Badge>
                    {error.clientId && (
                      <span className="text-xs text-muted-foreground">
                        Client: {error.clientId}
                      </span>
                    )}
                    {error.templateId && (
                      <span className="text-xs text-muted-foreground">
                        Template: {error.templateId}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-red-700">
                    {error.error}
                  </div>
                  {error.details && (
                    <div className="text-xs text-red-600 mt-1 font-mono bg-red-100 p-1 rounded">
                      {JSON.stringify(error.details)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
