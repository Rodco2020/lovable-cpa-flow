
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AvailabilitySummary } from "@/types/staff";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AvailabilitySummaryPanelProps {
  summary: AvailabilitySummary | undefined;
  isLoading: boolean;
  days: { value: number; label: string }[];
}

const AvailabilitySummaryPanel: React.FC<AvailabilitySummaryPanelProps> = ({
  summary,
  isLoading,
  days
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Availability Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  // Filter summary data to only show the provided days
  const filteredDailySummaries = summary.dailySummaries.filter(day => 
    days.some(d => d.value === day.day)
  );

  // Prepare data for the chart
  const chartData = filteredDailySummaries.map(day => ({
    name: days.find(d => d.value === day.day)?.label || `Day ${day.day}`,
    hours: day.totalHours
  }));

  // Calculate total hours for the filtered days
  const filteredTotalHours = filteredDailySummaries.reduce(
    (total, day) => total + day.totalHours, 
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Availability Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis 
                  label={{ 
                    value: 'Hours', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12 }
                  }} 
                />
                <Tooltip 
                  formatter={(value) => [`${value} hours`, 'Available']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]} 
                  name="Available Hours" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Available Hours</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {filteredTotalHours.toFixed(1)}
              </div>
              
              <div className="mt-4 space-y-2">
                {filteredDailySummaries.map(day => (
                  <div key={day.day} className="flex justify-between text-sm">
                    <span>{days.find(d => d.value === day.day)?.label}:</span>
                    <span className="font-medium">{day.totalHours.toFixed(1)} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilitySummaryPanel;
