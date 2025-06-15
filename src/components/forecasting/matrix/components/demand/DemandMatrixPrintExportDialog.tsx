import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileDown, Printer, FileText, Users, Info, TrendingUp } from 'lucide-react';
import { DemandMatrixData } from '@/types/demand';
import { formatCurrency, formatHours, formatNumber } from '@/lib/numberUtils';

interface DemandMatrixPrintExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  demandData: DemandMatrixData;
  selectedSkills: string[];
  selectedClients: string[];
  monthRange: { start: number; end: number };
  groupingMode: 'skill' | 'client';
}

export const DemandMatrixPrintExportDialog: React.FC<DemandMatrixPrintExportDialogProps> = ({
  isOpen,
  onClose,
  demandData,
  selectedSkills,
  selectedClients,
  monthRange,
  groupingMode
}) => {
  const [activeTab, setActiveTab] = useState<'firmwide' | 'client' | 'revenue'>('firmwide');
  const [selectedClientForReport, setSelectedClientForReport] = useState<string>('');

  // Get filtered months based on current range
  const filteredMonths = demandData.months.slice(monthRange.start, monthRange.end + 1);

  // Generate firmwide summary data with enhanced revenue metrics
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
      // NEW: Enhanced revenue metrics
      totalExpectedRevenue: demandData.clientRevenue ? 
        Array.from(demandData.clientRevenue.values()).reduce((sum, revenue) => sum + revenue, 0) : 0,
      totalSuggestedRevenue: demandData.revenueTotals?.totalSuggestedRevenue || 0,
      totalExpectedLessSuggested: demandData.revenueTotals?.totalExpectedLessSuggested || 0,
      averageHourlyRate: demandData.clientHourlyRates ? 
        Array.from(demandData.clientHourlyRates.values()).reduce((sum, rate, index, array) => 
          sum + rate / array.length, 0) : 0,
      revenueByClient: demandData.clientRevenue ? 
        Array.from(demandData.clientRevenue.entries()).map(([client, revenue]) => ({
          clientName: client,
          expectedRevenue: revenue,
          suggestedRevenue: demandData.clientSuggestedRevenue?.get(client) || 0,
          expectedLessSuggested: demandData.clientExpectedLessSuggested?.get(client) || 0,
          totalHours: demandData.clientTotals?.get(client) || 0
        })).sort((a, b) => b.expectedRevenue - a.expectedRevenue) : []
    };

    return summary;
  };

  // NEW: Generate revenue analysis summary
  const generateRevenueAnalysis = () => {
    if (!demandData.clientRevenue || !demandData.clientSuggestedRevenue) {
      return null;
    }

    const analysis = {
      totalExpectedRevenue: Array.from(demandData.clientRevenue.values()).reduce((sum, val) => sum + val, 0),
      totalSuggestedRevenue: Array.from(demandData.clientSuggestedRevenue.values()).reduce((sum, val) => sum + val, 0),
      totalDifference: Array.from(demandData.clientExpectedLessSuggested?.values() || []).reduce((sum, val) => sum + val, 0),
      clientBreakdown: Array.from(demandData.clientRevenue.entries()).map(([client, expectedRevenue]) => ({
        clientName: client,
        expectedRevenue,
        suggestedRevenue: demandData.clientSuggestedRevenue?.get(client) || 0,
        difference: demandData.clientExpectedLessSuggested?.get(client) || 0,
        totalHours: demandData.clientTotals?.get(client) || 0,
        hourlyRate: demandData.clientHourlyRates?.get(client) || 0
      })).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)),
      // Risk analysis
      undervaluedClients: [] as any[],
      overvaluedClients: [] as any[]
    };

    // Categorize clients by revenue variance
    analysis.clientBreakdown.forEach(client => {
      if (client.difference < -1000) { // Suggested > Expected by more than $1000
        analysis.overvaluedClients.push(client);
      } else if (client.difference > 1000) { // Expected > Suggested by more than $1000
        analysis.undervaluedClients.push(client);
      }
    });

    return analysis;
  };

  // Generate client-specific forecast data with enhanced revenue information
  const generateClientForecast = (clientName: string) => {
    const clientData = demandData.dataPoints.filter(dp => 
      dp.taskBreakdown?.some(task => task.clientName === clientName)
    );

    const clientTasks = clientData.flatMap(dp => 
      dp.taskBreakdown?.filter(task => task.clientName === clientName) || []
    );

    const monthlyForecast = filteredMonths.map(month => {
      const monthTasks = clientTasks.filter(task => {
        return task.monthlyHours > 0;
      });

      return {
        month: month.label,
        tasks: monthTasks,
        totalHours: monthTasks.reduce((sum, task) => sum + task.monthlyHours, 0),
        expectedRevenue: demandData.clientRevenue?.get(clientName) || 0
      };
    });

    return {
      clientName,
      totalHours: clientTasks.reduce((sum, task) => sum + task.monthlyHours, 0),
      expectedRevenue: demandData.clientRevenue?.get(clientName) || 0,
      suggestedRevenue: demandData.clientSuggestedRevenue?.get(clientName) || 0,
      expectedLessSuggested: demandData.clientExpectedLessSuggested?.get(clientName) || 0,
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
    let data;
    switch (activeTab) {
      case 'firmwide':
        data = generateFirmwideSummary();
        break;
      case 'client':
        data = selectedClientForReport ? generateClientForecast(selectedClientForReport) : null;
        break;
      case 'revenue':
        data = generateRevenueAnalysis();
        break;
      default:
        data = generateFirmwideSummary();
    }

    if (!data) return;

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
  const revenueAnalysis = generateRevenueAnalysis();
  const clientForecast = selectedClientForReport ? generateClientForecast(selectedClientForReport) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Demand Forecast Reports ({groupingMode === 'skill' ? 'Skill View' : 'Client View'})
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'firmwide' | 'client' | 'revenue')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="firmwide" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Firmwide Summary
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Client Forecast
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue Analysis
              <Badge variant="secondary" className="text-xs">NEW</Badge>
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
                  <span>{formatHours(firmwideSummary.totalDemandHours, 1)} total demand</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Key Metrics with Revenue */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatHours(firmwideSummary.totalDemandHours, 1)}</div>
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
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(firmwideSummary.totalExpectedRevenue)}</div>
                    <div className="text-sm text-muted-foreground">Expected Revenue</div>
                  </div>
                </div>

                {/* NEW: Revenue Comparison Row */}
                {groupingMode === 'client' && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-xl font-bold text-emerald-600">{formatCurrency(firmwideSummary.totalSuggestedRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Suggested Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${firmwideSummary.totalExpectedLessSuggested >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {formatCurrency(firmwideSummary.totalExpectedLessSuggested)}
                      </div>
                      <div className="text-sm text-muted-foreground">Expected Less Suggested</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">${formatNumber(firmwideSummary.averageHourlyRate, 0)}/h</div>
                      <div className="text-sm text-muted-foreground">Avg. Hourly Rate</div>
                    </div>
                  </div>
                )}

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

          {/* NEW: Revenue Analysis Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {groupingMode !== 'client' ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Revenue analysis is only available in Client grouping mode. Switch to Client view to access detailed revenue analytics.
                </AlertDescription>
              </Alert>
            ) : revenueAnalysis ? (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analysis & Variance Report</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{firmwideSummary.timeHorizon}</Badge>
                    <span>•</span>
                    <span>Expected vs. Suggested Revenue Comparison</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Revenue Overview */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(revenueAnalysis.totalExpectedRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Total Expected Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{formatCurrency(revenueAnalysis.totalSuggestedRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Total Suggested Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className={`text-2xl font-bold ${revenueAnalysis.totalDifference >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {formatCurrency(revenueAnalysis.totalDifference)}
                      </div>
                      <div className="text-sm text-muted-foreground">Net Difference</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Risk Analysis */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Undervalued Clients */}
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-700">Undervalued Clients ({revenueAnalysis.undervaluedClients.length})</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {revenueAnalysis.undervaluedClients.map((client, index) => (
                          <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="font-medium">{client.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              Expected: {formatCurrency(client.expectedRevenue)} | 
                              Suggested: {formatCurrency(client.suggestedRevenue)}
                            </div>
                            <div className="text-sm font-medium text-orange-700">
                              Potential increase: {formatCurrency(client.difference)}
                            </div>
                          </div>
                        ))}
                        {revenueAnalysis.undervaluedClients.length === 0 && (
                          <div className="text-sm text-muted-foreground italic">No undervalued clients identified</div>
                        )}
                      </div>
                    </div>

                    {/* Overvalued Clients */}
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700">Overvalued Clients ({revenueAnalysis.overvaluedClients.length})</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {revenueAnalysis.overvaluedClients.map((client, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="font-medium">{client.clientName}</div>
                            <div className="text-sm text-muted-foreground">
                              Expected: {formatCurrency(client.expectedRevenue)} | 
                              Suggested: {formatCurrency(client.suggestedRevenue)}
                            </div>
                            <div className="text-sm font-medium text-red-700">
                              Over-expectation: {formatCurrency(Math.abs(client.difference))}
                            </div>
                          </div>
                        ))}
                        {revenueAnalysis.overvaluedClients.length === 0 && (
                          <div className="text-sm text-muted-foreground italic">No overvalued clients identified</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No revenue data available for analysis. Ensure client revenue information is configured.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Client Forecast Tab - Enhanced with Revenue */}
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

            {/* Enhanced Client Forecast Details */}
            {clientForecast && (
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Forecast for {clientForecast.clientName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{firmwideSummary.timeHorizon}</Badge>
                    <span>•</span>
                    <span>{formatHours(clientForecast.totalHours, 1)} projected</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Enhanced Client Key Metrics with Revenue Comparison */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{formatHours(clientForecast.totalHours, 1)}</div>
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(clientForecast.expectedRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Expected Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{formatCurrency(clientForecast.suggestedRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Suggested Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${clientForecast.expectedLessSuggested >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                        {formatCurrency(clientForecast.expectedLessSuggested)}
                      </div>
                      <div className="text-sm text-muted-foreground">Difference</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">${formatNumber(clientForecast.hourlyRate, 0)}/h</div>
                      <div className="text-sm text-muted-foreground">Hourly Rate</div>
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
