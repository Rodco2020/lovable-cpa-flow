
import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Bug, ExternalLink } from 'lucide-react';

interface DemandMatrixErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface DemandMatrixErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class DemandMatrixErrorBoundary extends Component<
  DemandMatrixErrorBoundaryProps,
  DemandMatrixErrorBoundaryState
> {
  private maxRetries = 3;

  constructor(props: DemandMatrixErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DemandMatrixErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Demand Matrix Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log error details for debugging
    this.logErrorDetails(error, errorInfo);
  }

  private logErrorDetails = (error: Error, errorInfo: React.ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.group('🚨 Demand Matrix Error Details');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Full Details:', errorDetails);
    console.groupEnd();
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(`Retrying demand matrix component (attempt ${this.state.retryCount + 1}/${this.maxRetries})`);
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'medium';
    }
    
    if (message.includes('memory') || message.includes('maximum call stack')) {
      return 'high';
    }
    
    return 'low';
  };

  private getSuggestion = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Check your internet connection and try again.';
    }
    
    if (message.includes('data') || message.includes('undefined') || message.includes('null')) {
      return 'There may be an issue with the demand data. Try refreshing or adjusting your filters.';
    }
    
    if (message.includes('memory') || message.includes('maximum call stack')) {
      return 'The dataset may be too large. Try reducing the date range or applying more filters.';
    }
    
    return 'This appears to be a technical issue. Try refreshing the page or contact support if the problem persists.';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const severity = this.getErrorSeverity(this.state.error!);
      const suggestion = this.getSuggestion(this.state.error!);
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="p-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Demand Matrix Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      Something went wrong while loading the demand matrix.
                    </p>
                    <p className="text-sm">
                      {suggestion}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technical Details (Development)
                  </summary>
                  <div className="bg-muted p-3 rounded-md font-mono text-xs overflow-auto">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className="mb-2">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button onClick={this.handleRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry ({this.state.retryCount + 1}/{this.maxRetries})
                  </Button>
                )}
                
                <Button onClick={this.handleReset} variant="outline">
                  Reset Component
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()} 
                  variant={severity === 'high' ? 'default' : 'outline'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {/* Helpful Information */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>💡 <strong>Quick fixes to try:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clear your browser cache and reload</li>
                  <li>Try reducing the selected date range</li>
                  <li>Apply fewer filters to reduce data complexity</li>
                  <li>Check if your client data is properly configured</li>
                </ul>
              </div>

              {/* Retry Limit Reached */}
              {!canRetry && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        Maximum retry attempts reached. The component appears to have a persistent issue.
                      </p>
                      <p className="text-sm">
                        Please refresh the page or contact support for assistance.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easy wrapping
export const withDemandMatrixErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <DemandMatrixErrorBoundary>
      <Component {...props} />
    </DemandMatrixErrorBoundary>
  );
  
  WrappedComponent.displayName = `withDemandMatrixErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
