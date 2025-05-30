
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExportOptions, ClientExportData } from '@/services/export/exportService';
import { ExportService } from '@/services/export/exportService';
import { toast } from 'sonner';
import { Client } from '@/types/client';

export const useClientListActions = () => {
  const navigate = useNavigate();
  const [showPrintView, setShowPrintView] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (exportData: ClientExportData[], options: ExportOptions, appliedFilters?: Record<string, any>) => {
    try {
      setIsExporting(true);
      
      await ExportService.exportClients(exportData, options, appliedFilters);
      
      toast.success(`Client directory exported successfully as ${options.format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export client directory. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  const handlePrintExecute = () => {
    window.print();
    setShowPrintView(false);
  };

  return {
    navigate,
    showPrintView,
    setShowPrintView,
    isExporting,
    handleExport,
    handlePrint,
    handlePrintExecute
  };
};
