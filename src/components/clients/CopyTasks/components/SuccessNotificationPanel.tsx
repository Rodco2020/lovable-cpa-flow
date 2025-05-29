
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Download, 
  Share2,
  Clock,
  TrendingUp,
  FileText,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/services/toastService';

interface OperationSummary {
  totalTasks: number;
  recurringTasks: number;
  adHocTasks: number;
  processingTime: number;
  successRate: number;
  sourceClientName: string;
  targetClientName: string;
}

interface SuccessNotificationPanelProps {
  operationSummary: OperationSummary;
  onViewTasks?: () => void;
  onCopyAnother?: () => void;
  onClose?: () => void;
  onExportSummary?: () => void;
  showShareButton?: boolean;
}

export const SuccessNotificationPanel: React.FC<SuccessNotificationPanelProps> = ({
  operationSummary,
  onViewTasks,
  onCopyAnother,
  onClose,
  onExportSummary,
  showShareButton = false
}) => {
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    // Auto-hide celebration after 3 seconds
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const formatProcessingTime = (milliseconds: number) => {
    const seconds = milliseconds / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(1);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleShareSuccess = async () => {
    const shareText = `Successfully copied ${operationSummary.totalTasks} tasks from ${operationSummary.sourceClientName} to ${operationSummary.targetClientName} in ${formatProcessingTime(operationSummary.processingTime)}!`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Task Copy Operation Complete',
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Summary copied to clipboard!');
      }
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  const handleCopyTaskDetails = async () => {
    const details = `
Task Copy Summary:
• Source: ${operationSummary.sourceClientName}
• Target: ${operationSummary.targetClientName}
• Total Tasks: ${operationSummary.totalTasks}
• Recurring Tasks: ${operationSummary.recurringTasks}
• Ad-hoc Tasks: ${operationSummary.adHocTasks}
• Processing Time: ${formatProcessingTime(operationSummary.processingTime)}
• Success Rate: ${operationSummary.successRate}%
    `.trim();

    try {
      await navigator.clipboard.writeText(details);
      toast.success('Task details copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy details');
    }
  };

  return (
    <Card className={`${showCelebration ? 'animate-scale-in' : ''}`}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4">
          <div className="relative">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            {showCelebration && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 border-4 border-green-200 rounded-full animate-ping" />
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-xl text-green-700">
          Copy Operation Completed Successfully!
        </CardTitle>
        <p className="text-muted-foreground">
          {operationSummary.totalTasks} task{operationSummary.totalTasks !== 1 ? 's' : ''} 
          {' '}copied from <strong>{operationSummary.sourceClientName}</strong> to{' '}
          <strong>{operationSummary.targetClientName}</strong>
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Operation Summary */}
        <Alert className="border-green-200 bg-green-50">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Operation completed in {formatProcessingTime(operationSummary.processingTime)} with {operationSummary.successRate}% success rate
          </AlertDescription>
        </Alert>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{operationSummary.totalTasks}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <RotateCcw className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{operationSummary.recurringTasks}</div>
            <div className="text-sm text-muted-foreground">Recurring</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{operationSummary.adHocTasks}</div>
            <div className="text-sm text-muted-foreground">Ad-hoc</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-lg font-bold">
              {formatProcessingTime(operationSummary.processingTime)}
            </div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {onViewTasks && (
            <Button onClick={onViewTasks} className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4" />
              <span>View Tasks</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleCopyTaskDetails}
            className="flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Details</span>
          </Button>

          {onExportSummary && (
            <Button
              variant="outline"
              onClick={onExportSummary}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Summary</span>
            </Button>
          )}

          {showShareButton && (
            <Button
              variant="outline"
              onClick={handleShareSuccess}
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          {onCopyAnother && (
            <Button variant="ghost" size="sm" onClick={onCopyAnother}>
              Copy More Tasks
            </Button>
          )}
          
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Accessibility Announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Task copy operation completed successfully. {operationSummary.totalTasks} tasks copied 
          from {operationSummary.sourceClientName} to {operationSummary.targetClientName} 
          in {formatProcessingTime(operationSummary.processingTime)}.
        </div>
      </CardContent>
    </Card>
  );
};
