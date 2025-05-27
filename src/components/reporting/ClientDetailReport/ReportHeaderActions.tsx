
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Settings } from "lucide-react";

interface ReportHeaderActionsProps {
  onChangeClient: () => void;
  onShowCustomization: () => void;
  onPrint: () => void;
  onShowExport: () => void;
}

export const ReportHeaderActions: React.FC<ReportHeaderActionsProps> = ({
  onChangeClient,
  onShowCustomization,
  onPrint,
  onShowExport
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onChangeClient}
      >
        Change Client
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onShowCustomization}
      >
        <Settings className="h-4 w-4 mr-2" />
        Customize
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onPrint}
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onShowExport}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );
};
