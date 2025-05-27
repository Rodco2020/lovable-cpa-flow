
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Printer, Settings, User } from "lucide-react";

interface ReportHeaderActionsProps {
  onChangeClient: () => void;
  onShowCustomization: () => void;
  onPrint: () => void;
  onShowExport: () => void;
}

const ActionButton: React.FC<{
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
  'aria-label': string;
  variant?: "outline" | "default" | "secondary" | "ghost" | "link" | "destructive";
}> = ({ 
  onClick, 
  tooltip, 
  children, 
  'aria-label': ariaLabel,
  variant = "outline"
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant={variant}
        size="sm"
        onClick={onClick}
        aria-label={ariaLabel}
        className="gap-2"
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export const ReportHeaderActions: React.FC<ReportHeaderActionsProps> = ({
  onChangeClient,
  onShowCustomization,
  onPrint,
  onShowExport
}) => {
  return (
    <TooltipProvider>
      <div 
        className="flex flex-wrap items-center gap-2"
        role="toolbar"
        aria-label="Report actions"
      >
        <ActionButton
          onClick={onChangeClient}
          tooltip="Select a different client to view their report"
          aria-label="Change client"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Change Client</span>
        </ActionButton>

        <ActionButton
          onClick={onShowCustomization}
          tooltip="Customize report appearance and content"
          aria-label="Customize report"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Customize</span>
        </ActionButton>

        <ActionButton
          onClick={onPrint}
          tooltip="Print this report"
          aria-label="Print report"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </ActionButton>

        <ActionButton
          onClick={onShowExport}
          tooltip="Export report in various formats (PDF, Excel, CSV)"
          aria-label="Export report"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </ActionButton>
      </div>
    </TooltipProvider>
  );
};
