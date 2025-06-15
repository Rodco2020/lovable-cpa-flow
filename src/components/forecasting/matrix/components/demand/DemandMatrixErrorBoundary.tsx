
import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Bug, ExternalLink, DollarSign, Calculator } from 'lucide-react';
import { errorHandlingService } from '@/services/forecasting/validation/ErrorHandlingService';

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
  userFriendlyError: any | null;
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
      retryCount: 0,
      userFriendlyError: null
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
    
    // Generate user-friendly error using error handling service
    const context = {
      operation: 'renderDemandMatrix',
      component: 'DemandMatrixErrorBoundary',
      timestamp: new Date()
    };

    const userFriendlyError = errorHandlingService.generateUserFriendlyError(error, context);

    this.setState({
      error,
      errorInfo,
      userFriendlyError
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
        userFriendlyError: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      userFriendlyError: null
    });
  };

  private getErrorCategory = (error: Error): 'revenue' | 'network' | 'validation' | 'generic' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('revenue') || message.includes('fee rate') || message.includes('skill')) {
      return 'revenue';
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('missing')) {
      return 'validation';
    }
    
    return 'generic';
  };

  private getErrorIcon = (category: 'revenue' | 'network' | 'validation' | 'generic') => {
    switch (category) {
      case 'revenue':
        return <DollarSign className="h-5 w-5" />;
      case 'network':
        return <ExternalLink className="h-5 w-5" />;
      case 'validation':
        return <Calculator className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  private getCategoryColor = (category: 'revenue' | 'network' | 'validation' | 'generic') => {
    switch (category) {
      case 'revenue':
        return 'text-orange-600';
      case 'network':
        return 'text-blue-600';
      case 'validation':
        return 'text-purple-600';
      default:
        return 'text-destructive';
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error!;
      const userError = this.state.userFriendlyError;
      const category = this.getErrorCategory(error);
      const canRetry = this.state.retryCount < this.maxRetries;
      const categoryColor = this.getCategoryColor(category);

      return (
        <div className="p-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className={`${categoryColor} flex items-center gap-2`}>
                {this.getErrorIcon(category)}
                {userError?.title || 'Demand Matrix Error'}
                <Badge variant="outline" className="ml-auto">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enhanced Error Alert with User-Friendly Message */}
              <Alert variant={userError?.severity === 'warning' ? 'default' : 'destructive'}>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">
                      {userError?.message || 'Something went wrong while loading the demand matrix.'}
                    </p>
                    
                    {/* Actionable Suggestions */}
                    {userError?.actionable && userError.suggestedActions?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Suggested actions:</p>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {userError.suggestedActions.map((action: string, index: number) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Category-Specific Guidance */}
              {category === 'revenue' && (
                <Alert>
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Revenue Calculation Issue</p>
                      <p className="text-sm">
                        This appears to be related to revenue calculations or skill fee rates. 
                        The system will use fallback values where possible.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {category === 'network' && (
                <Alert>
                  <ExternalLink className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Connection Issue</p>
                      <p className="text-sm">
                        Unable to load data due to a network issue. Please check your connection and try again.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {category === 'validation' && (
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Data Validation Issue</p>
                      <p className="text-sm">
                        Some data quality issues were detected. The system will continue with available data.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

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
                  variant={category === 'network' ? 'default' : 'outline'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {/* Enhanced Helpful Information */}
              <div className="text-sm text-muted-foreground space-y-2">
                <p>💡 <strong>Quick fixes to try:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clear your browser cache and reload</li>
                  <li>Try reducing the selected date range</li>
                  <li>Apply fewer filters to reduce data complexity</li>
                  {category === 'revenue' && (
                    <>
                      <li>Check if skill fee rates are properly configured</li>
                      <li>Verify client revenue data in the Client module</li>
                    </>
                  )}
                  {category === 'network' && (
                    <>
                      <li>Check your internet connection</li>
                      <li>Wait a few minutes and try again</li>
                    </>
                  )}
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
