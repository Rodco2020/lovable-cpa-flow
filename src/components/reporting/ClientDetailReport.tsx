
import React from "react";
import { ReportCustomizationDialog } from "./ClientDetailReport/ReportCustomizationDialog";
import { ExportOptionsDialog } from "./ClientDetailReport/ExportOptionsDialog";
import { useClientDetailReport } from "./ClientDetailReport/hooks/useClientDetailReport";
import { ClientSelectionScreen } from "./ClientDetailReport/ClientSelectionScreen";
import { ReportLoadingScreen } from "./ClientDetailReport/ReportLoadingScreen";
import { ReportErrorScreen } from "./ClientDetailReport/ReportErrorScreen";
import { ReportHeaderActions } from "./ClientDetailReport/ReportHeaderActions";
import { ReportContent } from "./ClientDetailReport/ReportContent";

const ClientDetailReport: React.FC = () => {
  const {
    // State
    selectedClientId,
    filters,
    customization,
    showCustomizationDialog,
    showExportDialog,
    
    // Data
    clientsList,
    reportData,
    isLoading,
    error,
    
    // Actions
    setSelectedClientId,
    setCustomization,
    setShowCustomizationDialog,
    setShowExportDialog,
    handleFiltersChange,
    handleExport,
    handlePrint
  } = useClientDetailReport();

  // Show client selection screen if no client is selected
  if (!selectedClientId) {
    return (
      <ClientSelectionScreen
        clientsList={clientsList}
        selectedClientId={selectedClientId}
        onClientSelect={setSelectedClientId}
      />
    );
  }

  // Show loading screen while data is being fetched
  if (isLoading) {
    return <ReportLoadingScreen />;
  }

  // Show error screen if there's an error
  if (error) {
    return <ReportErrorScreen />;
  }

  // Main report view
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {reportData?.client.legalName} - Detail Report
          </h2>
          <p className="text-muted-foreground">
            Comprehensive analysis and task breakdown
          </p>
        </div>
        <ReportHeaderActions
          onChangeClient={() => setSelectedClientId("")}
          onShowCustomization={() => setShowCustomizationDialog(true)}
          onPrint={handlePrint}
          onShowExport={() => setShowExportDialog(true)}
        />
      </div>

      {reportData && (
        <ReportContent
          reportData={reportData}
          filters={filters}
          customization={customization}
          onFiltersChange={handleFiltersChange}
        />
      )}

      <ReportCustomizationDialog
        open={showCustomizationDialog}
        onOpenChange={setShowCustomizationDialog}
        customization={customization}
        onCustomizationChange={setCustomization}
      />

      <ExportOptionsDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
      />
    </div>
  );
};

export default ClientDetailReport;
