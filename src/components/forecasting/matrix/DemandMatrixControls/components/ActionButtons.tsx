
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Download, RefreshCw, Wrench } from 'lucide-react';

interface ActionButtonsProps {
  onReset: () => void;
  onExport: () => void;
  onManualRefresh?: () => void;
  loading?: boolean;
}

/**
 * Action buttons component
 * Groups all action buttons with consistent styling
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onReset,
  onExport,
  onManualRefresh,
  loading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Matrix Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>

          {onManualRefresh && (
            <Button 
              onClick={onManualRefresh} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Cache
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
