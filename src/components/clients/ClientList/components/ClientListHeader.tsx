
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Printer } from 'lucide-react';
import { ExportButton } from '@/components/export';
import { ClientExportData, ExportOptions } from '@/services/export/exportService';

interface ClientListHeaderProps {
  onAddClient: () => void;
  onPrint: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  exportData: ClientExportData[];
  isExporting: boolean;
}

export const ClientListHeader: React.FC<ClientListHeaderProps> = ({
  onAddClient,
  onPrint,
  onExport,
  exportData,
  isExporting
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Client Directory</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onPrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <ExportButton
            onExport={onExport}
            dataType="clients"
            isLoading={isExporting}
            disabled={exportData.length === 0}
          />
        </div>
      </div>
    </CardHeader>
  );
};
