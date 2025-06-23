
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw, Printer } from 'lucide-react';

interface ActionButtonsSectionProps {
  onExport: () => void;
  onReset: () => void;
  onPrintExport?: () => void;
}

/**
 * Action Buttons Section Component
 * Handles the action buttons for export, print, and reset functionality
 */
export const ActionButtonsSection: React.FC<ActionButtonsSectionProps> = ({
  onExport,
  onReset,
  onPrintExport
}) => {
  return (
    <div className="space-y-2">
      {onPrintExport && (
        <Button 
          onClick={onPrintExport} 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print/Export Reports
        </Button>
      )}
      
      <Button 
        onClick={onExport} 
        variant="outline" 
        size="sm" 
        className="w-full flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export Data
      </Button>
      
      <Button 
        onClick={onReset} 
        variant="outline" 
        size="sm" 
        className="w-full flex items-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Filters
      </Button>
    </div>
  );
};
