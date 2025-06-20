
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface ClientsFilterSectionProps {
  selectedClients: string[];
  onClientToggle: (clientId: string) => void;
  availableClients: Array<{ id: string; name: string }>;
  isAllSelected: boolean;
}

export const ClientsFilterSection: React.FC<ClientsFilterSectionProps> = ({
  selectedClients,
  onClientToggle,
  availableClients,
  isAllSelected
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Clients Filter</h4>
        <Badge variant="outline">
          {isAllSelected ? 'All' : `${selectedClients.length}/${availableClients.length}`}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {availableClients.map((client) => (
          <div key={client.id} className="flex items-center space-x-2">
            <Checkbox
              id={client.id}
              checked={selectedClients.includes(client.id)}
              onCheckedChange={() => onClientToggle(client.id)}
            />
            <Label htmlFor={client.id} className="text-sm font-normal">
              {client.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
