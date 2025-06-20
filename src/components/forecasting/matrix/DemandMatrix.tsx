
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Play } from 'lucide-react';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useDemandMatrixFiltering } from './hooks/useDemandMatrixFiltering';
import { DemandMatrixControlsPanel } from './components/demand/DemandMatrixControlsPanel';
import { DemandMatrixDisplay } from './components/demand/DemandMatrixDisplay';
import { Phase1ValidationService } from '@/services/forecasting/matrix/phase1ValidationService';
import type { Phase1ValidationReport } from '@/services/forecasting/matrix/phase1ValidationService';

interface DemandMatrixProps {
  groupingMode: 'skill' | 'client';
}

/**
 * Phase 1: Enhanced DemandMatrix Component with Validation Integration
 * 
 * PHASE 1 ENHANCEMENTS:
 * - Integrated Phase 1 validation service
 * - Added validation status display
 * - Maintains all existing functionality
 * - Provides real-time validation feedback
 * - Shows validation report in UI
 */
export const DemandMatrix: React.FC<DemandMatrixProps> = ({ groupingMode }) => {
  const [validationReport, setValidationReport] = useState<Phase1ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  // Enhanced matrix controls with demand-specific functionality
  const matrixControls = useDemandMatrixControls({
    groupingMode,
    enablePreferredStaffFiltering: true // Phase 1: Enable three-mode filtering
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
    preferredStaffFilterMode: matrixControls.preferredStaffFilterMode // Phase 1: Three-mode support
  });

  /**
   * Run Phase 1 validation
   */
  const runPhase1Validation = async () => {
    setIsValidating(true);
    try {
      console.log('🚀 [PHASE 1 UI] Running Phase 1 validation...');
      const report = await Phase1ValidationService.runPhase1Validation();
      setValidationReport(report);
      setShowValidationDetails(true);
      
      if (report.overallSuccess) {
        console.log('✅ [PHASE 1 UI] Phase 1 validation passed!');
      } else {
        console.warn('⚠️ [PHASE 1 UI] Phase 1 validation failed:', report.summary);
      }
    } catch (error) {
      console.error('❌ [PHASE 1 UI] Phase 1 validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Auto-run validation on component mount
   */
  useEffect(() => {
    // Auto-run Phase 1 validation when component loads
    const timer = setTimeout(() => {
      runPhase1Validation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Phase 1: Validation Status Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Phase 1: Integration Verification & Data Pipeline Testing
                </h3>
                <p className="text-sm text-blue-700">
                  Validating data pipeline integrity and component integration
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

      {/* Existing Matrix Implementation - Preserved Exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
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
          />
        </div>

        {/* Matrix Display */}
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
