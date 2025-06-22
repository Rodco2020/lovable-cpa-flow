
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useSelectAllLogic } from '@/components/forecasting/matrix/DemandMatrixControls/hooks/useSelectAllLogic';

interface ClientsFilterSectionProps {
  selectedClients: string[];
  setSelectedClients: (clients: string[]) => void;
  availableClients: Array<{ id: string; name: string; }>;
}

export const ClientsFilterSection: React.FC<ClientsFilterSectionProps> = ({
  selectedClients,
  setSelectedClients,
  availableClients
}) => {
  // Extract client IDs for the select all logic
  const clientIds = availableClients.map(client => client.id);
  
  const { isAllSelected, handleSelectAll } = useSelectAllLogic({
    selectedItems: selectedClients,
    setSelectedItems: setSelectedClients,
    availableItems: clientIds,
    itemType: 'client'
  });

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(
      selectedClients.includes(clientId)
        ? selectedClients.filter(id => id !== clientId)
        : [...selectedClients, clientId]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Clients</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="text-xs"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      <ScrollArea className="h-32">
        <div className="space-y-2">
          {availableClients.map((client) => (
            <div key={client.id} className="flex items-center space-x-2">
              <Checkbox
                id={`client-${client.id}`}
                checked={selectedClients.includes(client.id)}
                onCheckedChange={() => handleClientToggle(client.id)}
              />
              <Label
                htmlFor={`client-${client.id}`}
                className="text-sm cursor-pointer"
              >
                {client.name}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
