import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './App.css';

// Existing imports
import Navigation from './components/Navigation';
import ClientList from './components/clients/ClientList';
import ClientDetail from './components/clients/ClientDetail';
import ClientForm from './components/clients/ClientForm';
import TaskWizard from './components/clients/TaskWizard/TaskAssignmentWizard';
import ForecastDashboard from './components/forecasting/ForecastDashboard';
import StaffAvailabilityMatrix from './components/forecasting/matrix/CapacityMatrix';

// Debug and testing imports
import DebugTestPage from './components/debug/DebugTestPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/clients" replace />} />
              <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/clients/:id/edit" element={<ClientForm />} />
              <Route path="/task-wizard" element={<TaskWizard />} />
              <Route path="/forecasting" element={<ForecastDashboard />} />
              <Route path="/staff-matrix" element={<StaffAvailabilityMatrix />} />
              
              {/* Debug and testing routes */}
              <Route path="/debug" element={<DebugTestPage />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/clients" replace />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
