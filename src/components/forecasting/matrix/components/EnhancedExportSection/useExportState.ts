
import { useState } from 'react';

export const useExportState = () => {
  const [exportFormat, setExportFormat] = useState<'summary' | 'detailed'>('summary');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeClientFilter, setIncludeClientFilter] = useState(true);
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [includeCharts, setIncludeCharts] = useState(true);

  // Checkbox handlers to properly handle CheckedState type
  const handleIncludeAnalyticsChange = (checked: boolean | "indeterminate") => {
    setIncludeAnalytics(checked === true);
  };

  const handleIncludeClientFilterChange = (checked: boolean | "indeterminate") => {
    setIncludeClientFilter(checked === true);
  };

  const handleIncludeChartsChange = (checked: boolean | "indeterminate") => {
    setIncludeCharts(checked === true);
  };

  return {
    exportFormat,
    setExportFormat,
    includeAnalytics,
    includeClientFilter,
    printOrientation,
    setPrintOrientation,
    includeCharts,
    handleIncludeAnalyticsChange,
    handleIncludeClientFilterChange,
    handleIncludeChartsChange
  };
};
