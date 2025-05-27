
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffLiaisonReport from "@/components/reporting/StaffLiaisonReport";
import StaffReport from "@/components/reporting/StaffReport";

const ReportsModule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive reporting and analytics for your practice
        </p>
      </div>

      <Tabs defaultValue="staff-liaison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff-liaison">Staff Liaison Revenue</TabsTrigger>
          <TabsTrigger value="staff-skills">Staff Skills & Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="staff-liaison" className="space-y-4">
          <StaffLiaisonReport />
        </TabsContent>

        <TabsContent value="staff-skills" className="space-y-4">
          <StaffReport />
        </TabsContent>
      </Tabs>

      <Routes>
        <Route path="/" element={<Navigate to="/reports" replace />} />
      </Routes>
    </div>
  );
};

export default ReportsModule;
