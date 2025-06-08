
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer } from 'lucide-react';

interface PrintOptionsSectionProps {
  includeCharts: boolean;
  printOrientation: 'portrait' | 'landscape';
  setPrintOrientation: (orientation: 'portrait' | 'landscape') => void;
  handleIncludeChartsChange: (checked: boolean | "indeterminate") => void;
  onPrint: () => void;
}

export const PrintOptionsSection: React.FC<PrintOptionsSectionProps> = ({
  includeCharts,
  printOrientation,
  setPrintOrientation,
  handleIncludeChartsChange,
  onPrint
}) => {
  return (
    <div className="pt-3 border-t space-y-3">
      <div className="text-sm font-medium">Print Options</div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={includeCharts}
            onCheckedChange={handleIncludeChartsChange}
          />
          <label className="text-sm">Include charts</label>
        </div>
        
        <Select value={printOrientation} onValueChange={(value: 'portrait' | 'landscape') => setPrintOrientation(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Orientation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">Landscape</SelectItem>
            <SelectItem value="portrait">Portrait</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" size="sm" onClick={onPrint} className="w-full">
        <Printer className="h-4 w-4 mr-1" />
        Print Preview
      </Button>
    </div>
  );
};
