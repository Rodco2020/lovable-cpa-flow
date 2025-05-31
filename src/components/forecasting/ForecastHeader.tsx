
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ForecastCalculationBadge from './ForecastCalculationBadge';
import ForecastInfoTooltip from './ForecastInfoTooltip';
import { ForecastData, ForecastMode } from '@/types/forecasting';

interface ForecastHeaderProps {
  forecastData: ForecastData | null;
  forecastType: ForecastMode;
  setForecastType: (type: ForecastMode) => void;
  forecastWindow: string;
  setForecastWindow: (window: string) => void;
  timeWindowOptions: Array<{value: string, label: string, days: number}>;
  handleRecalculate: () => void;
  renderForecastExplanation: () => string;
}

const ForecastHeader: React.FC<ForecastHeaderProps> = ({
  forecastData,
  forecastType,
  setForecastType,
  forecastWindow,
  setForecastWindow,
  timeWindowOptions,
  handleRecalculate,
  renderForecastExplanation
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Capacity Forecasting</h1>
          {forecastData && (
            <div className="flex items-center gap-2">
              <ForecastCalculationBadge mode={forecastType} />
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Select value={forecastType} onValueChange={setForecastType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Forecast Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual Forecast</SelectItem>
                <SelectItem value="actual">Actual Forecast</SelectItem>
              </SelectContent>
            </Select>
            <ForecastInfoTooltip
              title="Forecast Type"
              content={
                <div className="space-y-2">
                  <p><strong>Virtual Forecast:</strong> Projection based on recurring task templates and standard staff availability.</p>
                  <p><strong>Actual Forecast:</strong> Based on scheduled tasks and actual staff availability including exceptions.</p>
                </div>
              }
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={forecastWindow} onValueChange={setForecastWindow}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Window" />
              </SelectTrigger>
              <SelectContent>
                {timeWindowOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ForecastInfoTooltip
              title="Forecast Window"
              content="Select the time period for your forecast. This determines how far into the future the forecast will project."
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRecalculate}>
            Recalculate
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {renderForecastExplanation()}
      </p>
    </div>
  );
};

export default ForecastHeader;
