
import { useMemo, useEffect } from 'react';
import type { Client } from '../types';

interface UseClientSelectionProps {
  clients: Client[];
  selectedClientIds: string[];
  onClientSelectionChange: (clientIds: string[]) => void;
}

export const useClientSelection = ({
  clients,
  selectedClientIds,
  onClientSelectionChange
}: UseClientSelectionProps) => {
  // Phase 2: UI state synchronization for default selection with CLIENT FILTERING FIX
  const isAllSelected = useMemo(() => {
    if (clients.length === 0) return false;
    return selectedClientIds.length === clients.length && 
           clients.every(client => selectedClientIds.includes(client.id));
  }, [clients, selectedClientIds]);

  const isPartiallySelected = useMemo(() => {
    return selectedClientIds.length > 0 && selectedClientIds.length < clients.length;
  }, [clients, selectedClientIds]);

  // Phase 2: Debug logging for UI state verification with CLIENT FILTERING DIAGNOSIS
  useEffect(() => {
    console.log('🎨 ClientFilterSection: Phase 2 UI State Check with CLIENT FILTERING FIX:', {
      totalClients: clients.length,
      selectedCount: selectedClientIds.length,
      isAllSelected,
      isPartiallySelected,
      shouldShowAsDefaultSelected: isAllSelected,
      clientFilteringLogic: {
        allClientsDetected: isAllSelected,
        shouldPassUndefinedToAPI: isAllSelected,
        willFilterClients: !isAllSelected && selectedClientIds.length > 0
      }
    });
  }, [clients, selectedClientIds, isAllSelected, isPartiallySelected]);

  const handleClientToggle = (clientId: string) => {
    console.log('🎯 ClientFilterSection: Client toggle requested with CLIENT FILTERING AWARENESS:', { 
      clientId, 
      currentlySelected: selectedClientIds.includes(clientId),
      totalClients: clients.length,
      currentSelectionCount: selectedClientIds.length
    });
    
    const newSelection = selectedClientIds.includes(clientId)
      ? selectedClientIds.filter(id => id !== clientId)
      : [...selectedClientIds, clientId];
      
    const willBeAllSelected = newSelection.length === clients.length;
      
    console.log('🎯 ClientFilterSection: New selection with CLIENT FILTERING LOGIC:', { 
      added: !selectedClientIds.includes(clientId),
      newCount: newSelection.length,
      totalCount: clients.length,
      willBeAllSelected,
      apiFilterMode: willBeAllSelected ? 'undefined (all clients)' : `array of ${newSelection.length} clients`
    });
    
    onClientSelectionChange(newSelection);
  };

  const handleSelectAll = (filteredClients: Client[]) => {
    console.log('🎯 ClientFilterSection: Select all requested with CLIENT FILTERING AWARENESS:', { 
      availableClients: filteredClients.length,
      totalClients: clients.length,
      willTriggerAllClientsMode: filteredClients.length === clients.length
    });
    onClientSelectionChange(filteredClients.map(c => c.id));
  };

  const handleClearAll = () => {
    console.log('🎯 ClientFilterSection: Clear all requested - will result in no data');
    onClientSelectionChange([]);
  };

  return {
    isAllSelected,
    isPartiallySelected,
    handleClientToggle,
    handleSelectAll,
    handleClearAll
  };
};
