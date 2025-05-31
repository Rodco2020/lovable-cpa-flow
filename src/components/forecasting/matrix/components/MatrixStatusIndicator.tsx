
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { MatrixData } from '@/services/forecasting/matrixUtils';

interface MatrixStatusIndicatorProps {
  forecastType: 'virtual' | 'actual';
  validationIssues: string[];
  filteredData: MatrixData | null;
  availableSkills: any[];
}

export const MatrixStatusIndicator: React.FC<MatrixStatusIndicatorProps> = ({
  forecastType,
  validationIssues,
  filteredData,
  availableSkills
}) => {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        Interactive capacity vs demand matrix - {forecastType} forecast with synchronized skills
      </p>
      {validationIssues.length > 0 ? (
        <div className="text-xs text-amber-600">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          {validationIssues.length} validation issue(s) resolved through skills synchronization
        </div>
      ) : (
        <div className="text-xs text-green-600">
          ✓ Matrix data validated successfully
        </div>
      )}
      {filteredData && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>
            Showing: {filteredData.skills.length} skills × {filteredData.months.length} months
          </span>
          <span>•</span>
          <span>
            Total: {filteredData.totalDemand.toFixed(0)}h demand, {filteredData.totalCapacity.toFixed(0)}h capacity
          </span>
          {availableSkills.length > 0 && (
            <>
              <span>•</span>
              <span>Skills synchronized: {availableSkills.length}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
