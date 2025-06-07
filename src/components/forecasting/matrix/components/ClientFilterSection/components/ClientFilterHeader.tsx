
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, X } from 'lucide-react';

interface ClientFilterHeaderProps {
  clientsCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClearAll: () => void;
}

export const ClientFilterHeader: React.FC<ClientFilterHeaderProps> = ({
  clientsCount,
  selectedCount,
  isAllSelected,
  isPartiallySelected,
  isCollapsed,
  onToggleCollapse,
  onClearAll
}) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Client Filter
          {clientsCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {clientsCount} active
            </Badge>
          )}
        </CardTitle>
        {onToggleCollapse && (
          <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
            {isCollapsed ? 'Show' : 'Hide'}
          </Button>
        )}
      </div>
      
      {selectedCount > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {selectedCount} clients selected
            {isAllSelected && ' (All)'}
            {isPartiallySelected && ' (Partial)'}
          </span>
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </CardHeader>
  );
};
