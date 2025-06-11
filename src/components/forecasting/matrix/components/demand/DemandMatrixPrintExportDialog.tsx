
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileDown, Printer, FileText, Users } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { formatCurrency } from '@/lib/utils';

interface DemandMatrixPrintExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  demandData: DemandMatrixData;
  selectedSkills: string[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
}

export const DemandMatrixPrintExportDialog: React.FC<DemandMatrixPrintExportDialogProps> = ({
  isOpen,
  onClose,
  demandData,
  selectedSkills,
  selectedClients,
  monthRange
}) => {
  const [activeTab, setActiveTab] = useState<'firmwide' | 'client'>('firmwide');
  const [selectedClientForReport, setSelectedClientForReport] = useState<string>('');

  // Get filtered months based on current range
  const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);

  // Generate firmwide summary data
  const generateFirmwideSummary = () => {
    const summary = {
      totalDemandHours: demandData.totalDemand,
      totalClients: demandData.totalClients,
      totalTasks: demandData.totalTasks,
      timeHorizon: `${filteredMonths[0]?.label} - ${filteredMonths[filteredMonths.length - 1]?.label}`,
      skillBreakdown: demandData.skillSummary,
      monthlyBreakdown: filteredMonths.map(month => {
        const monthData = demandData.dataPoints.filter(dp => dp.month === month.key);
        return {
          month: month.label,
          totalHours: monthData.reduce((sum, dp) => sum + dp.demandHours, 0),
          totalTasks: monthData.reduce((sum, dp) => sum + dp.taskCount, 0),
          skillDistribution: monthData.reduce((acc, dp) => {
            acc[dp.skillType] = (acc[dp.skillType] || 0) + dp.demandHours;
            return acc;
          }, {} as Record<string, number>)
        };
      }),
      totalRevenue: demandData.clientRevenue ? 
        Array.from(demandData.clientRevenue.values()).reduce((sum, revenue) => sum + revenue, 0) : 0,
      averageHourlyRate: demandData.clientHourlyRates ? 
        Array.from(demandData.clientHourlyRates.values()).reduce((sum, rate, index, array) => 
          sum + rate / array.length, 0) : 0
    };

    return summary;
  };

  // Generate client-specific forecast data
  const generateClientForecast = (clientName: string) => {
    const clientData = demandData.dataPoints.filter(dp => 
      dp.taskBreakdown?.some(task => task.clientName === clientName)
    );

    const clientTasks = clientData.flatMap(dp => 
      dp.taskBreakdown?.filter(task => task.clientName === clientName) || []
    );

    const monthlyForecast = filteredMonths.map(month => {
      const monthTasks = clientTasks.filter(task => {
        // Check if task occurs in this month based on recurrence
        return task.monthlyHours > 0; // Simplified check
      });

      return {
        month: month.label,
        tasks: monthTasks,
        totalHours: monthTasks.reduce((sum, task) => sum + task.monthlyHours, 0),
        totalRevenue: demandData.clientRevenue?.get(clientName) || 0
      };
    });

    return {
      clientName,
      totalHours: clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0),
      totalRevenue: demandData.clientRevenue?.get(clientName) || 0,
      hourlyRate: demandData.clientHourlyRates?.get(clientName) || 0,
      monthlyForecast,
      skillsRequired: Array.from(new Set(clientTasks.map(task => task.skillType)))
    };
  };

  // Get unique client names for selection
  const availableClients = Array.from(new Set(
    demandData.dataPoints.flatMap(dp => 
      dp.taskBreakdown?.map(task => task.clientName) || []
    )
  )).filter(name => name && !name.includes('...'));

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const data = activeTab === 'firmwide' ? generateFirmwideSummary() : generateClientForecast(selectedClientForReport);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demand-forecast-${activeTab}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const firmwideSummary = generateFirmwideSummary();
  const clientForecast = selectedClientForReport ? generateClientForecast(selectedClientForReport) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demand Forecast Reports
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'firmwide' | 'client')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="firmwide" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Firmwide Summary
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Client Forecast
            </TabsTrigger>
          </TabsList>

          {/* Firmwide Summary Tab */}
          <TabsContent value="firmwide" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Firmwide Demand Summary</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{firmwideSummary.timeHorizon}</Badge>
                  <span>•</span>
                  <span>{firmwideSummary.totalDemandHours}h total demand</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{firmwideSummary.totalDemandHours}h</div>
                    <div className="text-sm text-muted-foreground">Total Demand</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{firmwideSummary.totalTasks}</div>
                    <div className="text-sm text-muted-foreground">Total Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{firmwideSummary.totalClients}</div>
                    <div className="text-sm text-muted-foreground">Active Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatCurrency(firmwideSummary.totalRevenue)}</div>
                    <div className="text-sm text-muted-foreground">Expected Revenue</div>
                  </div>
                </div>

                <Separator />

                {/* Skill Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3">Demand by Skill</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(firmwideSummary.skillBreakdown).map(([skill, data]) => (
                      <div key={skill} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{skill}</div>
                          <div className="text-sm text-muted-foreground">{data.taskCount} tasks</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{data.totalHours}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Monthly Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3">Monthly Forecast</h4>
                  <div className="space-y-2">
                    {firmwideSummary.monthlyBreakdown.map((month) => (
                      <div key={month.month} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{month.month}</div>
                          <div className="text-sm text-muted-foreground">{month.totalTasks} tasks</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{month.totalHours}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Forecast Tab */}
          <TabsContent value="client" className="space-y-4">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Client for Detailed Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <select 
                  value={selectedClientForReport} 
                  onChange={(e) => setSelectedClientForReport(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Choose a client...</option>
                  {availableClients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Client Forecast Details */}
            {clientForecast && (
              <Card>
                <CardHeader>
                  <CardTitle>Forecast for {clientForecast.clientName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{firmwideSummary.timeHorizon}</Badge>
                    <span>•</span>
                    <span>{clientForecast.totalHours}h projected</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Client Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{clientForecast.totalHours}h</div>
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(clientForecast.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Expected Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{formatCurrency(clientForecast.hourlyRate)}</div>
                      <div className="text-sm text-muted-foreground">Hourly Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{clientForecast.skillsRequired.length}</div>
                      <div className="text-sm text-muted-foreground">Skills Required</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Skills Required */}
                  <div>
                    <h4 className="font-semibold mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {clientForecast.skillsRequired.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Monthly Schedule */}
                  <div>
                    <h4 className="font-semibold mb-3">Monthly Schedule</h4>
                    <div className="space-y-3">
                      {clientForecast.monthlyForecast.map((month) => (
                        <div key={month.month} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium">{month.month}</h5>
                              <div className="text-sm text-muted-foreground">
                                {month.tasks.length} tasks • {month.totalHours}h
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{formatCurrency(month.totalRevenue)}</div>
                              <div className="text-sm text-muted-foreground">Revenue</div>
                            </div>
                          </div>
                          {month.tasks.length > 0 && (
                            <div className="space-y-2">
                              {month.tasks.slice(0, 3).map((task, index) => (
                                <div key={index} className="flex justify-between text-sm bg-muted p-2 rounded">
                                  <span>{task.taskName}</span>
                                  <span>{task.monthlyHours}h</span>
                                </div>
                              ))}
                              {month.tasks.length > 3 && (
                                <div className="text-sm text-muted-foreground text-center">
                                  +{month.tasks.length - 3} more tasks
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
