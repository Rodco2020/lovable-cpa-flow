
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  legal_name: string;
  industry: string;
  status: string;
}

interface ClientFilterSectionProps {
  selectedClientIds: string[];
  onClientSelectionChange: (clientIds: string[]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ClientFilterSection: React.FC<ClientFilterSectionProps> = ({
  selectedClientIds,
  onClientSelectionChange,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch clients data
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients-for-matrix-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, industry, status')
        .eq('status', 'active')
        .order('legal_name');
      
      if (error) throw error;
      return data as Client[];
    }
  });

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      client.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleClientToggle = (clientId: string) => {
    const newSelection = selectedClientIds.includes(clientId)
      ? selectedClientIds.filter(id => id !== clientId)
      : [...selectedClientIds, clientId];
    onClientSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onClientSelectionChange(filteredClients.map(c => c.id));
  };

  const handleClearAll = () => {
    onClientSelectionChange([]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Client Filter
          </CardTitle>
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              {isCollapsed ? 'Show' : 'Hide'}
            </Button>
          )}
        </div>
        
        {selectedClientIds.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{selectedClientIds.length} clients selected</span>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>

          {/* Client list */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {searchTerm ? 'No clients found' : 'No active clients'}
              </div>
            ) : (
              filteredClients.map(client => (
                <div key={client.id} className="flex items-center space-x-2 p-1">
                  <Checkbox
                    checked={selectedClientIds.includes(client.id)}
                    onCheckedChange={() => handleClientToggle(client.id)}
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
              ))
            )}
          </div>

          {/* Selected clients summary */}
          {selectedClientIds.length > 0 && (
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
          )}
        </CardContent>
      )}
    </Card>
  );
};
