
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChartBar } from 'lucide-react';
import ForecastChart from '../ForecastChart';
import ForecastInfoTooltip from '../ForecastInfoTooltip';
import { ForecastData, SkillData } from '@/types/forecasting';

interface ChartsTabProps {
  forecastData: ForecastData;
  showDemand: boolean;
  setShowDemand: (show: boolean) => void;
  showCapacity: boolean;
  setShowCapacity: (show: boolean) => void;
  forecastType: string;
  skills: SkillData[];
}

const ChartsTab: React.FC<ChartsTabProps> = ({ 
  forecastData,
  showDemand,
  setShowDemand,
  showCapacity,
  setShowCapacity,
  forecastType,
  skills
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-md font-medium flex items-center gap-2">
              Capacity vs. Demand
              <ForecastInfoTooltip
                title="Capacity vs. Demand"
                content="This chart compares staff capacity (available hours) against demand (required hours) over time. Toggle to show or hide capacity and demand lines."
                icon={<ChartBar className="h-4 w-4" />}
              />
            </CardTitle>
            <CardDescription>
              {forecastType === 'virtual' 
                ? 'Projection based on templates' 
                : 'Based on scheduled instances'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="show-demand" checked={showDemand} onCheckedChange={setShowDemand} />
              <Label htmlFor="show-demand">Demand</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="show-capacity" checked={showCapacity} onCheckedChange={setShowCapacity} />
              <Label htmlFor="show-capacity">Capacity</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {forecastData && forecastData.timeSeriesData && (
            <ForecastChart 
              chartType="line"
              data={forecastData.timeSeriesData}
              showDemand={showDemand}
              showCapacity={showCapacity}
              skills={skills}
            />
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-md font-medium flex items-center gap-2">
            Skill Distribution
            <ForecastInfoTooltip
              title="Skill Distribution"
              content="This chart shows how different skills contribute to overall capacity and demand. Use this to identify skill-specific gaps or surpluses."
              icon={<ChartBar className="h-4 w-4" />}
            />
          </CardTitle>
          <CardDescription>
            Breakdown by skill type for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forecastData && forecastData.skillDistribution && (
            <ForecastChart 
              chartType="bar"
              data={forecastData.skillDistribution}
              showDemand={showDemand}
              showCapacity={showCapacity}
              skills={skills}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsTab;
