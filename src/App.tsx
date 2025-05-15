
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import DashboardModule from '@/pages/DashboardModule';
import StaffModule from '@/pages/StaffModule';
import SchedulerModule from '@/pages/SchedulerModule';
import ForecastingModule from '@/pages/ForecastingModule';
import TaskModule from '@/pages/TaskModule';
import SkillsModule from '@/pages/SkillsModule';
import IntegrationsInitializer from "@/components/integrations/IntegrationsInitializer";

function App() {
  return (
    <>
      {/* Integration initializer */}
      <IntegrationsInitializer />
      
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardModule />} />
            <Route path="staff/*" element={<StaffModule />} />
            <Route path="scheduler/*" element={<SchedulerModule />} />
            <Route path="forecasting/*" element={<ForecastingModule />} />
            <Route path="tasks/*" element={<TaskModule />} />
            <Route path="skills/*" element={<SkillsModule />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
