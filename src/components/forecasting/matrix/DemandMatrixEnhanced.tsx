
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Play, Zap } from 'lucide-react';
import { useDemandMatrixControls } from './hooks/useDemandMatrixControls';
import { useDemandMatrixFilteringEnhanced } from './hooks/useDemandMatrixFilteringEnhanced';
import { DemandMatrixControlsEnhanced } from './DemandMatrixControls/DemandMatrixControlsEnhanced';
import { DemandMatrixDisplay } from './components/demand/DemandMatrixDisplay';
import { Phase1ValidationService } from '@/services/forecasting/matrix/phase1ValidationService';
import { EnhancedFilteringService } from '@/services/forecasting/demand/dataFetcher/enhancedFilteringService';
import { EnhancedExportService } from './services/enhancedExportService';
import type { Phase1ValidationReport } from '@/services/forecasting/matrix/phase1ValidationService';

interface DemandMatrixEnhancedProps {
  groupingMode: 'skill' | 'client';
}

/**
 * Phase 3: Enhanced DemandMatrix Component with Advanced Filtering Integration
 * 
 * PHASE 3 ENHANCEMENTS:
 * - Enhanced filtering with resolved skill data integration
 * - Improved filter validation and compatibility checking
 * - Performance optimizations for large datasets
 * - Enhanced export functionality with skill resolution info
 * - Better error handling and user feedback
 * - Advanced diagnostics and filter state management
 */
