
import React, { useState } from 'react';
import { EnhancedCapacityMatrix } from './EnhancedCapacityMatrix';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MatrixTabProps {
  className?: string;
  forecastType?: 'virtual' | 'actual';
}

/**
 * Matrix tab component for the forecast dashboard with enhanced features
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
            <h3 className="text-lg font-semibold">Enhanced Capacity Forecast Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Interactive 12-month view with visual indicators and detailed breakdowns
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
                ? 'Projects workload based on recurring task templates and staff availability patterns. Use matrix controls to filter skills, adjust view modes, and explore different time ranges.'
                : 'Reflects scheduled tasks and accounts for staff availability exceptions. Interactive tooltips show contributing tasks and staff allocation details.'
              }
            </div>
          </CardContent>
        </Card>
        
        {/* Enhanced matrix component */}
        <EnhancedCapacityMatrix forecastType={selectedForecastType} />
      </div>
    </div>
  );
};

export default MatrixTab;
