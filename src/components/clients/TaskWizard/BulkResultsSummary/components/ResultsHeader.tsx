
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, Download } from 'lucide-react';
import { ResultsHeaderProps } from '../types';
import { downloadResults } from '../utils';

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  result,
  onRetryFailed,
  onExportResults
}) => {
  const handleDownload = () => {
    if (onExportResults) {
      onExportResults();
    } else {
      downloadResults(result);
    }
  };

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Operation Results</span>
        </CardTitle>
        <div className="flex space-x-2">
          {result.failedOperations > 0 && onRetryFailed && (
            <Button variant="outline" size="sm" onClick={onRetryFailed}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Failed
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
