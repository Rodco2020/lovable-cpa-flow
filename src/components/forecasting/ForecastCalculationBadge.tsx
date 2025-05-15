
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ForecastMode } from '@/types/forecasting';
import ForecastInfoTooltip from './ForecastInfoTooltip';

interface ForecastCalculationBadgeProps {
  mode: ForecastMode;
}

const ForecastCalculationBadge: React.FC<ForecastCalculationBadgeProps> = ({ mode }) => {
  const badgeVariant = mode === 'virtual' ? 'default' : 'secondary';
  const badgeText = mode === 'virtual' ? 'Virtual Forecast' : 'Actual Forecast';
  
  const tooltipContent = mode === 'virtual' 
    ? (
        <div>
          <p>Virtual Forecast uses recurring task templates and staff availability templates to project future workload.</p>
          <p className="mt-1">It doesn't account for specific scheduled instances or exceptions.</p>
        </div>
      )
    : (
        <div>
          <p>Actual Forecast uses generated task instances that have been scheduled or are awaiting assignment.</p>
          <p className="mt-1">It accounts for time-offs and other exceptions in staff availability.</p>
        </div>
      );
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={badgeVariant}>{badgeText}</Badge>
      <ForecastInfoTooltip 
        title="Calculation Method" 
        content={tooltipContent} 
      />
    </div>
  );
};

export default ForecastCalculationBadge;
