
import React from 'react';
import { Loader2, Clock, Database, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EnhancedLoadingStateProps {
  type: 'clients' | 'tasks' | 'processing' | 'validation';
  message?: string;
  progress?: number;
  estimatedTime?: number;
}

const LOADING_CONFIG = {
  clients: {
    icon: Database,
    title: 'Loading Clients',
    message: 'Fetching available clients from database...',
    color: 'blue'
  },
  tasks: {
    icon: RefreshCw,
    title: 'Loading Tasks',
    message: 'Retrieving task information...',
    color: 'purple'
  },
  processing: {
    icon: Loader2,
    title: 'Processing',
    message: 'Copying tasks between clients...',
    color: 'green'
  },
  validation: {
    icon: Clock,
    title: 'Validating',
    message: 'Checking data integrity...',
    color: 'orange'
  }
} as const;

export const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({
  type,
  message,
  progress,
  estimatedTime
}) => {
  const config = LOADING_CONFIG[type];
  const Icon = config.icon;

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
        {/* Animated Icon */}
        <div className={`relative p-4 rounded-full bg-${config.color}-100`}>
          <Icon className={`w-8 h-8 text-${config.color}-500 ${
            type === 'processing' || type === 'tasks' ? 'animate-spin' : ''
          }`} />
          
          {/* Pulse Effect */}
          <div className={`absolute inset-0 rounded-full bg-${config.color}-200 animate-ping opacity-20`} />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3 className="font-medium text-lg">{config.title}</h3>
          <p className="text-sm text-muted-foreground">
            {message || config.message}
          </p>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="w-full max-w-xs space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-${config.color}-500 h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {/* Estimated Time */}
        {estimatedTime && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>~{estimatedTime} seconds remaining</span>
          </div>
        )}

        {/* Loading Dots Animation */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 bg-${config.color}-400 rounded-full animate-bounce`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
