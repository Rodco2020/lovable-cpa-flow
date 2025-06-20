
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Play, RefreshCw } from 'lucide-react';
import { Phase1ValidationService, type Phase1ValidationReport } from '@/services/forecasting/matrix/phase1ValidationService';

/**
 * Phase 1 Test Runner Component
 * 
 * Interactive component for running and displaying Phase 1 validation results
 */
export const Phase1TestRunner: React.FC = () => {
  const [validationReport, setValidationReport] = useState<Phase1ValidationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runValidation = useCallback(async () => {
    setIsRunning(true);
    try {
      console.log('🚀 [PHASE 1 TEST RUNNER] Starting validation...');
      const report = await Phase1ValidationService.runPhase1Validation();
      setValidationReport(report);
      setShowDetails(true);
    } catch (error) {
      console.error('❌ [PHASE 1 TEST RUNNER] Validation failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const resetValidation = useCallback(() => {
    setValidationReport(null);
    setShowDetails(false);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Phase 1 Validation Test Runner
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {validationReport && (
                <Badge variant={validationReport.overallSuccess ? "default" : "destructive"}>
                  {validationReport.overallSuccess ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {validationReport.overallSuccess ? 'PASSED' : 'FAILED'}
                </Badge>
              )}
              
              <Button
                onClick={runValidation}
                disabled={isRunning}
                size="sm"
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? 'Running...' : 'Run Validation'}
              </Button>
              
              {validationReport && (
                <Button
                  onClick={resetValidation}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Validation Summary */}
          {validationReport && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Validation Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {validationReport.summary.passedTests}
                  </div>
                  <div className="text-sm text-green-700">Tests Passed</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {validationReport.summary.failedTests}
                  </div>
                  <div className="text-sm text-red-700">Tests Failed</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationReport.summary.warningsCount}
                  </div>
                  <div className="text-sm text-yellow-700">Warnings</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {validationReport.duration}ms
                  </div>
                  <div className="text-sm text-blue-700">Duration</div>
                </div>
              </div>

              {/* Details Toggle */}
              <Button
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>

              {/* Detailed Results */}
              {showDetails && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Validation Details</h4>
                    <div className="space-y-1 text-sm">
                      {validationReport.details.map((detail, index) => (
                        <div key={index} className="font-mono">
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Report */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Full Report</h4>
                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                      {Phase1ValidationService.generateReportSummary(validationReport)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          {!validationReport && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Click "Run Validation" to start Phase 1 validation tests
              </div>
              <div className="text-sm text-gray-400">
                This will validate component integration, data pipeline, and hook functionality
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase1TestRunner;
