
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { Client } from '../types';

interface SelectedClientsSummaryProps {
  selectedClientIds: string[];
  clients: Client[];
}

export const SelectedClientsSummary: React.FC<SelectedClientsSummaryProps> = ({
  selectedClientIds,
  clients
}) => {
  if (selectedClientIds.length === 0) {
    return null;
  }

  return (
    <div className="pt-2 border-t">
      <div className="text-xs font-medium mb-2">Selected:</div>
      <div className="flex flex-wrap gap-1">
        {selectedClientIds.slice(0, 3).map(clientId => {
          const client = clients.find(c => c.id === clientId);
          return client ? (
            <Badge key={clientId} variant="secondary" className="text-xs">
              {client.legal_name}
            </Badge>
          ) : null;
        })}
        {selectedClientIds.length > 3 && (
          <Badge variant="secondary" className="text-xs">
            +{selectedClientIds.length - 3} more
          </Badge>
        )}
      </div>
    </div>
  );
};
