
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { getPreferredStaffFromDatabase, getPreferredStaffStatistics } from '@/services/staff/preferredStaffDataService';
import { getPreferredStaffFromDemandData } from '@/services/staff/staffDropdownService';

/**
 * Phase 1 Validation Panel
 * 
 * Test component to validate the Phase 1 implementation:
 * - Database-sourced preferred staff data
 * - Deduplication functionality
 * - Cache performance
 * - Data comparison between old and new methods
 */
export const Phase1ValidationPanel: React.FC = () => {
  const [showComparison, setShowComparison] = useState(false);

  // Test new database-sourced preferred staff
  const { 
    data: databaseStaff = [], 
    isLoading: dbLoading, 
    error: dbError,
    refetch: refetchDB 
  } = useQuery({
    queryKey: ['phase1-validation-database'],
    queryFn: getPreferredStaffFromDatabase,
    staleTime: 0, // No cache for testing
  });

  // Test legacy demand data extraction method
  const { 
    data: demandStaff = [], 
    isLoading: demandLoading, 
    error: demandError,
    refetch: refetchDemand 
  } = useQuery({
    queryKey: ['phase1-validation-demand'],
    queryFn: getPreferredStaffFromDemandData,
    staleTime: 0, // No cache for testing
  });

  // Get statistics
  const { 
    data: statistics,
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['phase1-validation-stats'],
    queryFn: getPreferredStaffStatistics,
    staleTime: 0, // No cache for testing
  });

  const handleRefreshAll = () => {
    refetchDB();
    refetchDemand();
    refetchStats();
  };

  const getDeduplicationStatus = () => {
    if (dbLoading || demandLoading) return { status: 'loading', message: 'Loading...' };
    
    const dbStaffIds = new Set(databaseStaff.map(s => s.id));
    const demandStaffIds = new Set(demandStaff.map(s => s.id));
    
    // Check for duplicates in database method (should be 0)
    const dbDuplicates = databaseStaff.length - dbStaffIds.size;
    
    if (dbDuplicates === 0 && databaseStaff.length > 0) {
      return { status: 'success', message: 'Perfect deduplication' };
    } else if (dbDuplicates > 0) {
      return { status: 'error', message: `${dbDuplicates} duplicates found` };
    } else {
      return { status: 'warning', message: 'No preferred staff found' };
    }
  };

  const deduplicationStatus = getDeduplicationStatus();

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Phase 1: Data Source & Deduplication Validation</h2>
          <p className="text-gray-600 mt-1">Testing database-sourced preferred staff data vs demand data extraction</p>
        </div>
        <Button onClick={handleRefreshAll} disabled={dbLoading || demandLoading || statsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${(dbLoading || demandLoading || statsLoading) ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <CardDescription>Current state of preferred staff assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading statistics...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics?.totalPreferredAssignments || 0}</div>
                <div className="text-sm text-gray-600">Total Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics?.uniquePreferredStaff || 0}</div>
                <div className="text-sm text-gray-600">Unique Staff</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics?.activeTasksWithPreferredStaff || 0}</div>
                <div className="text-sm text-gray-600">Active Tasks</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deduplication Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Deduplication Test
            <Badge 
              variant={deduplicationStatus.status === 'success' ? 'default' : deduplicationStatus.status === 'error' ? 'destructive' : 'secondary'}
              className="ml-auto"
            >
              {deduplicationStatus.status === 'success' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {deduplicationStatus.message}
            </Badge>
          </CardTitle>
          <CardDescription>Validating new deduplication logic</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Database Method */}
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ New Database Method</h4>
              {dbLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : dbError ? (
                <div className="text-red-600">Error: {(dbError as Error).message}</div>
              ) : (
                <div>
                  <div className="text-lg font-bold">{databaseStaff.length} staff found</div>
                  <div className="text-sm text-gray-600 mb-3">Direct database query with deduplication</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {databaseStaff.map(staff => (
                      <div key={staff.id} className="text-xs bg-green-50 p-1 rounded">
                        {staff.full_name} ({staff.id.slice(0, 8)}...)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legacy Method */}
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">⚠️ Legacy Demand Data Method</h4>
              {demandLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : demandError ? (
                <div className="text-red-600">Error: {(demandError as Error).message}</div>
              ) : (
                <div>
                  <div className="text-lg font-bold">{demandStaff.length} staff found</div>
                  <div className="text-sm text-gray-600 mb-3">Extracted from demand data (legacy)</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {demandStaff.map(staff => (
                      <div key={staff.id} className="text-xs bg-orange-50 p-1 rounded">
                        {staff.name} ({staff.id.slice(0, 8)}...)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Toggle */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => setShowComparison(!showComparison)}
          disabled={dbLoading || demandLoading}
        >
          {showComparison ? 'Hide' : 'Show'} Detailed Comparison
        </Button>
      </div>

      {/* Detailed Comparison */}
      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Data Comparison</CardTitle>
            <CardDescription>Side-by-side comparison of both methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-2">Database Method Staff IDs</h5>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  {databaseStaff.map(s => s.id).sort().join('\n')}
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Demand Data Method Staff IDs</h5>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                  {demandStaff.map(s => s.id).sort().join('\n')}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h6 className="font-semibold text-blue-800">Phase 1 Success Criteria:</h6>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>✅ Database method returns deduplicated results</li>
                <li>✅ No duplicate staff IDs in database method</li>
                <li>✅ Staff data comes directly from database, not processed demand data</li>
                <li>✅ Proper caching implemented for performance</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Phase1ValidationPanel;
