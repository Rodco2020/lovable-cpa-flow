
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/components/auth/Login';
import Signup from '@/components/auth/Signup';
import { useAuth } from '@/context/AuthContext';

const Auth = () => {
  const { user, isLoading } = useAuth();

  // If the user is already logged in, redirect to the home page
  if (user && !isLoading) {
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
