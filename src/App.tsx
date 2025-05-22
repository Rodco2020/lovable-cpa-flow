
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/auth/PrivateRoute";
import DashboardModule from "./pages/DashboardModule";
import ClientModule from "./pages/ClientModule";
import SkillsModule from "./pages/SkillsModule";
import StaffModule from "./pages/StaffModule";
import TaskModule from "./pages/TaskModule";
import SchedulerModule from "./pages/SchedulerModule";
import ForecastingModule from "./pages/ForecastingModule";
import StaffReportPage from "./pages/reports/StaffReportPage";
// Import the TooltipProvider
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });

  return (
    <TooltipProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardModule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/clients/*"
                  element={
                    <PrivateRoute>
                      <ClientModule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/skills"
                  element={
                    <PrivateRoute>
                      <SkillsModule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/staff"
                  element={
                    <PrivateRoute>
                      <StaffModule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <PrivateRoute>
                      <TaskModule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/scheduler"
                  element={
                    <PrivateRoute>
                      <SchedulerModule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/forecasting"
                  element={
                    <PrivateRoute>
                      <ForecastingModule />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reports/staff"
                  element={
                    <PrivateRoute>
                      <StaffReportPage />
                    </PrivateRoute>
                  }
                />
              </Route>
              <Route path="/auth/*" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
