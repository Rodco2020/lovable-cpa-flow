
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrintView } from '@/components/export/PrintView';
import { useClientListData } from './hooks/useClientListData';
import { useClientListActions } from './hooks/useClientListActions';
import { ClientListHeader } from './components/ClientListHeader';
import { ClientListSearchBar } from './components/ClientListSearchBar';
import { ClientListTable } from './components/ClientListTable';
import { ClientListEmptyState } from './components/ClientListEmptyState';
import { ClientListLoadingState } from './components/ClientListLoadingState';
import { ClientListErrorState } from './components/ClientListErrorState';
import { convertClientsToExportData, getAppliedFilters } from './utils/clientListUtils';
import { ClientMetricsFilters } from '@/types/clientMetrics';

interface ClientListProps {
  metricsFilters?: ClientMetricsFilters;
}

const ClientList: React.FC<ClientListProps> = ({ metricsFilters = {} }) => {
  const {
    clients,
    filteredClients,
    isLoading,
    error,
    searchTerm,
    setSearchTerm
  } = useClientListData(metricsFilters);

  const {
    navigate,
    showPrintView,
    isExporting,
    handleExport,
    handlePrint,
    handlePrintExecute
  } = useClientListActions();

  // Convert clients to export format
  const exportData = convertClientsToExportData(filteredClients);

  // Handle export with applied filters
  const handleExportWithFilters = async (options: any) => {
    const appliedFilters = options.includeFilters ? getAppliedFilters(searchTerm, metricsFilters) : undefined;
    await handleExport(exportData, options, appliedFilters);
  };

  // Handle navigation actions
  const handleAddClient = () => navigate('/clients/new');
  const handleViewClient = (clientId: string) => navigate(`/clients/${clientId}`);
  const handleRetry = () => navigate(0);
  
  if (showPrintView) {
    return (
      <PrintView
        title="Client Directory"
        data={exportData}
        dataType="clients"
        appliedFilters={getAppliedFilters(searchTerm, metricsFilters)}
        onPrint={handlePrintExecute}
      />
    );
  }
  
  if (isLoading) {
    return <ClientListLoadingState />;
  }
  
  if (error) {
    return <ClientListErrorState onRetry={handleRetry} />;
  }
  
  return (
    <Card>
      <ClientListHeader
        onAddClient={handleAddClient}
        onPrint={handlePrint}
        onExport={handleExportWithFilters}
        exportData={exportData}
        isExporting={isExporting}
      />
      <CardContent className="p-0">
        <div className="p-4">
          <ClientListSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            totalClients={clients?.length || 0}
            filteredCount={filteredClients.length}
          />
          {filteredClients.length === 0 ? (
            <ClientListEmptyState
              hasClients={!!clients?.length}
              onAddClient={handleAddClient}
            />
          ) : (
            <ClientListTable
              clients={filteredClients}
              onViewClient={handleViewClient}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientList;
