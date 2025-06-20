
/**
 * Phase 1: Test Runner Component
 * 
 * Simple component to run and display Phase 1 validation results
 * for demonstration and debugging purposes
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Play, FileText } from 'lucide-react';
import { Phase1ValidationService } from '@/services/forecasting/matrix/phase1ValidationService';
import type { Phase1ValidationReport } from '@/services/forecasting/matrix/phase1ValidationService';

/**
 * Phase 1 Test Runner Component
 * Provides a dedicated interface for running and viewing Phase 1 validation results
 */
export const Phase1TestRunner: React.FC = () => {
  const [validationReport, setValidationReport] = useState<Phase1ValidationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  /**
   * Execute Phase 1 validation tests
   */
  const runValidation = async () => {
    setIsRunning(true);
    setValidationReport(null);
    
    try {
      console.log('🚀 [PHASE 1 TEST RUNNER] Starting Phase 1 validation...');
      const report = await Phase1ValidationService.runPhase1Validation();
      setValidationReport(report);
      
      console.log('📋 [PHASE 1 TEST RUNNER] Validation completed:', {
        success: report.overallSuccess,
        duration: report.duration,
        summary: report.summary
      });
      
    } catch (error) {
      console.error('❌ [PHASE 1 TEST RUNNER] Validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Phase 1: Integration Verification & Data Pipeline Testing
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive validation of data pipeline integrity and component integration
        </p>
      </div>

      {/* Test Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Validation Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Phase 1 Validation Suite</p>
              <p className="text-sm text-gray-600">
                Tests data pipeline, component integration, and backward compatibility
              </p>
            </div>
            
            <Button
              onClick={runValidation}
              disabled={isRunning}
              size="lg"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Running Validation...' : 'Run Phase 1 Validation'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationReport && (
        <Card className={validationReport.overallSuccess ? 'border-green-200' : 'border-red-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationReport.overallSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Validation Results
              <Badge 
                variant={validationReport.overallSuccess ? "default" : "destructive"}
                className="ml-2"
              >
                {validationReport.overallSuccess ? 'PASSED' : 'FAILED'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {validationReport.summary.totalTests}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validationReport.summary.passedTests}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validationReport.summary.failedTests}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationReport.summary.warningsCount}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {validationReport.duration}ms
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>

            {/* Quick Status Overview */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">Validation Categories</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Data Pipeline */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {validationReport.pipelineValidation.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">Data Pipeline</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Preferred Staff: {validationReport.pipelineValidation.dataIntegrity?.preferredStaffDataLoaded ? '✅' : '❌'}</div>
                    <div>Recurring Tasks: {validationReport.pipelineValidation.dataIntegrity?.recurringTasksLoaded ? '✅' : '❌'}</div>
                    <div>Clients: {validationReport.pipelineValidation.dataIntegrity?.clientsLoaded ? '✅' : '❌'}</div>
                    <div>Skills: {validationReport.pipelineValidation.dataIntegrity?.skillsLoaded ? '✅' : '❌'}</div>
                  </div>
                </div>

                {/* Filtering Logic */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {validationReport.pipelineValidation.filteringLogic?.allModeWorking &&
                     validationReport.pipelineValidation.filteringLogic?.specificModeWorking &&
                     validationReport.pipelineValidation.filteringLogic?.noneModeWorking ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">Filtering Logic</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>All Mode: {validationReport.pipelineValidation.filteringLogic?.allModeWorking ? '✅' : '❌'}</div>
                    <div>Specific Mode: {validationReport.pipelineValidation.filteringLogic?.specificModeWorking ? '✅' : '❌'}</div>
                    <div>None Mode: {validationReport.pipelineValidation.filteringLogic?.noneModeWorking ? '✅' : '❌'}</div>
                  </div>
                </div>

                {/* Component Integration */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {validationReport.componentIntegration.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">Component Integration</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Three-Mode State: {validationReport.componentIntegration.matrixControlsIntegration?.threeModeStateManagement ? '✅' : '❌'}</div>
                    <div>Parameter Passing: {validationReport.componentIntegration.matrixControlsIntegration?.parameterPassing ? '✅' : '❌'}</div>
                    <div>Data Flow: {validationReport.componentIntegration.dataFlowValidation?.controlsToFilteringFlow ? '✅' : '❌'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {validationReport.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Recommendations</h3>
                <ul className="space-y-1">
                  {validationReport.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {validationReport.nextSteps.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="font-semibold">Next Steps</h3>
                <ul className="space-y-1">
                  {validationReport.nextSteps.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Report Toggle */}
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowFullReport(!showFullReport)}
                className="w-full"
              >
                {showFullReport ? 'Hide' : 'Show'} Full Technical Report
              </Button>
              
              {showFullReport && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-gray-800">
                    {Phase1ValidationService.generateReportSummary(validationReport)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 1 Information */}
      <Card>
        <CardHeader>
          <CardTitle>Phase 1 Validation Scope</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Data Pipeline Integrity</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Preferred staff data loading from database</li>
                <li>• Recurring tasks data validation</li>
                <li>• Client and skills data integrity</li>
                <li>• Three-mode filtering logic verification</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Component Integration Testing</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Matrix controls and filtering hook integration</li>
                <li>• Three-mode state management validation</li>
                <li>• Parameter passing verification</li>
                <li>• Data flow consistency checks</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Backward Compatibility</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Existing filter functionality preservation</li>
                <li>• Export functionality integrity</li>
                <li>• Matrix data consistency maintenance</li>
                <li>• UI component stability verification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase1TestRunner;
