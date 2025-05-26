
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';

export const RecurringTaskLoadingState: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Recurring Tasks
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading recurring tasks...</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface RecurringTaskErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export const RecurringTaskErrorState: React.FC<RecurringTaskErrorStateProps> = ({ 
  error, 
  onRetry 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Recurring Tasks
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold text-destructive">Error Loading Tasks</p>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const RecurringTaskEmptyState: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Recurring Tasks
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-lg font-semibold">No recurring tasks</p>
        <p className="text-muted-foreground">This client doesn't have any recurring tasks set up yet.</p>
      </div>
    </CardContent>
  </Card>
);
