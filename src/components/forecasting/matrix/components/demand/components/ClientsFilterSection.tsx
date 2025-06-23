
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { isAllItemsSelected } from './utils/selectionUtils';

interface ClientsFilterSectionProps {
  selectedClients: string[];
  availableClients: Array<{ id: string; name: string }>;
  onClientToggle: (client: string) => void;
  isControlsExpanded: boolean;
}

/**
 * Clients Filter Section Component
 * Handles client selection with individual checkboxes and select all/none functionality
 */
export const ClientsFilterSection: React.FC<ClientsFilterSectionProps> = ({
  selectedClients,
  availableClients,
  onClientToggle,
  isControlsExpanded
}) => {
  const isAllClientsSelected = isAllItemsSelected(selectedClients, availableClients);

  const handleSelectAllToggle = () => {
    if (isAllClientsSelected) {
      availableClients.forEach(client => onClientToggle(client.name));
    } else {
      availableClients.forEach(client => {
        if (!selectedClients.includes(client.name)) {
          onClientToggle(client.name);
        }
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Clients Filter</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAllToggle}
          className="h-6 px-2 text-xs"
        >
          {isAllClientsSelected ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Hide All
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Show All
            </>
          )}
        </Button>
      </div>
      
      {isControlsExpanded && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableClients.map((client) => (
            <div key={client.id} className="flex items-center space-x-2">
              <Checkbox
                id={`client-${client.id}`}
                checked={isAllClientsSelected || selectedClients.includes(client.name)}
                onCheckedChange={() => onClientToggle(client.name)}
              />
              <label 
                htmlFor={`client-${client.id}`} 
                className="text-sm cursor-pointer flex-1 truncate"
                title={client.name}
              >
                {client.name}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {!isControlsExpanded && (
        <div className="text-xs text-muted-foreground">
          {isAllClientsSelected ? 'All clients visible' : `${selectedClients.length}/${availableClients.length} clients selected`}
        </div>
      )}
    </div>
  );
};
