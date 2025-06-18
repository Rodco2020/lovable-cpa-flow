
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users, Calendar, BarChart3, Settings, Bug } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/task-wizard', label: 'Task Wizard', icon: Settings },
    { path: '/forecasting', label: 'Forecasting', icon: BarChart3 },
    { path: '/staff-matrix', label: 'Staff Matrix', icon: Calendar },
  ];

  // Add debug link only in development or when needed
  const debugItems = [
    { path: '/debug', label: 'Debug Suite', icon: Bug },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              CPA Practice Management
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'transition-colors hover:text-foreground/80 flex items-center space-x-2',
                    location.pathname === item.path
                      ? 'text-foreground'
                      : 'text-foreground/60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Debug section - separated for clarity */}
        <div className="ml-auto">
          <nav className="flex items-center space-x-4 text-sm font-medium">
            {debugItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'transition-colors hover:text-foreground/80 flex items-center space-x-2',
                    location.pathname === item.path
                      ? 'text-foreground'
                      : 'text-foreground/60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
