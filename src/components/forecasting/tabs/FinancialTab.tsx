
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import FinancialProjections from '../FinancialProjections';
import ForecastInfoTooltip from '../ForecastInfoTooltip';
import { FinancialProjection } from '@/types/forecasting';

interface FinancialTabProps {
  financialProjections: FinancialProjection[];
}

const FinancialTab: React.FC<FinancialTabProps> = ({ financialProjections }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Financial Projections
          <ForecastInfoTooltip
            title="Financial Projections"
            content="These projections are calculated by multiplying forecasted hours by billing/cost rates, showing estimated revenue, cost, and profit over time."
          />
        </CardTitle>
        <CardDescription>
          Estimated revenue, cost, and profit based on forecasted hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FinancialProjections
          data={financialProjections}
          view="chart"
        />
      </CardContent>
    </Card>
  );
};

export default FinancialTab;
