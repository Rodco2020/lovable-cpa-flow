
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, HelpCircle } from "lucide-react";

interface ReportErrorScreenProps {
  error?: Error | string;
  onRetry?: () => void;
  onGetHelp?: () => void;
}

export const ReportErrorScreen: React.FC<ReportErrorScreenProps> = ({
  error,
  onRetry,
  onGetHelp
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

  return (
    <Card className="border-destructive/20">
      <CardContent className="flex items-center justify-center min-h-64 p-8">
        <div className="text-center max-w-md space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle 
                className="h-12 w-12 text-destructive" 
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-destructive">
              Failed to Load Report
            </h3>
            <p className="text-muted-foreground">
              {errorMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              This could be due to a network issue or server problem. Please try again.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button 
                onClick={onRetry}
                className="gap-2"
                autoFocus
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {onGetHelp && (
              <Button 
                variant="outline" 
                onClick={onGetHelp}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Get Help
              </Button>
            )}
          </div>

          {/* Screen reader announcement */}
          <div className="sr-only" role="alert" aria-live="assertive">
            Error loading report: {errorMessage}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
