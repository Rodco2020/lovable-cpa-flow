
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { FilterSection } from './FilterSection';
import { useSelectAllLogic } from '../hooks/useSelectAllLogic';

interface ClientsFilterProps {
  availableClients: Array<{ id: string; name: string }>;
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  isAllClientsSelected: boolean;
  loading?: boolean;
}

/**
 * Clients filter component
 * Handles client selection with select all functionality
 */
export const ClientsFilter: React.FC<ClientsFilterProps> = ({
  availableClients,
  selectedClients,
  onClientToggle,
  isAllClientsSelected,
  loading = false
}) => {
  const { handleSelectAll, selectAllText } = useSelectAllLogic(
    availableClients,
    selectedClients,
    (client) => onClientToggle(client.id),
    (client) => client.id
  );

  const badge = (
    <Badge variant="secondary">
      {isAllClientsSelected ? 'All' : `${selectedClients.length}/${availableClients.length}`}
    </Badge>
  );

  return (
    <FilterSection
      title={
        <span className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Clients
        </span>
      }
      badge={badge}
      loading={loading}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Select Clients</span>
          <button
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {selectAllText}
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {availableClients.map(client => (
            <label key={client.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedClients.includes(client.id)}
                onCheckedChange={() => onClientToggle(client.id)}
              />
              <span>{client.name}</span>
            </label>
          ))}
        </div>
      </div>
    </FilterSection>
  );
};
