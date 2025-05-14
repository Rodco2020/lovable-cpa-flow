
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  FileText, 
  Users, 
  BarChart2,
  User
} from 'lucide-react';

interface PageShellProps {
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
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
            to="/schedule" 
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
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-slate-400">admin@example.com</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow bg-slate-50">
        <header className="bg-white border-b h-16 flex items-center px-6">
          <h2 className="text-lg font-medium">CPA Practice Management</h2>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageShell;
