
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import SchedulerDashboard from "@/components/scheduler/SchedulerDashboard";
import SchedulerDocumentation from "@/components/scheduler/SchedulerDocumentation";
import KeyboardShortcutHelp from "@/components/scheduler/KeyboardShortcutHelp";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SchedulerModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  return (
    <div className="container mx-auto py-4 space-y-4">
      <div className="flex justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="dashboard">Scheduler</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <KeyboardShortcutHelp 
                isOpen={showKeyboardHelp}
                onOpenChange={setShowKeyboardHelp}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveTab("documentation")}
                aria-label="Help Documentation"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      {activeTab === "dashboard" ? (
        <Routes>
          <Route index element={<SchedulerDashboard />} />
        </Routes>
      ) : (
        <SchedulerDocumentation />
      )}
    </div>
  );
};

export default SchedulerModule;
