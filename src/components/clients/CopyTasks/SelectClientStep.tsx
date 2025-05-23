
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Client } from '@/types/client';

interface SelectClientStepProps {
  availableClients: Client[];
  targetClientId: string;
  setTargetClientId: (id: string) => void;
  isLoading: boolean;
}

/**
 * First step of the copy client tasks dialog
 * Allows selecting which client to copy tasks to
 */
export const SelectClientStep: React.FC<SelectClientStepProps> = ({
  availableClients,
  targetClientId,
  setTargetClientId,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select the client you want to copy tasks to:
      </p>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : availableClients.length > 0 ? (
        <Select
          value={targetClientId}
          onValueChange={setTargetClientId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {availableClients.map((client: Client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.legalName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="text-center py-4 text-amber-600">
          No other active clients available to copy tasks to.
        </div>
      )}
    </div>
  );
};
