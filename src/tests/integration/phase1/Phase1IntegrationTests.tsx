
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Play, Clock } from 'lucide-react';
import { PipelineValidator, type PipelineValidationResult } from '@/services/forecasting/demand/dataFetcher/integration/pipelineValidator';
import { ComponentIntegrationTester, type ComponentIntegrationResult } from '@/components/forecasting/matrix/hooks/useMatrixControls/integration/integrationTester';

/**
 * Phase 1 Integration Tests Component
 * 
 * Provides a comprehensive testing interface for Phase 1 validation
 */
export const Phase1IntegrationTests: React.FC = () => {
  const [pipelineResult, setPipelineResult] = useState<PipelineValidationResult | null>(null);
  const [componentResult, setComponentResult] = useState<ComponentIntegrationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    try {
      console.log('🚀 Running Phase 1 Integration Tests...');
      
      // Run pipeline validation
      const pipelineValidation = await PipelineValidator.validatePipeline();
      setPipelineResult(pipelineValidation);
      
      // Run component integration tests
      const mockData = { months: [], dataPoints: [] };
      const mockControls = { preferredStaffFilterMode: 'all' };
      const mockFiltering = { dataPoints: [] };
      
      const componentValidation = ComponentIntegrationTester.validateComponentIntegration(
        mockData,
        mockControls,
        mockFiltering
      );
      setComponentResult(componentValidation);
      
      console.log('✅ Phase 1 Integration Tests completed');
    } catch (error) {
      console.error('❌ Phase 1 Integration Tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Auto-run tests on mount
    const timer = setTimeout(runTests, 1000);
    return () => clearTimeout(timer);
  }, []);

  const overallSuccess = pipelineResult?.success && componentResult?.success;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Phase 1 Integration Tests</h3>
            <div className="flex items-center gap-2">
              {overallSuccess !== undefined && (
                <Badge variant={overallSuccess ? "default" : "destructive"}>
                  {overallSuccess ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {overallSuccess ? 'PASSED' : 'FAILED'}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={runTests}
                disabled={isRunning}
              >
                {isRunning ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Running...' : 'Run Tests'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Pipeline Validation Results */}
          {pipelineResult && (
            <div className="space-y-2">
              <h4 className="font-medium">Pipeline Validation</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-green-600">{pipelineResult.summary.totalTests}</div>
                  <div className="text-gray-600">Total Tests</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-green-600">{pipelineResult.summary.passedTests}</div>
                  <div className="text-gray-600">Passed</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-red-600">{pipelineResult.summary.failedTests}</div>
                  <div className="text-gray-600">Failed</div>
                </div>
              </div>
            </div>
          )}

          {/* Component Integration Results */}
          {componentResult && (
            <div className="space-y-2">
              <h4 className="font-medium">Component Integration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-blue-600">
                    {componentResult.success ? 'PASSED' : 'FAILED'}
                  </div>
                  <div className="text-gray-600">Overall Status</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-yellow-600">{componentResult.errors.length}</div>
                  <div className="text-gray-600">Errors</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase1IntegrationTests;
