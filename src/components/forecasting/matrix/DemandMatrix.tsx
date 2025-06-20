import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { DemandMatrixExportDialog } from './components/demand/DemandMatrixExportDialog';
import { getDemandMatrixData } from '@/services/forecasting/demandService';
import { DemandMatrixData, DemandMatrixMode } from '@/types/demand';

interface DemandMatrixProps {
  groupingMode: 'skill' | 'client';
}

export const DemandMatrix: React.FC<DemandMatrixProps> = ({ groupingMode }) => {
  const [data, setData] = useState<DemandMatrixData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedPreferredStaff, setSelectedPreferredStaff] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<string[]>([]);
  const [availablePreferredStaff, setAvailablePreferredStaff] = useState<string[]>([]);
  const [monthRange, setMonthRange] = useState({ start: 0, end: 11 });
  const [matrixMode, setMatrixMode] = useState<DemandMatrixMode>('demand-only');
  const [isAllSkillsSelected, setIsAllSkillsSelected] = useState(true);
  const [isAllClientsSelected, setIsAllClientsSelected] = useState(true);
  const [isAllPreferredStaffSelected, setIsAllPreferredStaffSelected] = useState(true);

  useEffect(() => {
    loadDemandData();
  }, [groupingMode]);

  const loadDemandData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const demandData = await getDemandMatrixData(groupingMode);
      setData(demandData);
      setAvailableSkills(demandData.skills);
      setAvailableClients(Array.from(new Set(demandData.dataPoints.flatMap(dp => dp.taskBreakdown?.map(tb => tb.clientId) || []))));
      setAvailablePreferredStaff(Array.from(new Set(demandData.dataPoints.flatMap(dp => dp.taskBreakdown?.filter(tb => tb.preferredStaff).map(tb => tb.preferredStaff!.staffId) || []))));
      setSelectedSkills(demandData.skills);
      setSelectedClients(Array.from(new Set(demandData.dataPoints.flatMap(dp => dp.taskBreakdown?.map(tb => tb.clientId) || []))));
      setSelectedPreferredStaff(Array.from(new Set(demandData.dataPoints.flatMap(dp => dp.taskBreakdown?.filter(tb => tb.preferredStaff).map(tb => tb.preferredStaff!.staffId) || []))));
      setIsAllSkillsSelected(true);
      setIsAllClientsSelected(true);
      setIsAllPreferredStaffSelected(true);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillSelect = (skill: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
    setIsAllSkillsSelected(false);
  };

  const handleClientSelect = (client: string) => {
    setSelectedClients(prev => {
      if (prev.includes(client)) {
        return prev.filter(c => c !== client);
      } else {
        return [...prev, client];
      }
    });
    setIsAllClientsSelected(false);
  };

  const handlePreferredStaffSelect = (staff: string) => {
    setSelectedPreferredStaff(prev => {
      if (prev.includes(staff)) {
        return prev.filter(s => s !== staff);
      } else {
        return [...prev, staff];
      }
    });
    setIsAllPreferredStaffSelected(false);
  };

  const handleMonthRangeChange = (range: number[]) => {
    setMonthRange({ start: range[0], end: range[1] });
  };

  const handleToggleGrouping = () => {
    // Reload data with the new grouping mode
    loadDemandData();
  };

  const handleExport = (config: any) => {
    console.log('Export configuration:', config);
    // Export functionality will be implemented here
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading demand data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading demand data: {error.message}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredData = data ? {
    ...data,
    dataPoints: data.dataPoints.filter(dp =>
      (selectedSkills.length === 0 || selectedSkills.includes(dp.skillType)) &&
      (selectedClients.length === 0 || dp.taskBreakdown?.some(tb => selectedClients.includes(tb.clientId)))
    )
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-x-4">
          <Select value={matrixMode} onValueChange={(value: DemandMatrixMode) => setMatrixMode(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="demand-only">Demand Only</SelectItem>
              <SelectItem value="capacity-vs-demand">Capacity vs Demand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="skills">Skills:</Label>
          <div className="grid gap-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {availableSkills.map(skill => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={() => handleSkillSelect(skill)}
                />
                <Label htmlFor={`skill-${skill}`}>{skill}</Label>
              </div>
            ))}
          </div>
          <Label htmlFor="clients">Clients:</Label>
          <div className="grid gap-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {availableClients.map(client => (
              <div key={client} className="flex items-center space-x-2">
                <Checkbox
                  id={`client-${client}`}
                  checked={selectedClients.includes(client)}
                  onCheckedChange={() => handleClientSelect(client)}
                />
                <Label htmlFor={`client-${client}`}>{client}</Label>
              </div>
            ))}
          </div>
          <Label htmlFor="preferredStaff">Preferred Staff:</Label>
          <div className="grid gap-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {availablePreferredStaff.map(staff => (
              <div key={staff} className="flex items-center space-x-2">
                <Checkbox
                  id={`staff-${staff}`}
                  checked={selectedPreferredStaff.includes(staff)}
                  onCheckedChange={() => handlePreferredStaffSelect(staff)}
                />
                <Label htmlFor={`staff-${staff}`}>{staff}</Label>
              </div>
            ))}
          </div>
          <Label htmlFor="month-range">Month Range:</Label>
          <Slider
            id="month-range"
            defaultValue={[monthRange.start, monthRange.end]}
            min={0}
            max={11}
            step={1}
            onValueChange={(range) => handleMonthRangeChange(range)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Demand Matrix ({groupingMode === 'skill' ? 'By Skill' : 'By Client'})</CardTitle>
            <div className="flex items-center space-x-2">
              <DemandMatrixExportDialog
                demandData={data || {
                  dataPoints: [],
                  skills: [],
                  months: [],
                  totalDemand: 0,
                  totalTasks: 0,
                  totalClients: 0,
                  skillSummary: {}
                }}
                currentFilters={{
                  skills: selectedSkills.length === availableSkills.length ? undefined : selectedSkills,
                  clients: selectedClients.length === availableClients.length ? undefined : selectedClients,
                  preferredStaff: selectedPreferredStaff.length === 0 ? undefined : {
                    staffIds: selectedPreferredStaff,
                    includeUnassigned: false,
                    showOnlyPreferred: false
                  }
                }}
                onExport={handleExport}
                groupingMode={groupingMode}
                selectedSkills={selectedSkills}
                selectedClients={selectedClients}
                selectedPreferredStaff={selectedPreferredStaff}
                monthRange={monthRange}
                availableSkills={availableSkills}
                availableClients={availableClients.map(client => ({ id: client, name: client }))}
                availablePreferredStaff={availablePreferredStaff.map(staff => ({ id: staff, name: staff }))}
                isAllSkillsSelected={selectedSkills.length === availableSkills.length}
                isAllClientsSelected={selectedClients.length === availableClients.length}
                isAllPreferredStaffSelected={selectedPreferredStaff.length === availablePreferredStaff.length}
              >
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </DemandMatrixExportDialog>
              <Button variant="outline" size="sm" onClick={handleToggleGrouping}>
                {groupingMode === 'skill' ? 'Group by Client' : 'Group by Skill'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredData ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {groupingMode === 'skill' ? 'Skill' : 'Client'}
                  </th>
                  {filteredData.months.map(month => (
                    <th key={month.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {month.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupingMode === 'skill' ? (
                  filteredData.skills.map(skill => (
                    <tr key={skill}>
                      <td className="px-6 py-4 whitespace-nowrap">{skill}</td>
                      {filteredData.months.map(month => {
                        const dataPoint = filteredData.dataPoints.find(dp => dp.skillType === skill && dp.month === month.key);
                        return (
                          <td key={month.key} className="px-6 py-4 whitespace-nowrap">
                            {dataPoint ? dataPoint.demandHours : 0}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {filteredData.skillSummary[skill]?.totalHours || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  availableClients.map(client => (
                    <tr key={client}>
                      <td className="px-6 py-4 whitespace-nowrap">{client}</td>
                      {filteredData.months.map(month => {
                        const totalHours = filteredData.dataPoints
                          .filter(dp => dp.month === month.key)
                          .flatMap(dp => dp.taskBreakdown || [])
                          .filter(task => task.clientId === client)
                          .reduce((sum, task) => sum + task.monthlyHours, 0);
                        return (
                          <td key={month.key} className="px-6 py-4 whitespace-nowrap">
                            {totalHours}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Add total calculation for client here if needed */}
                        0
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <p>No data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandMatrix;
