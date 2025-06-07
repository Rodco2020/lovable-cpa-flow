
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Users, X, RefreshCw } from 'lucide-react';

interface ClientFilterHeaderProps {
  clientsCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  onClearAll: () => void;
  isRefreshing?: boolean;
}

export const ClientFilterHeader: React.FC<ClientFilterHeaderProps> = ({
  clientsCount,
  selectedCount,
  isAllSelected,
  isPartiallySelected,
  isCollapsed,
  onToggleCollapse,
  onClearAll,
  isRefreshing = false
}) => {
  const getSelectionStatus = () => {
    if (isAllSelected) return 'All clients selected';
    if (isPartiallySelected) return `${selectedCount} of ${clientsCount} clients selected`;
    return 'No clients selected';
  };

  const getStatusColor = () => {
    if (isAllSelected) return 'default';
    if (isPartiallySelected) return 'secondary';
    return 'destructive';
  };

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Client Filter
            {isRefreshing && (
              <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          
          {/* Enhanced status badge with better accessibility */}
          <Badge 
            variant={getStatusColor()}
            className="text-xs"
            aria-label={getSelectionStatus()}
          >
            {selectedCount}/{clientsCount}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear selection button with better accessibility */}
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-7 px-2"
              aria-label="Clear all client selections"
              title="Clear all client selections"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {/* Collapse toggle with better accessibility */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-7 px-2"
              aria-label={isCollapsed ? 'Expand client filter' : 'Collapse client filter'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Enhanced status text with better visual hierarchy */}
      <div className="text-xs text-muted-foreground" aria-live="polite">
        {getSelectionStatus()}
        {isRefreshing && ' (updating...)'}
      </div>
    </CardHeader>
  );
};
