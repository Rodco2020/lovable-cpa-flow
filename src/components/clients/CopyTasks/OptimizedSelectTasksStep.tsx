
import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Loader2 } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UserGuidancePanel } from './components/UserGuidancePanel';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Lazy load heavy components for better initial load time
const SelectTasksStepEnhanced = lazy(() => 
  import('./SelectTasksStepEnhanced').then(module => ({ 
    default: module.SelectTasksStepEnhanced 
  }))
);

interface OptimizedSelectTasksStepProps {
  clientId: string;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  sourceClientName: string;
}

const LoadingFallback = () => (
  <Card>
    <CardContent className="p-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Loading task selection interface...</p>
    </CardContent>
  </Card>
);

export const OptimizedSelectTasksStep: React.FC<OptimizedSelectTasksStepProps> = (props) => {
  const { measureRender, logMetrics } = usePerformanceMonitor({
    componentName: 'OptimizedSelectTasksStep',
    threshold: 200,
    onPerformanceIssue: (metrics) => {
      console.warn('Performance issue detected in OptimizedSelectTasksStep:', metrics);
    }
  });

  React.useEffect(() => {
    const endMeasure = measureRender();
    return endMeasure;
  });

  React.useEffect(() => {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(logMetrics, 1000);
      return () => clearTimeout(timer);
    }
  }, [logMetrics]);

  return (
    <div className="space-y-4">
      {/* User Guidance */}
      <UserGuidancePanel currentStep="select-tasks" />
      
      {/* Main Content with Error Boundary */}
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Error in OptimizedSelectTasksStep:', error, errorInfo);
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SelectTasksStepEnhanced {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
