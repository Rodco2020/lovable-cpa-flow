
import React from 'react';
import { Settings } from 'lucide-react';
import { 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TaskOverviewHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onOpenTaskManagement: () => void;
}

/**
 * Header component for the Client Assigned Tasks Overview
 * Contains the title, description, manage tasks button, and tab navigation
 */
export const TaskOverviewHeader: React.FC<TaskOverviewHeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenTaskManagement
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Client-Assigned Tasks Overview</CardTitle>
          <CardDescription>View and manage all client tasks across your practice</CardDescription>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-3">
          <Button 
            onClick={onOpenTaskManagement}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Tasks
          </Button>
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
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
