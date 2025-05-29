
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, ChevronDown, Keyboard } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AdvancedSearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  availableCategories: string[];
  availablePriorities: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  availableCategories,
  availablePriorities,
  onClearFilters,
  hasActiveFilters
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Escape to clear search when focused
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        onSearchChange('');
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (categoryFilter) count++;
    if (priorityFilter) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-3">
      {/* Enhanced Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
        <Input
          ref={searchInputRef}
          placeholder="Search tasks... (⌘K)"
          className="pl-10 pr-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 p-0 transform -translate-y-1/2"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-2"
              aria-label={`Filters ${activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Options</h4>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Keyboard className="h-3 w-3" />
                  <span>Use ⌘K for search</span>
                </div>
              </div>
              
              <Separator />

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={categoryFilter === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {availableCategories.map((category) => (
                    <Button
                      key={category}
                      variant={categoryFilter === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(category)}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={priorityFilter === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPriorityFilter('')}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {availablePriorities.map((priority) => (
                    <Button
                      key={priority}
                      variant={priorityFilter === priority ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriorityFilter(priority)}
                      className="text-xs"
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <>
                  <Separator />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClearFilters();
                      setIsFilterOpen(false);
                    }}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filter Display */}
        {categoryFilter && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>Category: {categoryFilter}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto w-auto p-0 hover:bg-transparent"
              onClick={() => setCategoryFilter('')}
              aria-label={`Remove category filter: ${categoryFilter}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {priorityFilter && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>Priority: {priorityFilter}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto w-auto p-0 hover:bg-transparent"
              onClick={() => setPriorityFilter('')}
              aria-label={`Remove priority filter: ${priorityFilter}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};
