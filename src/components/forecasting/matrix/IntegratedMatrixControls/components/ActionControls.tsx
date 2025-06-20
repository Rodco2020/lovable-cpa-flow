
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface ActionControlsProps {
  onExport: () => void;
  onPrintExport?: () => void;
}

/**
 * Action controls component
 * Handles export and print functionality
 */
export const ActionControls: React.FC<ActionControlsProps> = ({
  onExport,
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
    </div>
  );
};
