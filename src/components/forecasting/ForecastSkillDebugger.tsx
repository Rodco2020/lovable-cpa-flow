
import React, { useState, useEffect } from 'react';
import { normalizeSkills, analyzeStaffSkills } from '@/services/skillNormalizationService';
import { getAllStaff } from '@/services/staffService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Staff } from '@/types/staff';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ForecastSkillDebugger: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        setLoading(true);
        const staffData = await getAllStaff();
        setStaff(staffData.filter(s => s.status === 'active'));
        
        // Analyze staff skills
        const analysis = staffData
          .filter(s => s.status === 'active')
          .map(s => ({
            id: s.id,
            name: s.fullName,
            rawSkills: s.skills,
            analysis: analyzeStaffSkills(s.skills)
          }));
        
        setSkillAnalysis(analysis);
        setLoading(false);
      } catch (error) {
        console.error("Error loading staff for skill analysis:", error);
        setLoading(false);
      }
    };
    
    loadStaff();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Skill Mapping Debugger
          <Button variant="outline" size="sm" onClick={() => setShowDetail(!showDetail)}>
            {showDetail ? "Hide Details" : "Show Details"}
          </Button>
        </CardTitle>
        <CardDescription>
          Analyze how staff skills are mapped to standard forecast skill types
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading staff data...</div>
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
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="border rounded p-2">
                <h3 className="font-medium mb-2">Staff with Senior</h3>
                <div className="space-y-1">
                  {skillAnalysis
                    .filter(s => s.analysis.hasSenior)
                    .map(s => (
                      <div key={s.id} className="text-sm">{s.name}</div>
                    ))
                  }
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
                  </tr>
                </thead>
                <tbody>
                  {skillAnalysis.map(item => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">
                        {item.rawSkills.length > 0 ? item.rawSkills.join(', ') : <em>None</em>}
                      </td>
                      <td className="p-2">
                        {item.analysis.mappedSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="mr-1">{skill}</Badge>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
              * Staff with no explicit skills are defaulted to "Junior" to ensure they have capacity
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastSkillDebugger;
