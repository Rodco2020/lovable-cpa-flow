
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useClientData } from './hooks/useClientData';
import { useClientSelection } from './hooks/useClientSelection';
import { useClientSearch } from './hooks/useClientSearch';
import { ClientFilterHeader } from './components/ClientFilterHeader';
import { ClientSearchInput } from './components/ClientSearchInput';
import { ClientFilterActions } from './components/ClientFilterActions';
import { ClientFilterStates } from './components/ClientFilterStates';
import { ClientList } from './components/ClientList';
import { SelectedClientsSummary } from './components/SelectedClientsSummary';
import type { ClientFilterSectionProps } from './types';

export const ClientFilterSection: React.FC<ClientFilterSectionProps> = ({
  selectedClientIds,
  onClientSelectionChange,
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Data fetching
  const { data: clients = [], isLoading, error } = useClientData();

  // Search functionality
  const { searchTerm, setSearchTerm, filteredClients } = useClientSearch(clients);

  // Selection management
  const {
    isAllSelected,
    isPartiallySelected,
    handleClientToggle,
    handleSelectAll,
    handleClearAll
  } = useClientSelection({
    clients,
    selectedClientIds,
    onClientSelectionChange
  });

  // Debug logging for render state
  useEffect(() => {
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
  }, [clients, filteredClients, selectedClientIds, searchTerm, isCollapsed, isAllSelected, isPartiallySelected, isLoading, error]);

  return (
    <Card>
      <ClientFilterHeader
        clientsCount={clients.length}
        selectedCount={selectedClientIds.length}
        isAllSelected={isAllSelected}
        isPartiallySelected={isPartiallySelected}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onClearAll={handleClearAll}
      />

      {!isCollapsed && (
        <CardContent className="space-y-3">
          <ClientFilterStates
            isLoading={isLoading}
            error={error}
            clientsCount={clients.length}
            isAllSelected={isAllSelected}
          />

          {/* Main Interface - Only show if we have clients */}
          {!isLoading && !error && clients.length > 0 && (
            <>
              <ClientSearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />

              <ClientFilterActions
                filteredClients={filteredClients}
                isAllSelected={isAllSelected}
                selectedCount={selectedClientIds.length}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
              />

              <ClientList
                clients={filteredClients}
                selectedClientIds={selectedClientIds}
                onClientToggle={handleClientToggle}
                searchTerm={searchTerm}
              />

              <SelectedClientsSummary
                selectedClientIds={selectedClientIds}
                clients={clients}
              />
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};
