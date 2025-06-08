
import React, { useState } from 'react';
import { Download, FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExportOptionsModal } from './ExportOptionsModal';
import { ExportOptions } from '@/services/export/exportService';

interface ExportButtonProps {
  onExport: (options: ExportOptions) => Promise<void>;
  dataType: 'clients' | 'tasks';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  dataType,
  isLoading = false,
  disabled = false,
  className = ''
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const handleQuickExport = async (format: 'pdf' | 'excel' | 'csv') => {
    await onExport({
      format,
      includeFilters: true
    });
  };

  const handleCustomExport = (format: 'pdf' | 'excel' | 'csv') => {
    setSelectedFormat(format);
    setShowOptionsModal(true);
  };

  const handleOptionsConfirm = async (options: ExportOptions) => {
    await onExport(options);
    setShowOptionsModal(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || isLoading}
            className={`flex items-center gap-2 ${className}`}
          >
            <Download className="h-4 w-4" />
            {isLoading ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleQuickExport('pdf')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleCustomExport('pdf')}>
            <FileDown className="h-4 w-4 mr-2" />
            Custom PDF Export...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCustomExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Custom Excel Export...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onConfirm={handleOptionsConfirm}
        dataType={dataType}
        selectedFormat={selectedFormat}
      />
    </>
  );
};
