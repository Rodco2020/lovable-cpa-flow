
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AvailabilitySummary } from "@/types/staff";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CalendarClock, Clock } from "lucide-react";

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
  // Memoize chart data to prevent unnecessary recalculations
  const { chartData, filteredTotalHours, averageHoursPerDay, maxHours } = useMemo(() => {
    if (!summary) {
      return { 
        chartData: [], 
        filteredTotalHours: 0, 
        averageHoursPerDay: 0,
        maxHours: 0 
      };
    }

    // Filter summary data to only show the provided days
    const filteredDailySummaries = summary.dailySummaries.filter(day => 
      days.some(d => d.value === day.day)
    );

    // Prepare data for the chart with consistent colors
    const data = filteredDailySummaries.map(day => ({
      name: days.find(d => d.value === day.day)?.label || `Day ${day.day}`,
      hours: day.totalHours,
      day: day.day
    }));

    // Calculate total hours for the filtered days
    const totalHours = filteredDailySummaries.reduce(
      (total, day) => total + day.totalHours, 
      0
    );

    // Calculate average hours per day
    const avgHours = data.length > 0 ? totalHours / data.length : 0;
    
    // Find maximum hours in a day
    const maxDailyHours = data.length > 0 
      ? Math.max(...data.map(item => item.hours))
      : 0;

    return { 
      chartData: data, 
      filteredTotalHours: totalHours, 
      averageHoursPerDay: avgHours,
      maxHours: maxDailyHours
    };
  }, [summary, days]);

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

  // Custom colors based on value compared to average
  const getBarColor = (hours: number) => {
    if (hours < averageHoursPerDay * 0.7) return "#ef4444"; // Red for low availability
    if (hours > averageHoursPerDay * 1.3) return "#22c55e"; // Green for high availability
    return "#3b82f6"; // Blue for average availability
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Availability Summary</span>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ChartContainer 
              config={{
                low: { theme: { light: "#ef4444" } },
                average: { theme: { light: "#3b82f6" } },
                high: { theme: { light: "#22c55e" } },
              }}
              className="h-[300px]"
            >
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis 
                  label={{ 
                    value: 'Hours', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
                  }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  domain={[0, 'dataMax + 1']}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <ReferenceLine
                  y={averageHoursPerDay}
                  stroke="#9ca3af"
                  strokeDasharray="3 3"
                  label={{ 
                    value: "Avg", 
                    position: "insideBottomRight",
                    style: { fontSize: 10, fill: '#6b7280' }
                  }}
                />
                <Bar 
                  dataKey="hours" 
                  radius={[4, 4, 0, 0]} 
                  name="Available Hours"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={getBarColor(entry.hours)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 flex flex-col justify-center">
            <div className="text-center space-y-6">
              {/* Weekly Total */}
              <div>
                <div className="text-sm text-muted-foreground">Total Available Hours</div>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  {filteredTotalHours.toFixed(1)}
                </div>
              </div>
              
              {/* Average per day */}
              <div>
                <div className="text-sm text-muted-foreground">Daily Average</div>
                <div className="text-2xl font-semibold text-blue-600 mt-1 flex justify-center items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {averageHoursPerDay.toFixed(1)} hrs
                </div>
              </div>
              
              {/* Daily breakdown */}
              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-2">Daily Breakdown</div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {chartData.map((day) => (
                    <div key={day.day} className="flex justify-between text-sm items-center">
                      <span>{day.name}:</span>
                      <div className="flex items-center">
                        <div 
                          className="h-1.5 w-16 rounded-full bg-gray-200 mr-2 overflow-hidden"
                          title={`${day.hours.toFixed(1)} of max ${maxHours.toFixed(1)} hours`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${maxHours > 0 ? (day.hours / maxHours) * 100 : 0}%`,
                              backgroundColor: getBarColor(day.hours)
                            }}
                          />
                        </div>
                        <span className="font-medium tabular-nums">{day.hours.toFixed(1)} hrs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilitySummaryPanel;
