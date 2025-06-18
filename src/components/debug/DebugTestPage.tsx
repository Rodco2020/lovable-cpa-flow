
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemVerificationPanel from './SystemVerificationPanel';
import PreferredStaffDebugPanel from './PreferredStaffDebugPanel';
import { TestTube, Database, Bug, FileText } from 'lucide-react';

const DebugTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-6 w-6" />
            Preferred Staff Feature - Debug & Testing Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comprehensive testing and debugging tools for the Preferred Staff Member feature.
            Use these tools to verify functionality, diagnose issues, and validate fixes.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="phase1" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phase1" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Phase 1 Testing
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Tests
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Workflow Tests
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Legacy Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phase1" className="mt-6">
          <SystemVerificationPanel />
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Direct Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <PreferredStaffDebugPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>End-to-End Workflow Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Complete workflow testing tools will be implemented in subsequent phases.
                This will include form interaction testing, service layer validation, and integration testing.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Coming in Phase 2-5:</strong> Form integration tests, service layer validation, 
                  UI interaction testing, and complete workflow verification.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Legacy Debug Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Original debug panel for direct database testing and troubleshooting.
              </p>
              <PreferredStaffDebugPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebugTestPage;
