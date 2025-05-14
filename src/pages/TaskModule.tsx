
import React, { useState } from 'react';
import TaskTemplateList from '@/components/tasks/TaskTemplateList';
import UnscheduledTaskList from '@/components/tasks/UnscheduledTaskList';
import TaskGenerator from '@/components/tasks/TaskGenerator';
import CreateClientTask from '@/components/tasks/CreateClientTask';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListCheck, Clipboard, Calendar } from 'lucide-react';

const TaskModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("templates");
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Task Module</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Clipboard className="h-6 w-6 text-purple-800" />
          </div>
          <h3 className="font-medium">Task Templates</h3>
          <p className="text-sm text-gray-500">Define and manage standardized tasks</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setActiveTab("templates")}
          >
            Manage Templates
          </Button>
        </Card>
        
        <Card className="p-4 flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-800" />
          </div>
          <h3 className="font-medium">Client Tasks</h3>
          <p className="text-sm text-gray-500">Assign tasks to clients as one-time or recurring</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setActiveTab("create")}
          >
            Create Tasks
          </Button>
        </Card>
        
        <Card className="p-4 flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <ListCheck className="h-6 w-6 text-green-800" />
          </div>
          <h3 className="font-medium">Unscheduled Tasks</h3>
          <p className="text-sm text-gray-500">View and manage tasks awaiting scheduling</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setActiveTab("unscheduled")}
          >
            View Tasks
          </Button>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Task Templates</TabsTrigger>
          <TabsTrigger value="create">Create Tasks</TabsTrigger>
          <TabsTrigger value="unscheduled">Unscheduled Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <TaskTemplateList />
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <CreateClientTask />
          <TaskGenerator />
        </TabsContent>
        
        <TabsContent value="unscheduled" className="space-y-4">
          <UnscheduledTaskList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskModule;
