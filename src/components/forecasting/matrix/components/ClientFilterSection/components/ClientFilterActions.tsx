
import React from 'react';
import { Button } from '@/components/ui/button';
import type { Client } from '../types';

interface ClientFilterActionsProps {
  filteredClients: Client[];
  isAllSelected: boolean;
  selectedCount: number;
  onSelectAll: (clients: Client[]) => void;
  onClearAll: () => void;
}

export const ClientFilterActions: React.FC<ClientFilterActionsProps> = ({
  filteredClients,
  isAllSelected,
  selectedCount,
  onSelectAll,
  onClearAll
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onSelectAll(filteredClients)}
        disabled={isAllSelected}
      >
        Select All ({filteredClients.length})
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onClearAll}
        disabled={selectedCount === 0}
      >
        Clear All
      </Button>
    </div>
  );
};
