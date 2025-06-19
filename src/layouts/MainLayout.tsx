
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';

const MainLayout: React.FC = () => {
  console.log('🏗️ [MainLayout] Rendering layout');
  
  return (
    <PageShell>
      <Outlet />
    </PageShell>
  );
};

export default MainLayout;
