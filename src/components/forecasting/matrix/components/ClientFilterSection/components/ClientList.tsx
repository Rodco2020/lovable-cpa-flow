
import React, { useCallback, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Client {
  id: string;
  legal_name: string;
}

interface ClientListProps {
  clients: Client[];
  selectedClientIds: string[];
  onClientToggle: (clientId: string) => void;
  searchTerm: string;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  selectedClientIds,
  onClientToggle,
  searchTerm
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLLabelElement | null>>({});

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, clientId: string) => {
    const currentIndex = clients.findIndex(client => client.id === clientId);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, clients.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = clients.length - 1;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        onClientToggle(clientId);
        return;
      default:
        return;
    }

    // Focus the next item
    const nextClient = clients[nextIndex];
    if (nextClient && itemRefs.current[nextClient.id]) {
      itemRefs.current[nextClient.id]?.focus();
    }
  }, [clients, onClientToggle]);

  // Highlight search terms
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  // Auto-focus first item when list changes
  useEffect(() => {
    if (clients.length > 0 && searchTerm) {
      const firstClient = clients[0];
      if (firstClient && itemRefs.current[firstClient.id]) {
        // Small delay to ensure rendering is complete
        setTimeout(() => {
          itemRefs.current[firstClient.id]?.focus();
        }, 100);
      }
    }
  }, [clients, searchTerm]);

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-sm">
          {searchTerm ? (
            <>
              No clients found matching "{searchTerm}"
              <div className="text-xs mt-1">Try adjusting your search terms</div>
            </>
          ) : (
            'No clients available'
          )}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-32" ref={listRef}>
      <div 
        className="space-y-1 p-1"
        role="listbox"
        aria-label="Client selection list"
        aria-multiselectable="true"
      >
        {clients.map((client, index) => {
          const isSelected = selectedClientIds.includes(client.id);
          
          return (
            <label
              key={client.id}
              ref={(el) => { itemRefs.current[client.id] = el; }}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              tabIndex={0}
              role="option"
              aria-selected={isSelected}
              aria-posinset={index + 1}
              aria-setsize={clients.length}
              onKeyDown={(e) => handleKeyDown(e, client.id)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onClientToggle(client.id)}
                className="flex-shrink-0"
                aria-label={`Select ${client.legal_name}`}
                tabIndex={-1} // Remove from tab order since label handles focus
              />
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {highlightSearchTerm(client.legal_name, searchTerm)}
                </div>
              </div>
              
              {isSelected && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </label>
          );
        })}
      </div>
    </ScrollArea>
  );
};
