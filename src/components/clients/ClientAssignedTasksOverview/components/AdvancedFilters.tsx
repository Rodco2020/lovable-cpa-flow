
import React, { useState, useEffect } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';
import { SkillDeduplicationService } from '../services/skillDeduplicationService';

export interface AdvancedFilterState {
  skillFilters: string[];
  clientFilters: string[];
  priorityFilters: string[];
  statusFilters: string[];
  staffLiaisonFilters: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  preset: string | null;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterState;
  onFiltersChange: (filters: AdvancedFilterState) => void;
  clients: Client[];
  availableSkills: string[];
  availablePriorities: string[];
  staffOptions: StaffOption[];
  className?: string;
}

/**
 * Advanced Filters Component
 * 
 * Provides multi-select filters, date range filtering, and quick presets
 * for complex filtering scenarios. Now includes staff liaison filtering.
 */
export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  clients,
  availableSkills,
  availablePriorities,
  staffOptions,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug logging for skills
  useEffect(() => {
    console.log('[AdvancedFilters] Received skills:', {
      count: availableSkills?.length || 0,
      skills: availableSkills,
      hasDuplicates: availableSkills ? new Set(availableSkills).size !== availableSkills.length : false
    });
  }, [availableSkills]);

  // Comprehensive validation to filter out any invalid values
  const validClients = React.useMemo(() => {
    if (!Array.isArray(clients)) return [];
    return clients.filter(client => 
      client && 
      typeof client === 'object' && 
      client.id && 
      typeof client.id === 'string' && 
      client.id.trim() !== '' &&
      client.legalName &&
      typeof client.legalName === 'string' &&
      client.legalName.trim() !== ''
    );
  }, [clients]);

  // Enhanced validation for skills using deduplication service
  const validSkills = React.useMemo(() => {
    if (!Array.isArray(availableSkills)) return [];
    
    const filtered = availableSkills.filter(skill => 
      skill && 
      typeof skill === 'string' && 
      skill.trim() !== ''
    );
    
    // Use Set for additional deduplication safety
    const deduplicated = [...new Set(filtered)];
    
    console.log('[AdvancedFilters] Skill validation:', {
      original: availableSkills.length,
      afterFiltering: filtered.length,
      afterDeduplication: deduplicated.length,
      duplicatesRemoved: filtered.length - deduplicated.length
    });
    
    return deduplicated.sort();
  }, [availableSkills]);

  const validPriorities = React.useMemo(() => {
    if (!Array.isArray(availablePriorities)) return [];
    return availablePriorities.filter(priority => 
      priority && 
      typeof priority === 'string' && 
      priority.trim() !== ''
    );
  }, [availablePriorities]);

  // Validation for staff options
  const validStaffOptions = React.useMemo(() => {
    if (!Array.isArray(staffOptions)) return [];
    return staffOptions.filter(staff => 
      staff && 
      typeof staff === 'object' && 
      staff.id && 
      typeof staff.id === 'string' && 
      staff.id.trim() !== '' &&
      staff.full_name &&
      typeof staff.full_name === 'string' &&
      staff.full_name.trim() !== ''
    );
  }, [staffOptions]);

  // Quick filter presets
  const presets = [
    { id: 'high-priority', label: 'High Priority Tasks', description: 'Tasks with high priority' },
    { id: 'this-month', label: 'This Month', description: 'Tasks due this month' },
    { id: 'recurring-only', label: 'Recurring Tasks', description: 'Only recurring tasks' },
    { id: 'multi-skill', label: 'Multi-Skill Tasks', description: 'Tasks requiring multiple skills' }
  ];

  const updateMultiSelectFilter = (
    filterKey: keyof Pick<AdvancedFilterState, 'skillFilters' | 'clientFilters' | 'priorityFilters' | 'statusFilters' | 'staffLiaisonFilters'>,
    value: string,
    checked: boolean
  ) => {
    // Comprehensive validation to ensure value is safe
    if (!value || typeof value !== 'string' || value.trim() === '') {
      console.warn('Invalid value passed to updateMultiSelectFilter:', value);
      return;
    }
    
    const currentValues = filters[filterKey];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    console.log(`[AdvancedFilters] Updating ${filterKey}:`, {
      action: checked ? 'add' : 'remove',
      value,
      before: currentValues,
      after: newValues
    });
    
    onFiltersChange({
      ...filters,
      [filterKey]: newValues,
      preset: null // Clear preset when manual changes are made
    });
  };

  const applyPreset = (presetId: string) => {
    let newFilters: AdvancedFilterState;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (presetId) {
      case 'high-priority':
        newFilters = {
          ...filters,
          priorityFilters: ['High'],
          preset: presetId
        };
        break;
      case 'this-month':
        newFilters = {
          ...filters,
          dateRange: { from: firstDayOfMonth, to: lastDayOfMonth },
          preset: presetId
        };
        break;
      case 'recurring-only':
        newFilters = {
          ...filters,
          statusFilters: ['Recurring'],
          preset: presetId
        };
        break;
      case 'multi-skill':
        newFilters = {
          ...filters,
          preset: presetId
        };
        break;
      default:
        return;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      skillFilters: [],
      clientFilters: [],
      priorityFilters: [],
      statusFilters: [],
      staffLiaisonFilters: [],
      dateRange: { from: undefined, to: undefined },
      preset: null
    });
  };

  const getActiveFilterCount = () => {
    return filters.skillFilters.length + 
           filters.clientFilters.length + 
           filters.priorityFilters.length + 
           filters.statusFilters.length +
           filters.staffLiaisonFilters.length +
           (filters.dateRange.from || filters.dateRange.to ? 1 : 0);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
            {/* Debug badge showing skills count */}
            <Badge variant="outline" className="text-xs">
              {validSkills.length} skills
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Quick Presets */}
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <Button
                  key={preset.id}
                  variant={filters.preset === preset.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h4 className="text-sm font-medium mb-3">Date Range</h4>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to
                    }}
                    onSelect={(range) => {
                      onFiltersChange({
                        ...filters,
                        dateRange: {
                          from: range?.from,
                          to: range?.to
                        },
                        preset: null
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({
                    ...filters,
                    dateRange: { from: undefined, to: undefined },
                    preset: null
                  })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Multi-select Filters Grid - Now with 5 columns to accommodate staff liaison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Skills Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Skills 
                <Badge variant="outline" className="ml-2 text-xs">
                  {validSkills.length} available
                </Badge>
              </h4>
              <Select onValueChange={(value) => updateMultiSelectFilter('skillFilters', value, true)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add skill..." />
                </SelectTrigger>
                <SelectContent>
                  {validSkills
                    .filter(skill => !filters.skillFilters.includes(skill))
                    .map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.skillFilters.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() => updateMultiSelectFilter('skillFilters', skill, false)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clients Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Clients</h4>
              <Select onValueChange={(value) => updateMultiSelectFilter('clientFilters', value, true)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add client..." />
                </SelectTrigger>
                <SelectContent>
                  {validClients
                    .filter(client => !filters.clientFilters.includes(client.id))
                    .map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.legalName}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.clientFilters.map(clientId => {
                  const client = validClients.find(c => c.id === clientId);
                  return (
                    <Badge key={clientId} variant="secondary" className="text-xs">
                      {client?.legalName || 'Unknown'}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => updateMultiSelectFilter('clientFilters', clientId, false)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Priority</h4>
              <Select onValueChange={(value) => updateMultiSelectFilter('priorityFilters', value, true)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add priority..." />
                </SelectTrigger>
                <SelectContent>
                  {validPriorities
                    .filter(priority => !filters.priorityFilters.includes(priority))
                    .map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.priorityFilters.map(priority => (
                  <Badge key={priority} variant="secondary" className="text-xs">
                    {priority}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() => updateMultiSelectFilter('priorityFilters', priority, false)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <Select onValueChange={(value) => updateMultiSelectFilter('statusFilters', value, true)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="adhoc">Ad-hoc</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.statusFilters.map(status => (
                  <Badge key={status} variant="secondary" className="text-xs">
                    {status}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() => updateMultiSelectFilter('statusFilters', status, false)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Staff Liaison Filter - New */}
            <div>
              <h4 className="text-sm font-medium mb-2">Staff Liaison</h4>
              <Select onValueChange={(value) => updateMultiSelectFilter('staffLiaisonFilters', value, true)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add staff..." />
                </SelectTrigger>
                <SelectContent>
                  {validStaffOptions
                    .filter(staff => !filters.staffLiaisonFilters.includes(staff.id))
                    .map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>{staff.full_name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.staffLiaisonFilters.map(staffId => {
                  const staff = validStaffOptions.find(s => s.id === staffId);
                  return (
                    <Badge key={staffId} variant="secondary" className="text-xs">
                      {staff?.full_name || 'Unknown'}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => updateMultiSelectFilter('staffLiaisonFilters', staffId, false)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilters;
