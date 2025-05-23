
import React from 'react';
import { Client } from '@/types/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SelectClientStepProps {
  availableClients: Client[];
  clientsLoading: boolean;
  targetClientId: string;
  setTargetClientId: (value: string) => void;
}

/**
 * First step of the copy client tasks dialog
 * Allows selecting the target client to copy tasks to
 */
export const SelectClientStep: React.FC<SelectClientStepProps> = ({
  availableClients,
  clientsLoading,
  targetClientId,
  setTargetClientId
}) => {
  return (
    <div className="py-6 space-y-4">
      <p className="text-sm text-gray-500">
        Select a client to copy tasks to:
      </p>
      <Select
        value={targetClientId}
        onValueChange={(value) => setTargetClientId(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clientsLoading ? (
            <div className="p-2 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading clients...</span>
            </div>
          ) : availableClients.length === 0 ? (
            <div className="p-2 text-center text-gray-500">No other clients available</div>
          ) : (
            availableClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.legalName}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          You will be able to select which tasks to copy in the next step.
        </AlertDescription>
      </Alert>
    </div>
  );
};
