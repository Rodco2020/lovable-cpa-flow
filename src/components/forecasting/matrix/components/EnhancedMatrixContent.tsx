
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import {
  MatrixHeader,
  MatrixStatusIndicator,
  MatrixGrid,
  MatrixSummaryFooter
} from './';

interface EnhancedMatrixContentProps {
  filteredData: MatrixData;
  viewMode: 'hours' | 'percentage';
  forecastType: 'virtual' | 'actual';
  isLoading: boolean;
  validationIssues: string[];
  availableSkills: any[];
  onRefresh: () => void;
}

export const EnhancedMatrixContent: React.FC<EnhancedMatrixContentProps> = ({
  filteredData,
  viewMode,
  forecastType,
  isLoading,
  validationIssues,
  availableSkills,
  onRefresh
}) => {
  return (
    <Card>
      <CardHeader>
        <MatrixHeader
          viewMode={viewMode}
          forecastType={forecastType}
          isLoading={isLoading}
          validationIssues={validationIssues}
          onRefresh={onRefresh}
        />
        <MatrixStatusIndicator
          forecastType={forecastType}
          validationIssues={validationIssues}
          filteredData={filteredData}
          availableSkills={availableSkills}
        />
      </CardHeader>
      <CardContent>
        <MatrixGrid
          filteredData={filteredData}
          viewMode={viewMode}
        />
        
        <MatrixSummaryFooter
          filteredData={filteredData}
          validationIssues={validationIssues}
          forecastType={forecastType}
        />
      </CardContent>
    </Card>
  );
};
