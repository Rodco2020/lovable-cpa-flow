
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * MetricsErrorBoundary Component
 * 
 * Provides graceful error handling for metrics components
 * Features:
 * - Catches errors in metrics calculations and rendering
 * - Provides user-friendly error messages
 * - Allows recovery without full page reload
 * - Logs errors for debugging
 */
export class MetricsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MetricsErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Metrics Calculation Error</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-3">
                  <p>
                    There was an error calculating the metrics. This might be due to invalid data or a temporary issue.
                  </p>
                  {this.state.error && (
                    <details className="text-xs bg-gray-50 p-2 rounded">
                      <summary className="cursor-pointer font-medium">Error Details</summary>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={this.handleRetry}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try Again
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.reload()}
                    >
                      Reload Page
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withMetricsErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <MetricsErrorBoundary fallback={fallback}>
      <Component {...props} />
    </MetricsErrorBoundary>
  );

  WrappedComponent.displayName = `withMetricsErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
