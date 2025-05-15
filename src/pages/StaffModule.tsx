import React from "react";
import { Routes, Route } from "react-router-dom";
import StaffList from "@/components/staff/StaffList";
import StaffDetail from "@/components/staff/StaffDetail";
import StaffForm from "@/components/staff/StaffForm";
import DailyPlanner from "@/components/staff/DailyPlanner";
import WeeklyAvailabilityMatrix from "@/components/staff/WeeklyAvailabilityMatrix";

// We're keeping this file unchanged, just including it to ensure we're not missing any context
const StaffModule: React.FC = () => {
  return (
    <Routes>
      <Route index element={<StaffList />} />
      <Route path="new" element={<StaffForm />} />
      <Route path=":id" element={<StaffDetail />} />
      <Route path=":id/edit" element={<StaffForm />} />
      <Route path=":id/schedule" element={<DailyPlanner />} />
      <Route path=":id/availability" element={<WeeklyAvailabilityMatrix />} />
    </Routes>
  );
};

export default StaffModule;
