
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Enhanced clients data fetching with debugging
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients-for-matrix-filter'],
    queryFn: async () => {
      console.log('🔍 ClientFilterSection: Starting client fetch...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, industry, status')
        .order('legal_name');
      
      if (error) {
        console.error('❌ ClientFilterSection: Database error:', error);
        throw error;
      }
      
      console.log('📊 ClientFilterSection: Raw client data received:', {
        totalClients: data?.length || 0,
        rawData: data,
        statusBreakdown: data?.reduce((acc, client) => {
          acc[client.status] = (acc[client.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      // Filter for active clients with case-insensitive matching
      const activeClients = data?.filter(client => {
        const status = client.status?.toLowerCase();
        return status === 'active';
      }) || [];

      console.log('✅ ClientFilterSection: Active clients filtered:', {
        activeCount: activeClients.length,
        activeClients: activeClients.map(c => ({ id: c.id, name: c.legal_name, status: c.status }))
      });
      
      return activeClients as Client[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Enhanced search filtering with debugging
  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      console.log('🔍 ClientFilterSection: No search term, showing all active clients:', clients.length);
      return clients;
    }
    
    const filtered = clients.filter(client =>
      client.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('🔍 ClientFilterSection: Search filtered results:', {
      searchTerm,
      filteredCount: filtered.length,
      totalActiveClients: clients.length
    });
    
    return filtered;
  }, [clients, searchTerm]);

  // Phase 2: UI state synchronization for default selection
  const isAllSelected = useMemo(() => {
    if (clients.length === 0) return false;
    return selectedClientIds.length === clients.length && 
           clients.every(client => selectedClientIds.includes(client.id));
  }, [clients, selectedClientIds]);

  const isPartiallySelected = useMemo(() => {
    return selectedClientIds.length > 0 && selectedClientIds.length < clients.length;
  }, [clients, selectedClientIds]);

  // Phase 2: Debug logging for UI state verification
  useEffect(() => {
    console.log('🎨 ClientFilterSection: Phase 2 UI State Check:', {
      totalClients: clients.length,
      selectedCount: selectedClientIds.length,
      isAllSelected,
      isPartiallySelected,
      shouldShowAsDefaultSelected: isAllSelected
    });
  }, [clients, selectedClientIds, isAllSelected, isPartiallySelected]);

  const handleClientToggle = (clientId: string) => {
    console.log('🎯 ClientFilterSection: Client toggle requested:', { clientId, currentlySelected: selectedClientIds.includes(clientId) });
    
    const newSelection = selectedClientIds.includes(clientId)
      ? selectedClientIds.filter(id => id !== clientId)
      : [...selectedClientIds, clientId];
      
    console.log('🎯 ClientFilterSection: New selection:', { 
      added: !selectedClientIds.includes(clientId),
      newCount: newSelection.length,
      newSelection 
    });
    
    onClientSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    console.log('🎯 ClientFilterSection: Select all requested:', { availableClients: filteredClients.length });
    onClientSelectionChange(filteredClients.map(c => c.id));
  };

  const handleClearAll = () => {
    console.log('🎯 ClientFilterSection: Clear all requested');
    onClientSelectionChange([]);
  };

  // Debug logging for render state
  console.log('🎨 ClientFilterSection: Render state:', {
    isLoading,
    hasError: !!error,
    clientsCount: clients.length,
    filteredCount: filteredClients.length,
    selectedCount: selectedClientIds.length,
    searchTerm,
    isCollapsed,
    isAllSelected,
    isPartiallySelected
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Client Filter
            {clients.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {clients.length} active
              </Badge>
            )}
          </CardTitle>
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              {isCollapsed ? 'Show' : 'Hide'}
            </Button>
          )}
        </div>
        
        {selectedClientIds.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selectedClientIds.length} clients selected
              {isAllSelected && ' (All)'}
              {isPartiallySelected && ' (Partial)'}
            </span>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-3">
          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load clients: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading clients...</div>
          )}

          {/* No Data State */}
          {!isLoading && !error && clients.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active clients found in the database. Check if clients have status set to "Active".
              </AlertDescription>
            </Alert>
          )}

          {/* Main Interface - Only show if we have clients */}
          {!isLoading && !error && clients.length > 0 && (
            <>
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

              {/* Bulk actions with enhanced state display */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  disabled={isAllSelected}
                >
                  Select All ({filteredClients.length})
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAll}
                  disabled={selectedClientIds.length === 0}
                >
                  Clear All
                </Button>
              </div>

              {/* Phase 2: Visual indicator for default selection */}
              {isAllSelected && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
                  ✅ All clients selected by default
                </div>
              )}

              {/* Client list */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredClients.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {searchTerm ? `No clients found matching "${searchTerm}"` : 'No clients available'}
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
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};
