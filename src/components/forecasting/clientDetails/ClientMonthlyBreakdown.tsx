
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, TrendingUp, Clock } from 'lucide-react';

interface ClientMonthlyBreakdownProps {
  clientId: string;
  dateRange: { start: Date; end: Date };
  skillFilter?: string[];
}

interface MonthlyData {
  month: string;
  totalHours: number;
  taskCount: number;
  skillBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}

const SKILL_COLORS = {
  'Junior': '#3b82f6',
  'Senior': '#10b981', 
  'CPA': '#f59e0b',
  'Tax': '#ef4444',
  'Audit': '#8b5cf6',
  'Advisory': '#06b6d4'
};

const ClientMonthlyBreakdown: React.FC<ClientMonthlyBreakdownProps> = ({
  clientId,
  dateRange,
  skillFilter
}) => {
  // Fetch task instances for the date range
  const { data: taskInstances, isLoading, error } = useQuery({
    queryKey: ['client-monthly-breakdown', clientId, dateRange, skillFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_instances')
        .select(`
          id,
          name,
          estimated_hours,
          due_date,
          priority,
          category,
          required_skills,
          status
        `)
        .eq('client_id', clientId)
        .gte('due_date', dateRange.start.toISOString())
        .lte('due_date', dateRange.end.toISOString())
        .not('due_date', 'is', null);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId
  });

  // Process data into monthly breakdown
  const monthlyData = useMemo(() => {
    if (!taskInstances) return [];

    const monthMap = new Map<string, MonthlyData>();

    taskInstances.forEach(task => {
      if (!task.due_date) return;

      // Filter by skills if specified
      if (skillFilter?.length && 
          !skillFilter.some(skill => task.required_skills.includes(skill))) {
        return;
      }

      const date = new Date(task.due_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthLabel,
          totalHours: 0,
          taskCount: 0,
          skillBreakdown: {},
          priorityBreakdown: {},
          categoryBreakdown: {}
        });
      }

      const monthData = monthMap.get(monthKey)!;
      monthData.totalHours += Number(task.estimated_hours);
      monthData.taskCount += 1;

      // Update skill breakdown
      task.required_skills.forEach(skill => {
        monthData.skillBreakdown[skill] = (monthData.skillBreakdown[skill] || 0) + Number(task.estimated_hours);
      });

      // Update priority breakdown
      monthData.priorityBreakdown[task.priority] = (monthData.priorityBreakdown[task.priority] || 0) + Number(task.estimated_hours);

      // Update category breakdown
      monthData.categoryBreakdown[task.category] = (monthData.categoryBreakdown[task.category] || 0) + Number(task.estimated_hours);
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [taskInstances, skillFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalHours = monthlyData.reduce((sum, month) => sum + month.totalHours, 0);
    const totalTasks = monthlyData.reduce((sum, month) => sum + month.taskCount, 0);
    const avgHoursPerMonth = monthlyData.length > 0 ? totalHours / monthlyData.length : 0;
    const avgTasksPerMonth = monthlyData.length > 0 ? totalTasks / monthlyData.length : 0;

    // Overall skill breakdown
    const skillTotals: Record<string, number> = {};
    monthlyData.forEach(month => {
      Object.entries(month.skillBreakdown).forEach(([skill, hours]) => {
        skillTotals[skill] = (skillTotals[skill] || 0) + hours;
      });
    });

    return {
      totalHours,
      totalTasks,
      avgHoursPerMonth,
      avgTasksPerMonth,
      skillTotals
    };
  }, [monthlyData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading monthly breakdown...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">Error loading monthly data</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.totalHours.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.avgHoursPerMonth.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Hours/Month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{summaryStats.avgTasksPerMonth.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Tasks/Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Monthly Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)} hours`, 
                    name === 'totalHours' ? 'Total Hours' : name
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="totalHours" fill="#3b82f6" name="totalHours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skill Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Distribution Across Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(summaryStats.skillTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([skill, hours]) => (
                <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || '#6b7280' 
                      }}
                    />
                    <span className="font-medium">{skill}</span>
                  </div>
                  <Badge variant="secondary">
                    {hours.toFixed(1)}h
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Total Hours</th>
                  <th className="text-right p-2">Task Count</th>
                  <th className="text-left p-2">Top Skills</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => (
                  <tr key={month.month} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{month.month}</td>
                    <td className="p-2 text-right font-mono">{month.totalHours.toFixed(1)}h</td>
                    <td className="p-2 text-right">{month.taskCount}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(month.skillBreakdown)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([skill, hours]) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill} ({hours.toFixed(1)}h)
                            </Badge>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientMonthlyBreakdown;
