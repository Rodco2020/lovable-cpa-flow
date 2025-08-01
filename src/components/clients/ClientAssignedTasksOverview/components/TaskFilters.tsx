
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, UserMinus } from 'lucide-react';
import { Client } from '@/types/client';
import { FilterState } from '../types';
import { getActiveStaff } from '@/services/staff/staffService';
import { Staff } from '@/types/staff';

interface TaskFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  clients: Client[];
  availableSkills: string[];
  availablePriorities: string[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  clients,
  availableSkills,
  availablePriorities
}) => {
  const [staffOptions, setStaffOptions] = useState<Staff[]>([]);

  // Fetch active staff for preferred staff filter
  // Phase 3: Enhanced error handling and edge case management
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const activeStaff = await getActiveStaff();
        setStaffOptions(activeStaff);
        
        console.log(`✅ [Phase 3] Loaded ${activeStaff.length} active staff for preferred staff filter`);
      } catch (error) {
        console.error('⚠️ [Phase 3] Error fetching staff options:', error);
        // Ensure we have a fallback state
        setStaffOptions([]);
      }
    };
    fetchStaff();
  }, []);
  
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

  const validSkills = React.useMemo(() => {
    if (!Array.isArray(availableSkills)) return [];
    return availableSkills.filter(skill => 
      skill && 
      typeof skill === 'string' && 
      skill.trim() !== ''
    );
  }, [availableSkills]);

  const validPriorities = React.useMemo(() => {
    if (!Array.isArray(availablePriorities)) return [];
    return availablePriorities.filter(priority => 
      priority && 
      typeof priority === 'string' && 
      priority.trim() !== ''
    );
  }, [availablePriorities]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tasks or clients..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.clientFilter}
          onValueChange={(value) => onFilterChange('clientFilter', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {validClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.legalName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.skillFilter}
          onValueChange={(value) => onFilterChange('skillFilter', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {validSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.priorityFilter}
          onValueChange={(value) => onFilterChange('priorityFilter', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {validPriorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.statusFilter}
          onValueChange={(value) => onFilterChange('statusFilter', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused/Canceled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.preferredStaffFilter}
          onValueChange={(value) => onFilterChange('preferredStaffFilter', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Preferred Staff" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff</SelectItem>
            <SelectItem value="no-staff">
              <div className="flex items-center gap-2">
                <UserMinus className="h-4 w-4" />
                No Staff Assigned
              </div>
            </SelectItem>
            <div className="h-px bg-border my-1" />
            {staffOptions.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={onResetFilters}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
