
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MatrixData } from '@/services/forecasting/matrixUtils';
import {
  MatrixHeader,
  MatrixStatusIndicator,
  MatrixGrid,
  MatrixSummaryFooter
} from './';
import { RefreshCw } from 'lucide-react';

interface EnhancedMatrixContentProps {
  filteredData: MatrixData;
  viewMode: 'hours' | 'percentage';
  forecastType: 'virtual' | 'actual';
  isLoading: boolean;
  isRefreshing?: boolean;
  validationIssues: string[];
  availableSkills: any[];
  onRefresh: () => void;
}

export const EnhancedMatrixContent: React.FC<EnhancedMatrixContentProps> = ({
  filteredData,
  viewMode,
  forecastType,
  isLoading,
  isRefreshing = false,
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
        
        {/* Enhanced refresh indicator */}
        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Updating matrix data...</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Matrix content with better loading states */}
        <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}>
          <MatrixGrid
            filteredData={filteredData}
            viewMode={viewMode}
          />
        </div>
        
        <MatrixSummaryFooter
          filteredData={filteredData}
          validationIssues={validationIssues}
          forecastType={forecastType}
        />
      </CardContent>
    </Card>
  );
};
