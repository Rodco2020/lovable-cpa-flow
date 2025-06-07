
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

  const handleSelectAll = (filteredClients: Client[]) => {
    console.log('🎯 ClientFilterSection: Select all requested:', { availableClients: filteredClients.length });
    onClientSelectionChange(filteredClients.map(c => c.id));
  };

  const handleClearAll = () => {
    console.log('🎯 ClientFilterSection: Clear all requested');
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
