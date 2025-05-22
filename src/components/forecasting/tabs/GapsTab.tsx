
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import GapAnalysisTable from '../GapAnalysisTable';
import ForecastInfoTooltip from '../ForecastInfoTooltip';
import { ForecastData, SkillType } from '@/types/forecasting';

interface GapsTabProps {
  forecastData: ForecastData;
  skills: SkillType[];
}

const GapsTab: React.FC<GapsTabProps> = ({ forecastData, skills }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Gap Analysis
          <ForecastInfoTooltip
            title="Gap Analysis"
            content="This table shows the difference between capacity and demand for each skill. Negative values (highlighted) indicate potential resource shortages."
          />
        </CardTitle>
        <CardDescription>
          Identifying potential resource shortages or surpluses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {forecastData && forecastData.gapAnalysis && (
          <GapAnalysisTable 
            data={forecastData.gapAnalysis}
            skills={skills}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default GapsTab;
