
import React from "react";
import { Routes, Route } from "react-router-dom";
import SchedulerDashboard from "@/components/scheduler/SchedulerDashboard";

const SchedulerModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<SchedulerDashboard />} />
    </Routes>
  );
};

export default SchedulerModule;
