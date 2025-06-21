
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TestTube, Loader2, Database } from 'lucide-react';
import { SkillResolutionTestingService, ValidationReport } from '@/services/forecasting/demand/skillResolution/testingService';

/**
 * Skill Resolution Diagnostics Component
 * 
 * This component provides comprehensive testing and validation for the skill resolution system.
 * It's used to ensure Phase 1 implementation is working correctly.
 */
export const SkillResolutionDiagnostics: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      const validationReport = await SkillResolutionTestingService.runValidationTests();
      setReport(validationReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (passed: boolean, label: string) => (
    <Badge variant={passed ? "default" : "destructive"} className="flex items-center gap-1">
      {passed ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {label}
    </Badge>
  );

  const getTestStatusBadge = (passed: boolean) => (
    <Badge variant={passed ? "default" : "destructive"}>
      {passed ? "PASS" : "FAIL"}
    </Badge>
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Skill Resolution Diagnostics (Phase 1)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        {report && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Overall System Status:</span>
            {getStatusBadge(report.passed, report.passed ? 'All Tests Passed' : 'Tests Failed')}
          </div>
        )}

        {/* Test Summary */}
        {report && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-800">{report.totalTests}</div>
              <div className="text-blue-600">Total Tests</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-800">{report.passedTests}</div>
              <div className="text-green-600">Passed</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-bold text-red-800">{report.failedTests}</div>
              <div className="text-red-600">Failed</div>
            </div>
          </div>
        )}

        {/* Individual Test Results */}
        {report && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {report.results.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <span className="font-medium">{result.testName}</span>
                  <span className="text-sm text-gray-600 ml-2">({result.duration}ms)</span>
                </div>
                {getTestStatusBadge(result.passed)}
              </div>
            ))}
          </div>
        )}

        {/* Detailed Results */}
        {report && (
          <div className="space-y-2">
            <h4 className="font-medium">Phase 1 Success Criteria:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-center">
                <span>✓ Skill resolution service maps UUIDs to names</span>
                {getTestStatusBadge(report.summary.uuidResolutionTest)}
              </div>
              <div className="flex justify-between items-center">
                <span>✓ No data loss during mapping process</span>
                {getTestStatusBadge(report.summary.dataIntegrityTest)}
              </div>
              <div className="flex justify-between items-center">
                <span>✓ Performance benchmarks meet requirements</span>
                {getTestStatusBadge(report.summary.performanceTest)}
              </div>
              <div className="flex justify-between items-center">
                <span>✓ Skill cache initialization works correctly</span>
                {getTestStatusBadge(report.summary.skillCacheTest)}
              </div>
              <div className="flex justify-between items-center">
                <span>✓ Name validation functions properly</span>
                {getTestStatusBadge(report.summary.nameValidationTest)}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              Error: {error}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Phase 1 Validation...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Run Phase 1 Diagnostics
            </>
          )}
        </Button>

        {/* Integration Note */}
        <div className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
          <Database className="h-3 w-3 inline mr-1" />
          Phase 1 establishes the foundation for UUID-to-name skill resolution. 
          All tests must pass before proceeding to Phase 2.
        </div>
      </CardContent>
    </Card>
  );
};
