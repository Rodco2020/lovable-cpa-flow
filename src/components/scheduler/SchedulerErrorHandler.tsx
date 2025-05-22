
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Check, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type ErrorLogEntry = {
  id: string;
  timestamp: Date;
  message: string;
  details?: string;
  taskId?: string;
  staffId?: string;
  severity: 'error' | 'warning' | 'info';
  resolved: boolean;
};

interface SchedulerErrorHandlerProps {
  errors: ErrorLogEntry[];
  onResolve: (errorId: string) => void;
  onClear: () => void;
  onRetry?: (errorId: string) => void;
}

const SchedulerErrorHandler: React.FC<SchedulerErrorHandlerProps> = ({
  errors,
  onResolve,
  onClear,
  onRetry
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeErrors, setActiveErrors] = useState<ErrorLogEntry[]>([]);

  // Filter active errors
  useEffect(() => {
    setActiveErrors(errors.filter(e => !e.resolved));
    
    // Auto-expand if there are new errors
    if (errors.some(e => !e.resolved)) {
      setExpanded(true);
    }
  }, [errors]);

  // If no active errors, no need to render
  if (activeErrors.length === 0) return null;

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50" aria-live="polite" role="alert">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <AlertTriangle className="text-amber-600 mr-2 h-5 w-5" aria-hidden="true" />
            <h3 className="font-medium text-amber-900">
              Scheduling Issues ({activeErrors.length})
            </h3>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
              aria-expanded={expanded}
              aria-controls="error-list"
            >
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClear}
              className="text-xs"
              aria-label="Clear all errors"
            >
              Clear All
            </Button>
          </div>
        </div>

        {expanded && (
          <ScrollArea className="max-h-60 overflow-auto" id="error-list">
            <div className="space-y-3">
              {activeErrors.map(error => (
                <Alert 
                  key={error.id} 
                  variant={error.severity === 'error' ? "destructive" : 
                          error.severity === 'warning' ? "warning" : "default"}
                  className="text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <AlertTitle className="text-sm font-medium mb-1">
                        {error.severity === 'error' && 'Error: '}
                        {error.severity === 'warning' && 'Warning: '}
                        {error.message}
                      </AlertTitle>
                      {error.details && (
                        <AlertDescription className="text-xs mt-1">
                          {error.details}
                        </AlertDescription>
                      )}
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Info className="h-3 w-3 mr-1" aria-hidden="true" />
                        {new Date(error.timestamp).toLocaleTimeString()}
                        {error.taskId && <span className="ml-2">Task ID: {error.taskId}</span>}
                        {error.staffId && <span className="ml-2">Staff ID: {error.staffId}</span>}
                      </div>
                    </div>
                    <div className="flex ml-4">
                      {onRetry && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onRetry(error.id)}
                          className="h-7 px-2"
                          aria-label="Retry"
                        >
                          Retry
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onResolve(error.id)}
                        className="h-7 px-2 ml-1"
                        aria-label="Mark as resolved"
                      >
                        <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SchedulerErrorHandler;
