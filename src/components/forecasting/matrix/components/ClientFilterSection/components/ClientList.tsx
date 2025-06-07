
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { Client } from '../types';

interface ClientListProps {
  clients: Client[];
  selectedClientIds: string[];
  onClientToggle: (clientId: string) => void;
  searchTerm: string;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  selectedClientIds,
  onClientToggle,
  searchTerm
}) => {
  if (clients.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {searchTerm ? `No clients found matching "${searchTerm}"` : 'No clients available'}
      </div>
    );
  }

  return (
    <div className="max-h-40 overflow-y-auto space-y-1">
      {clients.map(client => (
        <div key={client.id} className="flex items-center space-x-2 p-1">
          <Checkbox
            checked={selectedClientIds.includes(client.id)}
            onCheckedChange={() => onClientToggle(client.id)}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {client.legal_name}
            </div>
            {client.industry && (
              <div className="text-xs text-muted-foreground">
                {client.industry}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
