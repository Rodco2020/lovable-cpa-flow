
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Database, Loader2 } from 'lucide-react';
import { EnhancedDataService } from '@/services/forecasting/demand/dataFetcher/enhancedDataService';

interface DiagnosticInfo {
  databaseConnection: boolean;
  tableData: { [table: string]: number };
  sampleData: any;
}

/**
 * Demand Data Diagnostics Component
 * 
 * This component helps diagnose issues with demand data availability
 * by showing database connectivity, table row counts, and sample data.
 */
export const DemandDataDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const info = await EnhancedDataService.generateDebugInfo();
      setDiagnostics(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusBadge = (isGood: boolean, label: string) => (
    <Badge variant={isGood ? "default" : "destructive"} className="flex items-center gap-1">
      {isGood ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {label}
    </Badge>
  );

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Database Connection:</span>
          {diagnostics ? (
            getStatusBadge(diagnostics.databaseConnection, diagnostics.databaseConnection ? 'Connected' : 'Failed')
          ) : (
            <Badge variant="secondary">Testing...</Badge>
          )}
        </div>

        {diagnostics && (
          <>
            <div className="space-y-2">
              <h4 className="font-medium">Table Row Counts:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(diagnostics.tableData).map(([table, count]) => (
                  <div key={table} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="capitalize">{table}:</span>
                    {getStatusBadge(count > 0, `${count} rows`)}
                  </div>
                ))}
              </div>
            </div>

            {diagnostics.sampleData && (
              <div className="space-y-2">
                <h4 className="font-medium">Sample Data:</h4>
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <div>Sample Clients: {diagnostics.sampleData.clients?.length || 0}</div>
                  <div>Sample Tasks: {diagnostics.sampleData.tasks?.length || 0}</div>
                  {diagnostics.sampleData.clients?.[0] && (
                    <div className="mt-2 text-xs text-gray-600">
                      First client: {diagnostics.sampleData.clients[0].legal_name}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              Error: {error}
            </div>
          </div>
        )}

        <Button 
          onClick={runDiagnostics} 
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics Again'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
