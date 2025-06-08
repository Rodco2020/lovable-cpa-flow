
import React, { useState } from 'react';
import { Download, FileDown, FileSpreadsheet, Printer, Eye } from 'lucide-react';
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
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showPrintOptions?: boolean;
  onPrintPreview?: () => void;
  onQuickPrint?: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  dataType,
  isLoading = false,
  disabled = false,
  className = '',
  variant = 'outline',
  size = 'default',
  showPrintOptions = false,
  onPrintPreview,
  onQuickPrint
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
            variant={variant}
            size={size}
            disabled={disabled || isLoading}
            className={`flex items-center gap-2 ${className}`}
          >
            <Download className="h-4 w-4" />
            {isLoading ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Quick Export Options */}
          <DropdownMenuItem onClick={() => handleQuickExport('pdf')}>
            <FileDown className="h-4 w-4 mr-2" />
            Quick PDF Export
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Quick Excel Export
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            Quick CSV Export
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Custom Export Options */}
          <DropdownMenuItem onClick={() => handleCustomExport('pdf')}>
            <FileDown className="h-4 w-4 mr-2" />
            Custom PDF Export...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCustomExport('excel')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Custom Excel Export...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCustomExport('csv')}>
            <FileDown className="h-4 w-4 mr-2" />
            Custom CSV Export...
          </DropdownMenuItem>

          {/* Print Options */}
          {showPrintOptions && (
            <>
              <DropdownMenuSeparator />
              {onPrintPreview && (
                <DropdownMenuItem onClick={onPrintPreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Print Preview
                </DropdownMenuItem>
              )}
              {onQuickPrint && (
                <DropdownMenuItem onClick={onQuickPrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Quick Print
                </DropdownMenuItem>
              )}
            </>
          )}
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
