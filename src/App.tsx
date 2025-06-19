
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import PrivateRoute from '@/components/auth/PrivateRoute';
import MainLayout from '@/layouts/MainLayout';

// Page imports
import Index from '@/pages/Index';
import DashboardModule from '@/pages/DashboardModule';
import ClientModule from '@/pages/ClientModule';
import TaskModule from '@/pages/TaskModule';
import StaffModule from '@/pages/StaffModule';
import SkillsModule from '@/pages/SkillsModule';
import SchedulerModule from '@/pages/SchedulerModule';
import ForecastingModule from '@/pages/ForecastingModule';
import ReportsModule from '@/pages/ReportsModule';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  console.log('🚀 [App] Application initializing');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public auth routes */}
            <Route path="/auth/*" element={<Auth />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<DashboardModule />} />
              <Route path="clients/*" element={<ClientModule />} />
              <Route path="tasks/*" element={<TaskModule />} />
              <Route path="staff/*" element={<StaffModule />} />
              <Route path="skills/*" element={<SkillsModule />} />
              <Route path="scheduler/*" element={<SchedulerModule />} />
              <Route path="forecasting/*" element={<ForecastingModule />} />
              <Route path="reports/*" element={<ReportsModule />} />
            </Route>
            
            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
