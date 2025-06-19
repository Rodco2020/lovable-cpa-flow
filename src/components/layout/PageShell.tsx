
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  FileText, 
  Users, 
  BarChart2,
  User,
  UserCog,
  Database,
  LogOut,
  FileBarChart,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageShellProps {
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
  const { user, session, isLoading, signOut } = useAuth();

  console.log('🏠 [PageShell] Render state:', {
    isLoading,
    hasUser: !!user,
    userEmail: user?.email || 'No email',
    hasSession: !!session,
    sessionValid: session ? 'Valid' : 'Invalid',
    timestamp: new Date().toISOString()
  });

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">CPA Practice</h1>
          <p className="text-slate-400 text-sm">Management System</p>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1 flex-grow">
          <NavLink 
            to="/" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/clients" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Users className="h-5 w-5" />
            <span>Clients</span>
          </NavLink>
          
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <FileText className="h-5 w-5" />
            <span>Tasks</span>
          </NavLink>
          
          <NavLink 
            to="/staff" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <UserCog className="h-5 w-5" />
            <span>Staff</span>
          </NavLink>
          
          <NavLink 
            to="/skills" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Database className="h-5 w-5" />
            <span>Skills</span>
          </NavLink>
          
          <NavLink 
            to="/scheduler" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Calendar className="h-5 w-5" />
            <span>Schedule</span>
          </NavLink>

          <NavLink 
            to="/forecasting" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Forecasting</span>
          </NavLink>
          
          <NavLink 
            to="/reports" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              isActive 
                ? "bg-slate-800 text-white" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <FileBarChart className="h-5 w-5" />
            <span>Reports</span>
          </NavLink>
        </nav>
        
        {/* Enhanced User Section */}
        <div className="mt-auto pt-4 border-t border-slate-700">
          {user ? (
            <div className="space-y-3">
              {/* User Display Card */}
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate" title={user.email || 'Unknown user'}>
                      {user.email || 'No email available'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {session ? 'Authenticated' : 'Session expired'}
                    </div>
                  </div>
                </div>
                
                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 pt-2 border-t border-slate-600">
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>ID: {user.id?.slice(0, 8)}...</div>
                      <div>Session: {session ? '✓' : '✗'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={async () => {
                  console.log('🔓 [PageShell] Sign out initiated');
                  try {
                    await signOut();
                    console.log('✅ [PageShell] Sign out completed');
                  } catch (error) {
                    console.error('❌ [PageShell] Sign out failed:', error);
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* No User State */}
              <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  Not authenticated
                </AlertDescription>
              </Alert>
              
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-slate-500 bg-slate-800 p-2 rounded">
                  <div>Auth State Debug:</div>
                  <div>User: {user ? 'Present' : 'Null'}</div>
                  <div>Session: {session ? 'Present' : 'Null'}</div>
                  <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow bg-slate-50">
        <header className="bg-white border-b h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium">CPA Practice Management</h2>
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user.email}</span>
              </div>
            )}
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageShell;
