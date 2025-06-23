
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Users, TestTube } from 'lucide-react';
import { DemandMatrixVisualization } from './components/demand/DemandMatrixVisualization';
import { DemandMatrixControlsPanel } from './components/demand/DemandMatrixControlsPanel';
import { useDemandMatrix } from './hooks/useDemandMatrix';
import { useStaffDropdownIntegration } from './hooks/useStaffDropdownIntegration';

/**
 * Demand Matrix Tab Component
 * 
 * Enhanced with staff dropdown integration and comprehensive testing.
 * This component provides:
 * - Demand matrix visualization with staff filtering
 * - Integrated staff dropdown with real-time data
 * - Performance monitoring and testing capabilities
 * - Comprehensive filtering controls
 */
export const DemandMatrixTab: React.FC = () => {
  const {
    demandData,
    isLoading: isMatrixLoading,
    error: matrixError,
    filters,
    groupingMode,
    monthRange,
    updateFilters,
    setGroupingMode,
    setMonthRange,
    exportData,
    printExport,
    resetFilters
  } = useDemandMatrix();

  const {
    staffOptions,
    isLoading: isStaffLoading,
    error: staffError,
    lastFetched,
    refreshStaffData,
    testIntegration,
    clearError
  } = useStaffDropdownIntegration();

  // Extract available options from demand data
  const availableSkills = demandData?.skills || [];
  const availableClients: Array<{ id: string; name: string }> = demandData?.dataPoints
    ? Array.from(new Set(
        demandData.dataPoints
          .flatMap(dp => dp.taskBreakdown?.map(task => ({
            id: task.clientId,
            name: task.clientName
          })) || [])
      )).map(item => ({
        id: item.id || '',
        name: item.name || ''
      }))
    : [];

  // Transform staff options to expected format
  const availablePreferredStaff: Array<{ id: string; name: string }> = staffOptions.map(staff => ({
    id: staff.id,
    name: staff.name
  }));

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    updateFilters({ skills: newSkills });
  };

  const handleClientToggle = (clientId: string) => {
    const newClients = filters.clients.includes(clientId)
      ? filters.clients.filter(c => c !== clientId)
      : [...filters.clients, clientId];
    updateFilters({ clients: newClients });
  };

  const handlePreferredStaffToggle = (staffId: string) => {
    const newStaff = filters.preferredStaff.includes(staffId)
      ? filters.preferredStaff.filter(s => s !== staffId)
      : [...filters.preferredStaff, staffId];
    updateFilters({ preferredStaff: newStaff });
  };

  const isLoading = isMatrixLoading || isStaffLoading;
  const hasError = matrixError || staffError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading demand matrix and staff data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {matrixError && (
            <div className="text-red-600">
              <strong>Matrix Error:</strong> {matrixError}
            </div>
          )}
          {staffError && (
            <div className="text-red-600">
              <strong>Staff Error:</strong> {staffError}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
            {staffError && (
              <Button variant="outline" onClick={clearError}>
                Clear Staff Error
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Staff Integration Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demand Matrix with Staff Integration
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={staffOptions.length > 0 ? "default" : "destructive"}>
                {staffOptions.length} Staff Members
              </Badge>
              {lastFetched && (
                <Badge variant="outline" className="text-xs">
                  Updated: {lastFetched.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStaffData}
              disabled={isStaffLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isStaffLoading ? 'animate-spin' : ''}`} />
              Refresh Staff Data
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testIntegration}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test Integration
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Staff dropdown integration: {staffOptions.length > 0 ? 'Active' : 'No data'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Matrix View</TabsTrigger>
          <TabsTrigger value="controls">Filter Controls</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matrix" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-1">
              <DemandMatrixControlsPanel
                isControlsExpanded={true}
                onToggleControls={() => {}}
                selectedSkills={filters.skills}
                selectedClients={filters.clients}
                selectedPreferredStaff={filters.preferredStaff}
                onSkillToggle={handleSkillToggle}
                onClientToggle={handleClientToggle}
                onPreferredStaffToggle={handlePreferredStaffToggle}
                monthRange={monthRange}
                onMonthRangeChange={setMonthRange}
                onExport={exportData}
                onReset={resetFilters}
                onPrintExport={printExport}
                groupingMode={groupingMode}
                availableSkills={availableSkills}
                availableClients={availableClients}
                availablePreferredStaff={availablePreferredStaff}
              />
            </div>
            
            {/* Matrix Visualization */}
            <div className="lg:col-span-3">
              {demandData ? (
                <DemandMatrixVisualization
                  data={demandData}
                  groupingMode={groupingMode}
                  onGroupingModeChange={setGroupingMode}
                  selectedSkills={filters.skills}
                  selectedClients={filters.clients}
                  selectedPreferredStaff={filters.preferredStaff}
                  monthRange={monthRange}
                />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-[400px]">
                    <div className="text-center space-y-2">
                      <p className="text-muted-foreground">No demand data available</p>
                      <p className="text-sm text-muted-foreground">
                        Check that you have recurring tasks configured with proper skill assignments
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="controls" className="space-y-4">
          <DemandMatrixControlsPanel
            isControlsExpanded={true}
            onToggleControls={() => {}}
            selectedSkills={filters.skills}
            selectedClients={filters.clients}
            selectedPreferredStaff={filters.preferredStaff}
            onSkillToggle={handleSkillToggle}
            onClientToggle={handleClientToggle}
            onPreferredStaffToggle={handlePreferredStaffToggle}
            monthRange={monthRange}
            onMonthRangeChange={setMonthRange}
            onExport={exportData}
            onReset={resetFilters}
            onPrintExport={printExport}
            groupingMode={groupingMode}
            availableSkills={availableSkills}
            availableClients={availableClients}
            availablePreferredStaff={availablePreferredStaff}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
