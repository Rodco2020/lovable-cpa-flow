
import React, { useEffect, useState } from "react";
import { ReportCustomizationDialog } from "./ClientDetailReport/ReportCustomizationDialog";
import { ExportOptionsDialog } from "./ClientDetailReport/ExportOptionsDialog";
import { ConfirmationDialog } from "./ClientDetailReport/ConfirmationDialog";
import { ReportHelpDialog } from "./ClientDetailReport/ReportHelpDialog";
import { useClientDetailReport } from "./ClientDetailReport/hooks/useClientDetailReport";
import { ClientSelectionScreen } from "./ClientDetailReport/ClientSelectionScreen";
import { ReportLoadingScreen } from "./ClientDetailReport/ReportLoadingScreen";
import { ReportErrorScreen } from "./ClientDetailReport/ReportErrorScreen";
import { ReportHeaderActions } from "./ClientDetailReport/ReportHeaderActions";
import { ReportContent } from "./ClientDetailReport/ReportContent";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

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

  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showChangeClientConfirm, setShowChangeClientConfirm] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Help shortcut (F1)
      if (event.key === 'F1') {
        event.preventDefault();
        setShowHelpDialog(true);
        return;
      }

      // Only handle shortcuts when no input is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'p':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handlePrint();
          }
          break;
        case 'e':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setShowExportDialog(true);
          }
          break;
        case 'h':
          event.preventDefault();
          setShowHelpDialog(true);
          break;
        case 'Escape':
          // Close any open dialogs
          setShowCustomizationDialog(false);
          setShowExportDialog(false);
          setShowHelpDialog(false);
          setShowChangeClientConfirm(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePrint, setShowExportDialog, setShowCustomizationDialog]);

  const handleChangeClientClick = () => {
    if (selectedClientId) {
      setShowChangeClientConfirm(true);
    }
  };

  const handleConfirmChangeClient = () => {
    setSelectedClientId("");
    setShowChangeClientConfirm(false);
    toast.success("Client selection cleared");
  };

  const handleRetry = () => {
    // Trigger a refetch by changing a dependency
    window.location.reload();
  };

  const handleGetHelp = () => {
    setShowHelpDialog(true);
  };

  // Show client selection screen if no client is selected
  if (!selectedClientId) {
    return (
      <>
        <ClientSelectionScreen
          clientsList={clientsList}
          selectedClientId={selectedClientId}
          onClientSelect={setSelectedClientId}
        />
        <ReportHelpDialog
          open={showHelpDialog}
          onOpenChange={setShowHelpDialog}
        />
      </>
    );
  }

  // Show loading screen while data is being fetched
  if (isLoading) {
    return (
      <>
        <ReportLoadingScreen 
          loadingMessage="Generating client detail report..."
        />
        <ReportHelpDialog
          open={showHelpDialog}
          onOpenChange={setShowHelpDialog}
        />
      </>
    );
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <>
        <ReportErrorScreen 
          error={error}
          onRetry={handleRetry}
          onGetHelp={handleGetHelp}
        />
        <ReportHelpDialog
          open={showHelpDialog}
          onOpenChange={setShowHelpDialog}
        />
      </>
    );
  }

  // Main report view
  return (
    <div className="space-y-6">
      {/* Skip to content link for screen readers */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {reportData?.client.legalName} - Detail Report
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analysis and task breakdown
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelpDialog(true)}
            aria-label="Open help dialog"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          
          <ReportHeaderActions
            onChangeClient={handleChangeClientClick}
            onShowCustomization={() => setShowCustomizationDialog(true)}
            onPrint={handlePrint}
            onShowExport={() => setShowExportDialog(true)}
          />
        </div>
      </div>

      <main id="main-content">
        {reportData && (
          <ReportContent
            reportData={reportData}
            filters={filters}
            customization={customization}
            onFiltersChange={handleFiltersChange}
          />
        )}
      </main>

      {/* Dialogs */}
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

      <ReportHelpDialog
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
      />

      <ConfirmationDialog
        open={showChangeClientConfirm}
        onOpenChange={setShowChangeClientConfirm}
        title="Change Client"
        description="Are you sure you want to change the client? Any unsaved customizations will be lost."
        confirmText="Change Client"
        cancelText="Keep Current"
        onConfirm={handleConfirmChangeClient}
      />

      {/* Keyboard shortcuts info for screen readers */}
      <div className="sr-only">
        Press F1 for help, Ctrl+P to print, Ctrl+E to export, H for help, or Escape to close dialogs.
      </div>
    </div>
  );
};

export default ClientDetailReport;