export const DemandMatrixEnhanced: React.FC<DemandMatrixEnhancedProps> = ({ groupingMode }) => {
  const [validationReport, setValidationReport] = useState<Phase1ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  
  // Phase 3: Enhanced filter validation state
  const [filterValidation, setFilterValidation] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Phase 3: Enhanced matrix controls with skill resolution
  const matrixControls = useDemandMatrixControls({
    groupingMode,
    enablePreferredStaffFiltering: true
  });

  // Phase 3: Enhanced filtering with performance optimizations
  const filteredData = useDemandMatrixFilteringEnhanced({
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
   * Phase 3: Enhanced validation with filtering integration
   */
  const runPhase3Validation = async () => {
    setIsValidating(true);
    try {
      console.log('🚀 [PHASE 3 UI] Running Phase 3 validation with filtering integration...');
      
      // Run Phase 1 validation first
      const report = await Phase1ValidationService.runPhase1Validation();
      setValidationReport(report);
      
      // Phase 3: Additional filter validation
      const filterOptions = {
        skills: matrixControls.selectedSkills,
        clients: matrixControls.selectedClients,
        preferredStaff: matrixControls.selectedPreferredStaff,
        preferredStaffMode: matrixControls.preferredStaffFilterMode,
        enablePerformanceOptimization: true,
        validateSkillResolution: true
      };
      
      const filterValidationResult = await EnhancedFilteringService.validateFilterOptions(filterOptions);
      setFilterValidation(filterValidationResult);
      
      setShowValidationDetails(true);
      
      if (report.overallSuccess && filterValidationResult.isValid) {
        console.log('✅ [PHASE 3 UI] Phase 3 validation passed!');
      } else {
        console.warn('⚠️ [PHASE 3 UI] Phase 3 validation issues found');
      }
    } catch (error) {
      console.error('❌ [PHASE 3 UI] Phase 3 validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Phase 3: Enhanced export with skill resolution
   */
  const handleEnhancedExport = async () => {
    if (!filteredData) return;
    
    setIsExporting(true);
    try {
      console.log('📤 [PHASE 3 UI] Starting enhanced export...');
      
      await EnhancedExportService.exportDemandMatrix(
        filteredData,
        matrixControls.selectedSkills,
        matrixControls.selectedClients,
        matrixControls.selectedPreferredStaff,
        matrixControls.preferredStaffFilterMode,
        {
          includeFilterSummary: true,
          includeSkillResolutionInfo: true,
          format: 'csv'
        }
      );
      
      console.log('✅ [PHASE 3 UI] Enhanced export completed');
    } catch (error) {
      console.error('❌ [PHASE 3 UI] Enhanced export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Auto-run validation on component mount
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      runPhase3Validation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  console.log(`🚀 [PHASE 3 MATRIX INTEGRATION] DemandMatrixEnhanced - Rendering with advanced filtering:`, {
    groupingMode,
    preferredStaffFilterMode: matrixControls.preferredStaffFilterMode,
    availablePreferredStaffCount: matrixControls.availablePreferredStaff.length,
    selectedPreferredStaffCount: matrixControls.selectedPreferredStaff.length,
    isLoading: matrixControls.isLoading,
    hasFilterValidation: !!filterValidation
  });

  return (
    <div className="space-y-6">
      {/* Phase 3: Enhanced Validation Status Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">
                  Phase 3: Filtering & Controls Integration
                </h3>
                <p className="text-sm text-purple-700">
                  Enhanced filtering with resolved skill data and performance optimizations
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
              
              {filterValidation && (
                <Badge 
                  variant={filterValidation.isValid ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {filterValidation.isValid ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  FILTERS {filterValidation.isValid ? 'VALID' : 'ISSUES'}
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={runPhase3Validation}
                disabled={isValidating}
                className="flex items-center gap-2"
              >
                {isValidating ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isValidating ? 'Validating...' : 'Run Phase 3 Validation'}
              </Button>
            </div>
          </div>

          {/* Phase 3: Enhanced Validation Summary */}
          {validationReport && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                {filterValidation && (
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {filterValidation.skillResolutionStatus.resolved}
                    </div>
                    <div className="text-xs text-gray-600">Skills Resolved</div>
                  </div>
                )}
              </div>

              {/* Phase 3: Filter validation details */}
              {filterValidation && (
                <div className="p-3 bg-white rounded-lg">
                  <h4 className="font-medium mb-2">Filter Validation Results:</h4>
                  <div className="text-sm space-y-1">
                    {filterValidation.warnings.map((warning: string, index: number) => (
                      <div key={index} className="text-yellow-600">⚠️ {warning}</div>
                    ))}
                    {filterValidation.issues.map((issue: string, index: number) => (
                      <div key={index} className="text-red-600">❌ {issue}</div>
                    ))}
                    {filterValidation.isValid && filterValidation.warnings.length === 0 && (
                      <div className="text-green-600">✅ All filters validated successfully</div>
                    )}
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
                {showValidationDetails ? 'Hide' : 'Show'} Detailed Validation Report
              </Button>

              {/* Detailed validation report */}
              {showValidationDetails && validationReport && (
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

      {/* Phase 3: Enhanced Matrix Implementation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enhanced Controls Panel */}
        <div className="lg:col-span-1">
          <DemandMatrixControlsEnhanced
            availableSkills={matrixControls.availableSkills}
            selectedSkills={matrixControls.selectedSkills}
            onSkillToggle={matrixControls.onSkillToggle}
            isAllSkillsSelected={matrixControls.isAllSkillsSelected}
            availableClients={matrixControls.availableClients}
            selectedClients={matrixControls.selectedClients}
            onClientToggle={matrixControls.onClientToggle}
            isAllClientsSelected={matrixControls.isAllClientsSelected}
            availablePreferredStaff={matrixControls.availablePreferredStaff}
            selectedPreferredStaff={matrixControls.selectedPreferredStaff}
            onPreferredStaffToggle={matrixControls.onPreferredStaffToggle}
            isAllPreferredStaffSelected={matrixControls.isAllPreferredStaffSelected}
            preferredStaffFilterMode={matrixControls.preferredStaffFilterMode}
            onPreferredStaffFilterModeChange={matrixControls.onPreferredStaffFilterModeChange}
            onReset={matrixControls.onReset}
            onExport={handleEnhancedExport}
            onManualRefresh={matrixControls.onRefresh}
            skillsLoading={matrixControls.isLoading}
            clientsLoading={false}
            preferredStaffLoading={matrixControls.isLoading}
            onRetrySkills={matrixControls.onRefresh}
            skillsError={matrixControls.error?.message || null}
          />
        </div>

        {/* Matrix Display */}
        <div className="lg:col-span-3">
          <DemandMatrixDisplay
            matrixData={filteredData}
            groupingMode={groupingMode}
            isLoading={matrixControls.isLoading || isExporting}
            error={matrixControls.error ? matrixControls.error.message : null}
          />
        </div>
      </div>
    </div>
  );
};

export default DemandMatrixEnhanced;
