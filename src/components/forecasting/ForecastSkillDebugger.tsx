
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { analyzeStaffSkills } from '@/services/skillNormalizationService';
import { getAllStaff } from '@/services/staffService';
import { SkillType } from '@/types/task';

const ForecastSkillDebugger: React.FC = () => {
  const [staffSkills, setStaffSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStaffSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get all staff members
      const allStaff = await getAllStaff();
      console.log("Loaded staff:", allStaff.length);
      
      // Analyze skills for each staff member
      const skillAnalysisPromises = allStaff.map(async (staff) => {
        const analysis = await analyzeStaffSkills(staff.assignedSkills, staff.id);
        return {
          id: staff.id,
          name: staff.fullName,
          roleTitle: staff.roleTitle,
          originalSkills: staff.assignedSkills,
          mappedSkills: analysis.mappedSkills,
          hasCPA: analysis.hasCPA,
          hasSenior: analysis.hasSenior,
          hasJunior: analysis.hasJunior,
          defaultedToJunior: analysis.defaultedToJunior,
          manualOverride: false // This property doesn't exist in the analysis result
        };
      });
      
      const skillAnalysis = await Promise.all(skillAnalysisPromises);
      setStaffSkills(skillAnalysis);
    } catch (err) {
      console.error("Failed to load staff skills:", err);
      setError("Failed to load staff skills. Check console for details.");
    } finally {
      setLoading(false);
    }
  };
  
  // Load staff skills on first render
  useEffect(() => {
    loadStaffSkills();
  }, []);
  
  // Calculate skill type counts
  const calculateSkillCounts = () => {
    const counts = {
      'Junior Staff': 0,
      'Senior Staff': 0,
      'CPA': 0
    };
    
    staffSkills.forEach(staff => {
      staff.mappedSkills.forEach((skill: SkillType) => {
        if (counts.hasOwnProperty(skill)) {
          counts[skill as keyof typeof counts]++;
        }
      });
    });
    
    return counts;
  };
  
  const skillCounts = calculateSkillCounts();

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Staff Skill Mapping Analysis</h3>
        <Button 
          onClick={loadStaffSkills} 
          size="sm" 
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Skills"}
        </Button>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="border rounded-md p-3 flex-1 bg-background">
          <p className="text-sm font-medium mb-1">Skill Type Distribution</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-100">Junior Staff: {skillCounts['Junior Staff']}</Badge>
            <Badge variant="outline" className="bg-purple-100">Senior Staff: {skillCounts['Senior Staff']}</Badge>
            <Badge variant="outline" className="bg-green-100">CPA: {skillCounts['CPA']}</Badge>
          </div>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name</TableHead>
              <TableHead>Role Title</TableHead>
              <TableHead>Original Skills</TableHead>
              <TableHead>Mapped Forecast Skills</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffSkills.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.name}</TableCell>
                <TableCell>{staff.roleTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {staff.originalSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {staff.mappedSkills.map((skill: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className={`${
                          skill === 'Junior Staff' ? 'bg-blue-100' :
                          skill === 'Senior Staff' ? 'bg-purple-100' :
                          skill === 'CPA' ? 'bg-green-100' : ''
                        }`}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {staff.manualOverride && (
                    <Badge variant="outline" className="bg-amber-100">Manual Override</Badge>
                  )}
                  {staff.defaultedToJunior && (
                    <Badge variant="outline" className="bg-orange-100">Defaulted to Junior</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {staffSkills.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No staff skills found
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <p className="text-muted-foreground">Loading staff skills...</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ForecastSkillDebugger;
