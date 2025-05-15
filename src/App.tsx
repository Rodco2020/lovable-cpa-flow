
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import PageShell from "@/components/layout/PageShell";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskModule from "./pages/TaskModule";
import ClientModule from "./pages/ClientModule";
import StaffModule from "./pages/StaffModule";
import SkillsModule from "./pages/SkillsModule";
import SchedulerModule from "./pages/SchedulerModule";
import ForecastingModule from "./pages/ForecastingModule";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/auth/*" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <PrivateRoute>
                <PageShell>
                  <Index />
                </PageShell>
              </PrivateRoute>
            } />
            <Route path="/tasks/*" element={
              <PrivateRoute>
                <PageShell>
                  <TaskModule />
                </PageShell>
              </PrivateRoute>
            } />
            <Route path="/clients/*" element={
              <PrivateRoute>
                <PageShell>
                  <ClientModule />
                </PageShell>
              </PrivateRoute>
            } />
            <Route path="/staff/*" element={
              <PrivateRoute>
                <PageShell>
                  <StaffModule />
                </PageShell>
              </PrivateRoute>
            } />
            <Route path="/skills/*" element={
              <PrivateRoute>
                <PageShell>
                  <SkillsModule />
                </PageShell>
              </PrivateRoute>
            } />
            <Route path="/scheduler/*" element={
              <PrivateRoute>
                <PageShell>
                  <SchedulerModule />
                </PageShell>
              </PrivateRoute>
            } />
            <Route path="/forecasting/*" element={
              <PrivateRoute>
                <PageShell>
                  <ForecastingModule />
                </PageShell>
              </PrivateRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
