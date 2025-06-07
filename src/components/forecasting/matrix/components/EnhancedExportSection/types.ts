
export interface ExportOptions {
  includeAnalytics: boolean;
  includeClientFilter: boolean;
  clientIds: string[];
  format: 'summary' | 'detailed';
}

export interface PrintOptions {
  includeCharts: boolean;
  includeClientFilter: boolean;
  clientIds: string[];
  orientation: 'portrait' | 'landscape';
}

export interface EnhancedExportSectionProps {
  matrixData: any; // Using any to avoid circular imports
  selectedSkills: any[];
  selectedClientIds: string[];
  monthRange: { start: number; end: number };
  onExport: (format: 'csv' | 'json', options: ExportOptions) => void;
  onPrint: (options: PrintOptions) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
