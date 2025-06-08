
import React from 'react';
import { Loader2, AlertCircle, Wifi } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnhancedLoadingStateProps {
  type: 'loading' | 'error' | 'empty' | 'offline';
  title?: string;
  message?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  progress?: number;
  showProgress?: boolean;
  className?: string;
}

/**
 * Enhanced Loading State Component
 * Provides consistent loading, error, and empty states with progress tracking
 */
export const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({
  type,
  title,
  message,
  onRetry,
  onCancel,
  progress,
  showProgress = false,
  className = ''
}) => {
  const getStateConfig = () => {
    switch (type) {
      case 'loading':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          defaultTitle: 'Loading',
          defaultMessage: 'Please wait while we fetch your data...',
          bgColor: 'bg-background'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          defaultTitle: 'Error',
          defaultMessage: 'Something went wrong. Please try again.',
          bgColor: 'bg-destructive/5'
        };
      case 'offline':
        return {
          icon: <Wifi className="h-8 w-8 text-muted-foreground" />,
          defaultTitle: 'Offline',
          defaultMessage: 'Please check your internet connection.',
          bgColor: 'bg-muted/20'
        };
      case 'empty':
      default:
        return {
          icon: <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm">?</div>,
          defaultTitle: 'No Data',
          defaultMessage: 'No data available to display.',
          bgColor: 'bg-muted/10'
        };
    }
  };

  const config = getStateConfig();

  return (
    <Card className={`${config.bgColor} ${className}`}>
      <CardContent className="py-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          {config.icon}
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {title || config.defaultTitle}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {message || config.defaultMessage}
            </p>
          </div>

          {/* Progress Bar */}
          {showProgress && typeof progress === 'number' && (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(onRetry || onCancel) && (
            <div className="flex gap-2 mt-4">
              {onRetry && (
                <Button 
                  onClick={onRetry}
                  variant={type === 'error' ? 'default' : 'outline'}
                  size="sm"
                >
                  Try Again
                </Button>
              )}
              {onCancel && (
                <Button 
                  onClick={onCancel}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedLoadingState;
