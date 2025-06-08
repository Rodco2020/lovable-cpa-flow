
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

/**
 * Client Filtering Performance Monitor
 * 
 * Monitors and displays performance metrics for client-specific data operations.
 * Helps ensure that new client filtering features maintain acceptable performance.
 */

interface PerformanceMetrics {
  lastQueryTime: number;
  averageQueryTime: number;
  queryCount: number;
  cacheHitRate: number;
  slowQueries: number;
  errorCount: number;
}

interface ClientFilteringPerformanceMonitorProps {
  isVisible?: boolean;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

const ClientFilteringPerformanceMonitor: React.FC<ClientFilteringPerformanceMonitorProps> = ({
  isVisible = false,
  thresholds = { warning: 1000, critical: 2000 }
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lastQueryTime: 0,
    averageQueryTime: 0,
    queryCount: 0,
    cacheHitRate: 0,
    slowQueries: 0,
    errorCount: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Simulated metrics update (in real implementation, this would come from the service)
  useEffect(() => {
    if (!isVisible) return;

    setIsMonitoring(true);
    const interval = setInterval(() => {
      // In real implementation, this would fetch actual metrics
      setMetrics(prev => ({
        ...prev,
        queryCount: prev.queryCount + Math.floor(Math.random() * 3),
        averageQueryTime: 400 + Math.random() * 200,
        lastQueryTime: 300 + Math.random() * 400,
        cacheHitRate: 0.7 + Math.random() * 0.3,
        slowQueries: prev.slowQueries + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const getPerformanceStatus = (time: number) => {
    if (time < thresholds.warning) return 'good';
    if (time < thresholds.critical) return 'warning';
    return 'critical';
  };

  const performanceStatus = getPerformanceStatus(metrics.averageQueryTime);
  const cacheEfficiency = Math.round(metrics.cacheHitRate * 100);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4" />
          Client Filtering Performance Monitor
          {isMonitoring && (
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Query Performance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Query</span>
              <div className="flex items-center gap-1">
                {performanceStatus === 'good' && <CheckCircle className="h-3 w-3 text-green-500" />}
                {performanceStatus === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                {performanceStatus === 'critical' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                <span className={`text-xs ${
                  performanceStatus === 'good' ? 'text-green-600' :
                  performanceStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.lastQueryTime.toFixed(0)}ms
                </span>
              </div>
            </div>
            <Progress 
              value={Math.min((metrics.lastQueryTime / thresholds.critical) * 100, 100)} 
              className="h-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average Time</span>
              <span className="text-xs">
                {metrics.averageQueryTime.toFixed(0)}ms
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.averageQueryTime / thresholds.critical) * 100, 100)} 
              className="h-1"
            />
          </div>
        </div>

        {/* Cache Performance */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cache Hit Rate</span>
              <Badge variant={cacheEfficiency > 70 ? 'default' : 'secondary'} className="text-xs">
                {cacheEfficiency}%
              </Badge>
            </div>
            <Progress value={cacheEfficiency} className="h-1" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Queries</span>
              <span className="text-xs font-mono">{metrics.queryCount}</span>
            </div>
          </div>
        </div>

        {/* Performance Alerts */}
        {metrics.slowQueries > 0 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {metrics.slowQueries} slow quer{metrics.slowQueries === 1 ? 'y' : 'ies'} detected
            </span>
          </div>
        )}

        {/* Status Summary */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="flex justify-between">
            <span>Status: Client filtering performing {performanceStatus}</span>
            <span>Target: &lt; {thresholds.warning}ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFilteringPerformanceMonitor;
