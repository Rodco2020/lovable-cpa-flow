
import React, { useState } from 'react';
import { CapacityMatrix } from './CapacityMatrix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MatrixTabProps {
  className?: string;
  forecastType?: 'virtual' | 'actual';
}

/**
 * Matrix tab component for the forecast dashboard
 * Provides the 12-month matrix view of capacity vs demand with real data
 */
export const MatrixTab: React.FC<MatrixTabProps> = ({ 
  className,
  forecastType: initialForecastType = 'virtual'
}) => {
  const [selectedForecastType, setSelectedForecastType] = useState<'virtual' | 'actual'>(initialForecastType);

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Capacity Forecast Matrix</h3>
            <p className="text-sm text-muted-foreground">
              12-month view of demand vs capacity by skill type
            </p>
          </div>
          
          {/* Forecast type selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Forecast Type:</span>
            <div className="flex rounded-md border">
              <Button
                variant={selectedForecastType === 'virtual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedForecastType('virtual')}
                className="rounded-r-none"
              >
                Virtual
              </Button>
              <Button
                variant={selectedForecastType === 'actual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedForecastType('actual')}
                className="rounded-l-none"
              >
                Actual
              </Button>
            </div>
          </div>
        </div>

        {/* Information card explaining forecast types */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-sm text-blue-700">
              <strong>
                {selectedForecastType === 'virtual' ? 'Virtual Forecast:' : 'Actual Forecast:'}
              </strong>{' '}
              {selectedForecastType === 'virtual' 
                ? 'Projects workload based on recurring task templates and staff availability patterns over 12 months.'
                : 'Reflects scheduled tasks and accounts for staff availability exceptions over 12 months.'
              }
            </div>
          </CardContent>
        </Card>
        
        {/* Matrix component with real data */}
        <CapacityMatrix forecastType={selectedForecastType} />
      </div>
    </div>
  );
};

export default MatrixTab;
