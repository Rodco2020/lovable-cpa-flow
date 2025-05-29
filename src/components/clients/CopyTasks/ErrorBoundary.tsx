
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from './components/HelpTooltip';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
  showReset?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the entire application.
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary onError={(error) => console.error(error)}>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset error state if resetKeys changed
    if (
      this.state.hasError && 
      this.props.resetKeys && 
      prevProps.resetKeys &&
      this.props.resetKeys.some((val, idx) => val !== prevProps.resetKeys![idx])
    ) {
      this.setState({ 
        hasError: false,
        error: null
      });
    }
  }

  private handleReset = (): void => {
    this.setState({ 
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-lg flex items-center justify-center">
                  Something went wrong
                  <HelpTooltip 
                    content="An unexpected error occurred in this component. Try resetting or refreshing the page." 
                    type="help"
                    className="ml-2"
                  />
                </h3>
                
                {this.state.error && (
                  <div className="bg-gray-100 p-3 rounded text-sm text-left overflow-auto max-h-32">
                    <code>{this.state.error.message}</code>
                  </div>
                )}
              </div>

              {this.props.showReset !== false && (
                <Button variant="outline" onClick={this.handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
