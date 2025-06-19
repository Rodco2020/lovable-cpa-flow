
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
  FileBarChart // Adding for reports icon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface PageShellProps {
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
  const { user, signOut, isLoading } = useAuth();

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
        
        <div className="mt-auto pt-4 border-t border-slate-700">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.email}</div>
                  <div className="text-xs text-slate-400">Staff Member</div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Not authenticated</p>
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
