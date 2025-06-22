
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useSelectAllLogic } from '../../../DemandMatrixControls/hooks/useSelectAllLogic';

interface ClientsFilterSectionProps {
  availableClients: Array<{ id: string; name: string }>;
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  isAllClientsSelected: boolean;
  isControlsExpanded: boolean;
}

/**
 * Clients Filter Section Component
 * Handles client selection with show all/hide all functionality
 */
export const ClientsFilterSection: React.FC<ClientsFilterSectionProps> = ({
  availableClients,
  selectedClients,
  onClientToggle,
  isAllClientsSelected,
  isControlsExpanded
}) => {
  const { handleSelectAll } = useSelectAllLogic(
    availableClients,
    selectedClients,
    (client) => onClientToggle(client.id),
    (client) => client.id
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Clients Filter</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
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
                checked={isAllClientsSelected || selectedClients.includes(client.id)}
                onCheckedChange={() => onClientToggle(client.id)}
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
