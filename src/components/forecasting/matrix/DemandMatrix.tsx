
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Play, Bug } from 'lucide-react';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useDemandMatrixFiltering } from './hooks/useDemandMatrixFiltering';
import { DemandMatrixControlsPanel } from './components/demand/DemandMatrixControlsPanel';
import { DemandMatrixDisplay } from './components/demand/DemandMatrixDisplay';
import { DemandMatrixDiagnosticPanel } from './components/demand/DemandMatrixDiagnosticPanel';
import { Phase1ValidationService } from '@/services/forecasting/matrix/phase1ValidationService';
import type { Phase1ValidationReport } from '@/services/forecasting/matrix/phase1ValidationService';

interface DemandMatrixProps {
  groupingMode: 'skill' | 'client';
}

/**
 * Enhanced DemandMatrix Component with Comprehensive Debugging
 * 
 * ENHANCED FEATURES:
 * - Comprehensive diagnostic panel for troubleshooting
 * - Enhanced debugging and validation
 * - Improved data quality analysis
 * - Real-time filter validation
 * - Performance monitoring
 */
export const DemandMatrix: React.FC<DemandMatrixProps> = ({ groupingMode }) => {
  const [validationReport, setValidationReport] = useState<Phase1ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Enhanced matrix controls with debugging
  const matrixControls = useDemandMatrixControls({
    groupingMode,
    enablePreferredStaffFiltering: true
  });

  const filteredData = useDemandMatrixFiltering({
    demandData: matrixControls.demandData,
    selectedSkills: matrixControls.selectedSkills,
    selectedClients: matrixControls.selectedClients,
    selectedPreferredStaff: matrixControls.selectedPreferredStaff,
    monthRange: matrixControls.monthRange,
    isAllSkillsSelected: matrixControls.isAllSkillsSelected,
    isAllClientsSelected: matrixControls.isAllClientsSelected,
    isAllPreferredStaffSelected: matrixControls.isAllPreferredStaffSelected,
    preferredStaffFilterMode: matrixControls.preferredStaffFilterMode
  });

  /**
   * Run Phase 1 validation
   */
  const runPhase1Validation = async () => {
    setIsValidating(true);
    try {
      console.log('🚀 [ENHANCED VALIDATION] Running comprehensive Phase 1 validation...');
      const report = await Phase1ValidationService.runPhase1Validation();
      setValidationReport(report);
      setShowValidationDetails(true);
      
      if (report.overallSuccess) {
        console.log('✅ [ENHANCED VALIDATION] Phase 1 validation passed!');
      } else {
        console.warn('⚠️ [ENHANCED VALIDATION] Phase 1 validation failed:', report.summary);
      }
    } catch (error) {
      console.error('❌ [ENHANCED VALIDATION] Phase 1 validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Auto-run validation on component mount
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      runPhase1Validation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  console.log(`🚀 [ENHANCED MATRIX] DemandMatrix rendering with comprehensive debugging:`, {
    groupingMode,
    preferredStaffFilterMode: matrixControls.preferredStaffFilterMode,
    hasFilteredData: !!filteredData,
    originalDataPoints: matrixControls.demandData?.dataPoints?.length || 0,
    filteredDataPoints: filteredData?.dataPoints?.length || 0,
    totalDemand: filteredData?.totalDemand || 0,
    isLoading: matrixControls.isLoading
  });

  return (
    <div className="space-y-6">
      {/* Phase 1: Validation Status Card - Enhanced */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Enhanced Demand Matrix with Comprehensive Debugging
                </h3>
                <p className="text-sm text-blue-700">
                  Advanced validation, debugging, and data quality analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {validationReport && (
                <Badge 
                  variant={validationReport.overallSuccess ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {validationReport.overallSuccess ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {validationReport.overallSuccess ? 'PASSED' : 'FAILED'}
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="flex items-center gap-2"
              >
                <Bug className="h-4 w-4" />
                {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={runPhase1Validation}
                disabled={isValidating}
                className="flex items-center gap-2"
              >
                {isValidating ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isValidating ? 'Validating...' : 'Run Validation'}
              </Button>
            </div>
          </div>

          {/* Validation Summary */}
          {validationReport && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {validationReport.summary.passedTests}
                  </div>
                  <div className="text-xs text-gray-600">Tests Passed</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {validationReport.summary.failedTests}
                  </div>
                  <div className="text-xs text-gray-600">Tests Failed</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationReport.summary.warningsCount}
                  </div>
                  <div className="text-xs text-gray-600">Warnings</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {validationReport.duration}ms
                  </div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
              </div>

              {/* Enhanced summary with data quality info */}
              {filteredData && (
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-sm font-medium mb-2">Current Data Status</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Data Points:</span> {filteredData.dataPoints.length}
                    </div>
                    <div>
                      <span className="font-medium">Total Demand:</span> {filteredData.totalDemand}h
                    </div>
                    <div>
                      <span className="font-medium">Total Tasks:</span> {filteredData.totalTasks}
                    </div>
                    <div>
                      <span className="font-medium">Total Clients:</span> {filteredData.totalClients}
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle detailed validation report */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowValidationDetails(!showValidationDetails)}
                className="w-full"
              >
                {showValidationDetails ? 'Hide' : 'Show'} Validation Details
              </Button>

              {/* Detailed validation report */}
              {showValidationDetails && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {Phase1ValidationService.generateReportSummary(validationReport)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Diagnostic Panel */}
      {filteredData && (
        <DemandMatrixDiagnosticPanel
          matrixData={filteredData}
          selectedSkills={matrixControls.selectedSkills}
          selectedClients={matrixControls.selectedClients}
          selectedPreferredStaff={matrixControls.selectedPreferredStaff}
          preferredStaffFilterMode={matrixControls.preferredStaffFilterMode}
          availableSkills={matrixControls.availableSkills}
          availableClients={matrixControls.availableClients}
          availablePreferredStaff={matrixControls.availablePreferredStaff}
          isVisible={showDiagnostics}
        />
      )}

      {/* Enhanced Matrix Implementation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel - Enhanced */}
        <div className="lg:col-span-1">
          <DemandMatrixControlsPanel
            isControlsExpanded={true}
            onToggleControls={() => {}}
            selectedSkills={matrixControls.selectedSkills}
            selectedClients={matrixControls.selectedClients}
            selectedPreferredStaff={matrixControls.selectedPreferredStaff}
            onSkillToggle={matrixControls.onSkillToggle}
            onClientToggle={matrixControls.onClientToggle}
            onPreferredStaffToggle={matrixControls.onPreferredStaffToggle}
            monthRange={matrixControls.monthRange}
            onMonthRangeChange={matrixControls.onMonthRangeChange}
            onExport={matrixControls.onExport}
            onReset={matrixControls.onReset}
            groupingMode={groupingMode}
            availableSkills={matrixControls.availableSkills}
            availableClients={matrixControls.availableClients}
            availablePreferredStaff={matrixControls.availablePreferredStaff}
            isAllSkillsSelected={matrixControls.isAllSkillsSelected}
            isAllClientsSelected={matrixControls.isAllClientsSelected}
            isAllPreferredStaffSelected={matrixControls.isAllPreferredStaffSelected}
            preferredStaffFilterMode={matrixControls.preferredStaffFilterMode}
            onPreferredStaffFilterModeChange={matrixControls.onPreferredStaffFilterModeChange}
            preferredStaffLoading={matrixControls.isLoading}
          />
        </div>

        {/* Matrix Display - Enhanced */}
        <div className="lg:col-span-3">
          <DemandMatrixDisplay
            matrixData={filteredData}
            groupingMode={groupingMode}
            isLoading={matrixControls.isLoading}
            error={matrixControls.error ? matrixControls.error.message : null}
          />
        </div>
      </div>
    </div>
  );
};

export default DemandMatrix;
