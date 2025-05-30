
import React from 'react';
import { Settings, Printer } from 'lucide-react';
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButton } from '@/components/export';
import { ExportOptions } from '@/services/export/exportService';

interface TaskOverviewHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onOpenTaskManagement: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  onPrint: () => void;
  isExporting?: boolean;
  hasData?: boolean;
}

/**
 * Header component for the Client Assigned Tasks Overview
 * Contains the title, description, manage tasks button, export/print controls, and tab navigation
 */
export const TaskOverviewHeader: React.FC<TaskOverviewHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenTaskManagement,
  onExport,
  onPrint,
  isExporting = false,
  hasData = true
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Client-Assigned Tasks Overview</CardTitle>
            <CardDescription>View and manage all client tasks across your practice</CardDescription>
          </div>
          <div className="mt-2 md:mt-0 flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onPrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <ExportButton
              onExport={onExport}
              dataType="tasks"
              isLoading={isExporting}
              disabled={!hasData}
            />
            <Button 
              onClick={onOpenTaskManagement}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Tasks
            </Button>
          </div>
        </div>
        <div className="flex justify-center md:justify-start">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="adhoc">Ad-hoc</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </CardHeader>
  );
};
