
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Menu, 
  X, 
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveClientViewProps {
  children: React.ReactNode;
  filtersComponent: React.ReactNode;
  activeFilters: number;
  className?: string;
}

/**
 * Responsive wrapper for client view that handles:
 * - Mobile-optimized layout
 * - Collapsible filter panels
 * - Touch-friendly controls
 * - Accessibility features
 */
const ResponsiveClientView: React.FC<ResponsiveClientViewProps> = ({
  children,
  filtersComponent,
  activeFilters,
  className
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + F to toggle filters
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        if (isMobile) {
          setIsFiltersOpen(!isFiltersOpen);
        } else {
          setSidebarCollapsed(!sidebarCollapsed);
        }
      }
      
      // Escape to close mobile filters
      if (e.key === 'Escape' && isMobile && isFiltersOpen) {
        setIsFiltersOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMobile, isFiltersOpen, sidebarCollapsed]);

  // Mobile Layout with Sheet
  if (isMobile) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Mobile Header with Filter Toggle */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
          <h2 className="text-lg font-semibold">Client Tasks</h2>
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                aria-label={`Open filters${activeFilters > 0 ? ` (${activeFilters} active)` : ''}`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-full sm:w-80 p-0 overflow-y-auto"
              aria-describedby="mobile-filters-description"
            >
              <div id="mobile-filters-description" className="sr-only">
                Task filtering options for mobile view
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Task Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFiltersOpen(false)}
                    className="h-8 w-8 p-0"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {filtersComponent}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Content */}
        <div className="px-4 pb-4">
          {children}
        </div>

        {/* Mobile Filter Status Indicator */}
        {activeFilters > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-20">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {activeFilters} filter{activeFilters !== 1 ? 's' : ''} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersOpen(true)}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout with Collapsible Sidebar
  return (
    <div className={cn('flex gap-6', className)}>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-12' : 'w-80',
          'flex-shrink-0'
        )}
      >
        {sidebarCollapsed ? (
          // Collapsed Sidebar
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="w-full h-12 p-0 flex items-center justify-center"
              aria-label={`Expand filters${activeFilters > 0 ? ` (${activeFilters} active)` : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                <Filter className="h-4 w-4" />
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="text-xs scale-75">
                    {activeFilters}
                  </Badge>
                )}
              </div>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="w-full h-8 p-0"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Expanded Sidebar
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters</span>
                {activeFilters > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilters}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(true)}
                className="h-8 w-8 p-0"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            {filtersComponent}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveClientView;
