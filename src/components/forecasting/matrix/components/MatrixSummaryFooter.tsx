
import React from 'react';
import { MatrixData } from '@/services/forecasting/matrixUtils';

interface MatrixSummaryFooterProps {
  filteredData: MatrixData;
  validationIssues: string[];
  forecastType: 'virtual' | 'actual';
}

export const MatrixSummaryFooter: React.FC<MatrixSummaryFooterProps> = ({
  filteredData,
  validationIssues,
  forecastType
}) => {
  return (
    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <strong>Matrix Coverage:</strong> {filteredData.skills.length} skills × {filteredData.months.length} months
        </div>
        <div>
          <strong>Data Period:</strong> {filteredData.months[0]?.label} - {filteredData.months[filteredData.months.length - 1]?.label}
        </div>
        <div>
          <strong>Validation:</strong> {validationIssues.length === 0 ? 'All checks passed' : `${validationIssues.length} issues resolved`}
        </div>
        <div>
          <strong>Forecast Type:</strong> {forecastType === 'virtual' ? 'Virtual (Template-based)' : 'Actual (Scheduled)'}
        </div>
      </div>
    </div>
  );
};
