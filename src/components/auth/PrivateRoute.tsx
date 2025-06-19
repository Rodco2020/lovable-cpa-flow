
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type PrivateRouteProps = {
  children: React.ReactNode;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔐 [PrivateRoute] Auth check:', {
    user: user?.email || 'No user',
    isLoading,
    hasUser: !!user,
    timestamp: new Date().toISOString()
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 [PrivateRoute] No authenticated user, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  console.log('✅ [PrivateRoute] User authenticated, rendering protected content');
  return <>{children}</>;
};

export default PrivateRoute;
