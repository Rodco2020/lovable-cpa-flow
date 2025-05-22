
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { getSchedulingMetrics } from '@/services/schedulingAnalyticsService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SchedulerMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState(getSchedulingMetrics());
  const [activeTab, setActiveTab] = useState('overview');
  
  // Refresh metrics every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMetrics(getSchedulingMetrics());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Prepare data for charts
  const priorityData = Object.entries(metrics.tasksPerPriority).map(([name, value]) => ({
    name,
    value
  }));
  
  const skillData = Object.entries(metrics.skillUtilization).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 skills
  
  const staffData = Object.entries(metrics.staffUtilization).map(([id, hours]) => ({
    id,
    hours
  })).sort((a, b) => b.hours - a.hours).slice(0, 5); // Top 5 staff
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Scheduling Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-md">
                <div className="text-sm text-muted-foreground">Tasks Scheduled</div>
                <div className="text-2xl font-bold">{metrics.tasksScheduledCount}</div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-md">
                <div className="text-sm text-muted-foreground">Avg. Time to Schedule</div>
                <div className="text-2xl font-bold">{metrics.averageTimeToSchedule.toFixed(1)}s</div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-md">
                <div className="text-sm text-muted-foreground">Success Rate</div>
                <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
              </div>
            </div>
            
            {priorityData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Tasks by Priority</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Top Skills Utilized</h4>
              {skillData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Tasks Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No skill utilization data available
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Task Priority Distribution</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(metrics.tasksPerPriority).map(([priority, count]) => (
                  <Badge key={priority} variant="outline" className="px-2 py-1">
                    {priority}: {count} tasks
                  </Badge>
                ))}
              </div>
              {Object.keys(metrics.tasksPerPriority).length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No priority distribution data available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="staff" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Top Staff Utilization (Hours)</h4>
              {staffData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={staffData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" name="Hours Assigned" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No staff utilization data available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SchedulerMetrics;
