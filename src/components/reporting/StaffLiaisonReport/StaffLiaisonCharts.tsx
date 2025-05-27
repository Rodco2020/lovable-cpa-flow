
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { StaffLiaisonSummaryData } from "@/types/reporting";
import { formatCurrency } from "@/lib/utils";

interface StaffLiaisonChartsProps {
  data: StaffLiaisonSummaryData[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const StaffLiaisonCharts: React.FC<StaffLiaisonChartsProps> = ({ data }) => {
  // Prepare data for charts
  const chartData = data.map(item => ({
    name: item.staffLiaisonName.length > 15 
      ? `${item.staffLiaisonName.substring(0, 15)}...` 
      : item.staffLiaisonName,
    fullName: item.staffLiaisonName,
    revenue: item.expectedMonthlyRevenue,
    clients: item.clientCount,
    completionRate: item.taskCompletionRate,
    activeTasks: item.activeTasksCount
  }));

  const pieData = data.map((item, index) => ({
    name: item.staffLiaisonName,
    value: item.expectedMonthlyRevenue,
    fill: COLORS[index % COLORS.length]
  }));

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    clients: {
      label: "Clients",
      color: "hsl(var(--chart-2))",
    },
    completionRate: {
      label: "Completion Rate",
      color: "hsl(var(--chart-3))",
    },
    activeTasks: {
      label: "Active Tasks",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue by Liaison Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Staff Liaison</CardTitle>
          <CardDescription>Expected monthly revenue comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [formatCurrency(Number(value)), "Revenue"]}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                  />} 
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
          <CardDescription>Proportion of revenue by liaison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                  fontSize={12}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                  />} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Client Count by Liaison */}
      <Card>
        <CardHeader>
          <CardTitle>Client Distribution</CardTitle>
          <CardDescription>Number of clients per liaison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [value, "Clients"]}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                  />} 
                />
                <Bar dataKey="clients" fill="var(--color-clients)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Task Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Task Completion Rates</CardTitle>
          <CardDescription>Completion percentage by liaison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  fontSize={12}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, "Completion Rate"]}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                  />} 
                />
                <Bar dataKey="completionRate" fill="var(--color-completionRate)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
