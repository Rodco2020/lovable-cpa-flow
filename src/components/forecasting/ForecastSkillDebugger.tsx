
import React, { useState, useEffect } from 'react';
import { normalizeSkills, analyzeStaffSkills } from '@/services/skillNormalizationService';
import { getAllStaff } from '@/services/staffService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Staff } from '@/types/staff';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ForecastSkillDebugger: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Debug - Starting to fetch staff data for skill analysis");
      const staffData = await getAllStaff();
      console.log("Debug - Staff data fetched:", staffData);
      
      if (!staffData || staffData.length === 0) {
        console.warn("No staff data found for skill analysis");
        setError("No staff members found in the database");
        setStaff([]);
        setSkillAnalysis([]);
        setLoading(false);
        return;
      }
      
      const activeStaff = staffData.filter(s => s.status === 'active');
      setStaff(activeStaff);
      
      // Analyze staff skills - now passing staff ID to the analyze function
      const analysis = activeStaff.map(s => ({
        id: s.id,
        name: s.fullName,
        rawSkills: s.skills,
        analysis: analyzeStaffSkills(s.skills, s.id)
      }));
      
      console.log("Debug - Skill analysis complete:", analysis);
      setSkillAnalysis(analysis);
      setLoading(false);
    } catch (error) {
      console.error("Error loading staff for skill analysis:", error);
      setError("Failed to load staff data: " + (error instanceof Error ? error.message : String(error)));
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadStaffData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Skill Mapping Debugger
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadStaffData} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh Data
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDetail(!showDetail)}>
              {showDetail ? "Hide Details" : "Show Details"}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Analyze how staff skills are mapped to standard forecast skill types
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading staff data...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium">Error loading staff data</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                onClick={loadStaffData}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            </div>
          </div>
        ) : skillAnalysis.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No staff members found to analyze
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="border rounded p-2">
                <h3 className="font-medium mb-2">Staff with Junior</h3>
                <div className="space-y-1">
                  {skillAnalysis
                    .filter(s => s.analysis.hasJunior)
                    .map(s => (
                      <div key={s.id} className="text-sm">
                        {s.name}
                        {s.analysis.defaultedToJunior && (
                          <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                        )}
                        {s.analysis.manualOverride && (
                          <Badge variant="destructive" className="ml-2 text-xs">Override</Badge>
                        )}
                      </div>
                    ))
                  }
                  {skillAnalysis.filter(s => s.analysis.hasJunior).length === 0 && (
                    <div className="text-sm text-muted-foreground italic">None</div>
                  )}
                </div>
              </div>
              <div className="border rounded p-2">
                <h3 className="font-medium mb-2">Staff with Senior</h3>
                <div className="space-y-1">
                  {skillAnalysis
                    .filter(s => s.analysis.hasSenior)
                    .map(s => (
                      <div key={s.id} className="text-sm">
                        {s.name}
                        {s.analysis.manualOverride && (
                          <Badge variant="destructive" className="ml-2 text-xs">Override</Badge>
                        )}
                      </div>
                    ))
                  }
                  {skillAnalysis.filter(s => s.analysis.hasSenior).length === 0 && (
                    <div className="text-sm text-muted-foreground italic">None</div>
                  )}
                </div>
              </div>
              <div className="border rounded p-2">
                <h3 className="font-medium mb-2">Staff with CPA</h3>
                <div className="space-y-1">
                  {skillAnalysis
                    .filter(s => s.analysis.hasCPA)
                    .map(s => (
                      <div key={s.id} className="text-sm">{s.name}</div>
                    ))
                  }
                  {skillAnalysis.filter(s => s.analysis.hasCPA).length === 0 && (
                    <div className="text-sm text-muted-foreground italic">None</div>
                  )}
                </div>
              </div>
            </div>
            
            {showDetail && (
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Staff</th>
                    <th className="text-left p-2">Raw Skills</th>
                    <th className="text-left p-2">Mapped Skills</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {skillAnalysis.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">
                        {item.rawSkills && item.rawSkills.length > 0 ? item.rawSkills.join(', ') : <em>None</em>}
                      </td>
                      <td className="p-2">
                        {item.analysis.mappedSkills && item.analysis.mappedSkills.length > 0 ? (
                          item.analysis.mappedSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="mr-1">{skill}</Badge>
                          ))
                        ) : (
                          <em>None</em>
                        )}
                      </td>
                      <td className="p-2">
                        {item.analysis.manualOverride && (
                          <Badge variant="destructive">Manual Override</Badge>
                        )}
                        {item.analysis.defaultedToJunior && !item.analysis.manualOverride && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
              * Staff with no explicit skills are defaulted to "Junior" to ensure they have capacity
              <br />
              * Some staff members may have manual overrides for specific skill mapping
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-md text-sm border">
              <h4 className="font-semibold mb-1">Database Debug Info:</h4>
              <p>Total active staff in database: {staff.length}</p>
              <p>Staff with skill analysis: {skillAnalysis.length}</p>
              <p className="text-xs mt-1 text-slate-500">Last refresh: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastSkillDebugger;
