
import React from 'react';
import { Client } from '@/types/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

interface ClientSelectorProps {
  clients: Client[];
  clientId: string;
  isSubmitting: boolean;
  formErrors: Record<string, string>;
  onClientChange: (clientId: string) => void;
}

/**
 * Client Selector Component
 * 
 * Handles client selection with proper dropdown UI and validation
 */
const ClientSelector: React.FC<ClientSelectorProps> = ({
  clients,
  clientId,
  isSubmitting,
  formErrors,
  onClientChange
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="clientId" className="text-sm font-medium">
        Client
      </label>
      <Select 
        value={clientId} 
        onValueChange={onClientChange}
        disabled={isSubmitting}
      >
        <SelectTrigger className="w-full">
          <Users className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.length > 0 ? (
            clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.legalName}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No clients found
            </div>
          )}
        </SelectContent>
      </Select>
      {formErrors.clientId && (
        <p className="text-sm font-medium text-destructive">{formErrors.clientId}</p>
      )}
    </div>
  );
};

export default ClientSelector;
