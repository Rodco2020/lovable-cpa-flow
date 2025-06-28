
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Clock, Building, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { useDemandMatrix } from '@/hooks/useDemandMatrix';
import { normalizeStaffId } from '@/utils/staffIdUtils';

interface TaskSummary {
  clientName: string;
  taskName: string;
  skillType: string;
  estimatedHours: number;
  monthlyHours: number;
  recurrencePattern: string;
  month: string;
  preferredStaffId: string;
  preferredStaffName: string;
}

interface MonthlySummary {
  month: string;
  totalHours: number;
  taskCount: number;
  clientCount: number;
  skills: string[];
}

interface ClientSummary {
  clientName: string;
  totalHours: number;
  taskCount: number;
  tasks: TaskSummary[];
  skills: string[];
}

export const MarcianosTaskSummaryReport: React.FC = () => {
  const [reportData, setReportData] = useState<{
    tasks: TaskSummary[];
    monthlySummary: MonthlySummary[];
    clientSummary: ClientSummary[];
    totalStats: {
      totalHours: number;
      totalTasks: number;
      totalClients: number;
      uniqueSkills: number;
      monthsCovered: number;
    };
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const { demandData, isLoading: matrixLoading } = useDemandMatrix('demand-only');

  useEffect(() => {
    if (demandData && !matrixLoading) {
      generateMarcianosReport(demandData);
    }
  }, [demandData, matrixLoading]);

  const generateMarcianosReport = (data: DemandMatrixData) => {
    console.log('🎯 [MARCIANO REPORT] Starting comprehensive task analysis...');
    
    // Marciano's staff ID variations we've seen in the logs
    const marcianoIds = [
      'fbd1bcee-ae68-43ef-891a-36cccd21a87a',
      'Marciano Urbaez',
      'marciano urbaez',
      'marciano-urbaez'
    ];
    
    const marcianoTasks: TaskSummary[] = [];
    const monthlyMap = new Map<string, MonthlySummary>();
    const clientMap = new Map<string, ClientSummary>();
    
    console.log('🔍 [MARCIANO REPORT] Searching for Marciano in data points...');
    
    // Search through all data points for Marciano's tasks
    data.dataPoints.forEach((dataPoint, dpIndex) => {
      if (dataPoint.taskBreakdown) {
        dataPoint.taskBreakdown.forEach((task, taskIndex) => {
          // Check if this task is assigned to Marciano
          const isMarcianoTask = marcianoIds.some(id => {
            const normalizedTaskStaff = normalizeStaffId(task.preferredStaffId);
            const normalizedSearchId = normalizeStaffId(id);
            return normalizedTaskStaff === normalizedSearchId ||
                   task.preferredStaffName?.toLowerCase().includes('marciano') ||
                   task.preferredStaffId?.toLowerCase().includes('marciano');
          });
          
          if (isMarcianoTask) {
            console.log(`✅ [MARCIANO REPORT] Found Marciano task:`, {
              taskName: task.taskName,
              clientName: task.clientName,
              skillType: task.skillType,
              hours: task.estimatedHours,
              monthlyHours: task.monthlyHours,
              month: dataPoint.month,
              preferredStaffId: task.preferredStaffId,
              preferredStaffName: task.preferredStaffName
            });
            
            const taskSummary: TaskSummary = {
              clientName: task.clientName,
              taskName: task.taskName,
              skillType: task.skillType,
              estimatedHours: task.estimatedHours,
              monthlyHours: task.monthlyHours,
              recurrencePattern: task.recurrencePattern ? 
                `${task.recurrencePattern.type} (${task.recurrencePattern.frequency}x)` : 
                'One-time',
              month: dataPoint.monthLabel || dataPoint.month,
              preferredStaffId: task.preferredStaffId || '',
              preferredStaffName: task.preferredStaffName || 'Marciano Urbaez'
            };
            
            marcianoTasks.push(taskSummary);
            
            // Update monthly summary
            const monthKey = dataPoint.month;
            if (!monthlyMap.has(monthKey)) {
              monthlyMap.set(monthKey, {
                month: dataPoint.monthLabel || dataPoint.month,
                totalHours: 0,
                taskCount: 0,
                clientCount: 0,
                skills: []
              });
            }
            
            const monthlySummary = monthlyMap.get(monthKey)!;
            monthlySummary.totalHours += task.monthlyHours || task.estimatedHours;
            monthlySummary.taskCount += 1;
            if (!monthlySummary.skills.includes(task.skillType)) {
              monthlySummary.skills.push(task.skillType);
            }
            
            // Update client summary
            const clientKey = task.clientName;
            if (!clientMap.has(clientKey)) {
              clientMap.set(clientKey, {
                clientName: task.clientName,
                totalHours: 0,
                taskCount: 0,
                tasks: [],
                skills: []
              });
            }
            
            const clientSummary = clientMap.get(clientKey)!;
            clientSummary.totalHours += task.monthlyHours || task.estimatedHours;
            clientSummary.taskCount += 1;
            clientSummary.tasks.push(taskSummary);
            if (!clientSummary.skills.includes(task.skillType)) {
              clientSummary.skills.push(task.skillType);
            }
          }
        });
      }
    });
    
    // Update client counts in monthly summaries
    monthlyMap.forEach((monthlySummary, monthKey) => {
      const clientsInMonth = new Set<string>();
      marcianoTasks.forEach(task => {
        if (task.month === monthlySummary.month) {
          clientsInMonth.add(task.clientName);
        }
      });
      monthlySummary.clientCount = clientsInMonth.size;
    });
    
    // Calculate total stats
    const totalHours = marcianoTasks.reduce((sum, task) => sum + (task.monthlyHours || task.estimatedHours), 0);
    const uniqueClients = new Set(marcianoTasks.map(task => task.clientName));
    const uniqueSkills = new Set(marcianoTasks.map(task => task.skillType));
    const uniqueMonths = new Set(marcianoTasks.map(task => task.month));
    
    console.log('📊 [MARCIANO REPORT] Report Summary:', {
      totalTasks: marcianoTasks.length,
      totalHours,
      totalClients: uniqueClients.size,
      uniqueSkills: uniqueSkills.size,
      monthsCovered: uniqueMonths.size
    });
    
    setReportData({
      tasks: marcianoTasks,
      monthlySummary: Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month)),
      clientSummary: Array.from(clientMap.values()).sort((a, b) => b.totalHours - a.totalHours),
      totalStats: {
        totalHours,
        totalTasks: marcianoTasks.length,
        totalClients: uniqueClients.size,
        uniqueSkills: uniqueSkills.size,
        monthsCovered: uniqueMonths.size
      }
    });
    
    setIsLoading(false);
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const reportText = `
MARCIANO URBAEZ - TASK ASSIGNMENT SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

=== OVERVIEW ===
Total Tasks Assigned: ${reportData.totalStats.totalTasks}
Total Hours: ${reportData.totalStats.totalHours}
Clients Served: ${reportData.totalStats.totalClients}
Skills Required: ${reportData.totalStats.uniqueSkills}
Months Covered: ${reportData.totalStats.monthsCovered}

=== MONTHLY BREAKDOWN ===
${reportData.monthlySummary.map(month => 
  `${month.month}: ${month.totalHours}h (${month.taskCount} tasks, ${month.clientCount} clients)`
).join('\n')}

=== CLIENT BREAKDOWN ===
${reportData.clientSummary.map(client => 
  `${client.clientName}: ${client.totalHours}h (${client.taskCount} tasks)`
).join('\n')}

=== DETAILED TASK LIST ===
${reportData.tasks.map(task => 
  `${task.month} | ${task.clientName} | ${task.taskName} | ${task.skillType} | ${task.monthlyHours || task.estimatedHours}h`
).join('\n')}
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marciano-urbaez-task-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading || matrixLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Marciano Urbaez - Task Summary Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading report data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData || reportData.tasks.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Marciano Urbaez - Task Summary Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-muted-foreground">
                No tasks found assigned to Marciano Urbaez
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                This could mean tasks are not properly assigned or the staff ID mapping needs attention.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Marciano Urbaez - Task Summary Report
            </CardTitle>
            <Button onClick={exportReport} variant="outline" size="sm">
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reportData.totalStats.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reportData.totalStats.totalHours}h</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reportData.totalStats.totalClients}</div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{reportData.totalStats.uniqueSkills}</div>
              <div className="text-sm text-muted-foreground">Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{reportData.totalStats.monthsCovered}</div>
              <div className="text-sm text-muted-foreground">Months</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.monthlySummary.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{month.month}</div>
                  <div className="text-sm text-muted-foreground">
                    {month.taskCount} tasks • {month.clientCount} clients
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{month.totalHours}h</div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {month.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Client Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.clientSummary.map((client, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-lg">{client.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.taskCount} tasks • {client.totalHours} hours
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {client.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  {client.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{task.taskName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {task.skillType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{task.monthlyHours || task.estimatedHours}h</span>
                        <span className="text-xs">({task.month})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Task List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All Assigned Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-left p-2">Client</th>
                  <th className="text-left p-2">Task</th>
                  <th className="text-left p-2">Skill</th>
                  <th className="text-left p-2">Hours</th>
                  <th className="text-left p-2">Recurrence</th>
                </tr>
              </thead>
              <tbody>
                {reportData.tasks.map((task, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{task.month}</td>
                    <td className="p-2 font-medium">{task.clientName}</td>
                    <td className="p-2">{task.taskName}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {task.skillType}
                      </Badge>
                    </td>
                    <td className="p-2">{task.monthlyHours || task.estimatedHours}h</td>
                    <td className="p-2 text-muted-foreground text-xs">{task.recurrencePattern}</td>
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
