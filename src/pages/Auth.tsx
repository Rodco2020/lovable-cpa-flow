
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/components/auth/Login';
import Signup from '@/components/auth/Signup';
import { useAuth } from '@/context/AuthContext';

const Auth = () => {
  const { user, isLoading } = useAuth();

  // While loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If the user is already logged in, redirect to the home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Auth;
