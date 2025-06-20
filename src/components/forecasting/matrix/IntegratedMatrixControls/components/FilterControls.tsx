
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { FilterControlsProps } from '../types';
import { PreferredStaffFilter } from '../../components/demand/components/PreferredStaffFilter';

/**
 * Consolidated filter controls component
 * Handles skills, clients, and preferred staff filtering
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedSkills,
  selectedClients,
  selectedPreferredStaff,
  onSkillToggle,
  onClientToggle,
  onPreferredStaffToggle,
  availableSkills,
  availableClients,
  availablePreferredStaff,
  isAllSkillsSelected,
  isAllClientsSelected,
  isAllPreferredStaffSelected,
  isExpanded
}) => {
  const handleSkillSelectAll = () => {
    if (isAllSkillsSelected) {
      availableSkills.forEach(skill => onSkillToggle(skill));
    } else {
      availableSkills.forEach(skill => {
        if (!selectedSkills.includes(skill)) {
          onSkillToggle(skill);
        }
      });
    }
  };

  const handleClientSelectAll = () => {
    if (isAllClientsSelected) {
      availableClients.forEach(client => onClientToggle(client.id));
    } else {
      availableClients.forEach(client => {
        if (!selectedClients.includes(client.id)) {
          onClientToggle(client.id);
        }
      });
    }
  };

  return (
    <>
      {/* Skills Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Skills Filter</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkillSelectAll}
            className="h-6 px-2 text-xs"
          >
            {isAllSkillsSelected ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide All
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show All
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableSkills.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={isAllSkillsSelected || selectedSkills.includes(skill)}
                  onCheckedChange={() => onSkillToggle(skill)}
                />
                <label 
                  htmlFor={`skill-${skill}`} 
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={skill}
                >
                  {skill}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {!isExpanded && (
          <div className="text-xs text-muted-foreground">
            {isAllSkillsSelected ? 'All skills visible' : `${selectedSkills.length}/${availableSkills.length} skills selected`}
          </div>
        )}
      </div>

      {/* Clients Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Clients Filter</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClientSelectAll}
            className="h-6 px-2 text-xs"
          >
            {isAllClientsSelected ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide All
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show All
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableClients.map((client) => (
              <div key={client.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={isAllClientsSelected || selectedClients.includes(client.id)}
                  onCheckedChange={() => onClientToggle(client.id)}
                />
                <label 
                  htmlFor={`client-${client.id}`} 
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={client.name}
                >
                  {client.name}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {!isExpanded && (
          <div className="text-xs text-muted-foreground">
            {isAllClientsSelected ? 'All clients visible' : `${selectedClients.length}/${availableClients.length} clients selected`}
          </div>
        )}
      </div>

      {/* Preferred Staff Filter */}
      {availablePreferredStaff.length > 0 && (
        <div>
          <PreferredStaffFilter
            availablePreferredStaff={availablePreferredStaff}
            selectedPreferredStaff={selectedPreferredStaff}
            onPreferredStaffToggle={onPreferredStaffToggle}
            isAllPreferredStaffSelected={isAllPreferredStaffSelected}
          />
          
          {!isExpanded && (
            <div className="text-xs text-muted-foreground mt-1">
              {isAllPreferredStaffSelected 
                ? 'All preferred staff visible' 
                : `${selectedPreferredStaff.length}/${availablePreferredStaff.length} preferred staff selected`
              }
            </div>
          )}
        </div>
      )}
    </>
  );
};
