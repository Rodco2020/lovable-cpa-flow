
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import Auth from "@/pages/Auth";
import ClientModule from "@/pages/ClientModule";
import StaffModule from "@/pages/StaffModule";
import SkillsModule from "@/pages/SkillsModule";
import TaskModule from "@/pages/TaskModule";
import SchedulerModule from "@/pages/SchedulerModule";
import ForecastingModule from "@/pages/ForecastingModule";
import DashboardModule from "@/pages/DashboardModule";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import StaffReportPage from "@/pages/StaffReportPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/*" element={<Auth />} />
              <Route path="/clients/*" element={<ClientModule />} />
              <Route path="/staff/*" element={<StaffModule />} />
              <Route path="/skills/*" element={<SkillsModule />} />
              <Route path="/tasks/*" element={<TaskModule />} />
              <Route path="/scheduler/*" element={<SchedulerModule />} />
              <Route path="/forecasting/*" element={<ForecastingModule />} />
              <Route path="/dashboard/*" element={<DashboardModule />} />
              {/* Staff report route */}
              <Route path="/reports/staff" element={<StaffReportPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
