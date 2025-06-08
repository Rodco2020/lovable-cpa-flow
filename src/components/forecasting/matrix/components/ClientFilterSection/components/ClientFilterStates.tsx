
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ClientFilterStatesProps {
  isLoading: boolean;
  error: Error | null;
  clientsCount: number;
  isAllSelected: boolean;
}

export const ClientFilterStates: React.FC<ClientFilterStatesProps> = ({
  isLoading,
  error,
  clientsCount,
  isAllSelected
}) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load clients: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading clients...</div>
    );
  }

  if (clientsCount === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active clients found in the database. Check if clients have status set to "Active".
        </AlertDescription>
      </Alert>
    );
  }

  if (isAllSelected) {
    return (
      <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
        ✅ All clients selected by default
      </div>
    );
  }

  return null;
};
