
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Users, 
  Database,
  WifiOff,
  CheckCircle2
} from 'lucide-react';

interface EdgeCaseHandlerProps {
  scenario: 'no-data' | 'loading-error' | 'empty-selection' | 'data-refresh' | 'mode-transition' | 'success';
  staffCount?: number;
  selectedCount?: number;
  onRetry?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
  className?: string;
}

/**
 * Phase 3: Edge Case Handler Component
 * 
 * Provides robust handling of all edge cases in the preferred staff filtering system:
 * - No preferred staff data available
 * - Loading states and errors
 * - Empty selections and transitions
 * - Data refresh scenarios
 */
export const EdgeCaseHandler: React.FC<EdgeCaseHandlerProps> = ({
  scenario,
  staffCount = 0,
  selectedCount = 0,
  onRetry,
  onRefresh,
  isLoading = false,
  errorMessage,
  className
}) => {
  console.log(`🛠️ [PHASE 3 EDGE CASE] Handling scenario:`, {
    scenario,
    staffCount,
    selectedCount,
    isLoading,
    hasRetry: !!onRetry,
    hasRefresh: !!onRefresh
  });

  const getScenarioConfig = () => {
    switch (scenario) {
      case 'no-data':
        return {
          icon: <Database className="h-8 w-8 text-gray-400" />,
          title: 'No Preferred Staff Data',
          description: 'No preferred staff assignments have been found in the system.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-600',
          actions: onRefresh ? [
            { label: 'Refresh Data', onClick: onRefresh, variant: 'outline' as const, icon: <RefreshCw className="h-4 w-4" /> }
          ] : []
        };

      case 'loading-error':
        return {
          icon: <WifiOff className="h-8 w-8 text-red-500" />,
          title: 'Failed to Load Staff Data',
          description: errorMessage || 'There was an error loading preferred staff information.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          actions: onRetry ? [
            { label: 'Try Again', onClick: onRetry, variant: 'destructive' as const, icon: <RefreshCw className="h-4 w-4" /> }
          ] : []
        };

      case 'empty-selection':
        return {
          icon: <Users className="h-8 w-8 text-blue-500" />,
          title: 'No Staff Selected',
          description: 'Select staff members to filter tasks, or switch to a different mode.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          actions: []
        };

      case 'data-refresh':
        return {
          icon: <RefreshCw className={`h-8 w-8 text-blue-500 ${isLoading ? 'animate-spin' : ''}`} />,
          title: 'Refreshing Staff Data',
          description: 'Updating preferred staff assignments and filtering options.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          actions: []
        };

      case 'mode-transition':
        return {
          icon: <RefreshCw className="h-8 w-8 text-orange-500 animate-pulse" />,
          title: 'Switching Filter Mode',
          description: 'Transitioning between filtering modes. Please wait...',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          actions: []
        };

      case 'success':
        return {
          icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
          title: 'Filter Applied Successfully',
          description: `Showing tasks for ${selectedCount} of ${staffCount} staff members.`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          actions: []
        };

      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
          title: 'Unknown State',
          description: 'An unexpected state was encountered.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          actions: []
        };
    }
  };

  const config = getScenarioConfig();

  return (
    <Card className={`${config.bgColor} ${config.borderColor} ${className}`}>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {config.icon}
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className={`font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.textColor.replace('700', '600')}`}>
              {config.description}
            </p>
          </div>

          {/* Status Badge */}
          {staffCount > 0 && (
            <Badge variant="outline" className={config.borderColor}>
              {staffCount} staff member{staffCount !== 1 ? 's' : ''} available
            </Badge>
          )}

          {/* Action Buttons */}
          {config.actions.length > 0 && (
            <div className="flex justify-center gap-2">
              {config.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.onClick}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EdgeCaseHandler;
