
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';

/**
 * Main layout component that wraps all pages
 * Uses PageShell for sidebar and header, and Outlet from react-router for nested routes
 */
export const MainLayout: React.FC = () => {
  return (
    <PageShell>
      <Outlet />
    </PageShell>
  );
};

export default MainLayout;
