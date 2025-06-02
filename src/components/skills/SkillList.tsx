
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { getAllSkills, searchSkills } from "@/services/skills/skillsService";
import { SkillCategory, ProficiencyLevel } from "@/types/skill";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Eye, Edit } from "lucide-react";
import SkillSystemHealth from './SkillSystemHealth';
import SkillManagementActions from './SkillManagementActions';

const SkillList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | "all">("all");
  const [proficiencyFilter, setProficiencyFilter] = useState<ProficiencyLevel | "all">("all");

  const { data: skills = [], isLoading, error } = useQuery({
    queryKey: ["skills", searchQuery, categoryFilter, proficiencyFilter],
    queryFn: async () => {
      console.log("Fetching skills with filters:", { searchQuery, categoryFilter, proficiencyFilter });
      
      if (searchQuery) {
        const results = await searchSkills(searchQuery);
        console.log("Search results:", results);
        return results;
      }
      
      const allSkills = await getAllSkills();
      console.log("All skills fetched:", allSkills);
      
      return allSkills.filter(skill => 
        (categoryFilter === "all" || skill.category === categoryFilter) &&
        (proficiencyFilter === "all" || skill.proficiencyLevel === proficiencyFilter)
      );
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will re-run automatically when searchQuery changes
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setProficiencyFilter("all");
  };

  const handleViewSkill = (skillId: string) => {
    console.log("Navigating to skill detail:", skillId);
    navigate(`/skills/${skillId}`);
  };

  const handleEditSkill = (skillId: string) => {
    console.log("Navigating to skill edit:", skillId);
    navigate(`/skills/${skillId}/edit`);
  };

  const categories: SkillCategory[] = ["Tax", "Audit", "Advisory", "Bookkeeping", "Compliance", "Administrative", "Other"];
  const proficiencyLevels: ProficiencyLevel[] = ["Beginner", "Intermediate", "Expert"];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">Loading skills data...</div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading skills:", error);
    return (
      <div className="container mx-auto py-6 space-y-6">
        <SkillSystemHealth />
        <div className="text-center text-red-500 py-8">
          Error loading skills data. Please check the system health above.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Skills Management</h1>
        <Button onClick={() => navigate("/skills/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Skill
        </Button>
      </div>

      <SkillSystemHealth />
      
      <SkillManagementActions currentSkills={skills} />

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex gap-3">
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as SkillCategory | "all")}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" /> 
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={proficiencyFilter} onValueChange={(value) => setProficiencyFilter(value as ProficiencyLevel | "all")}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" /> 
                <SelectValue placeholder="Proficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proficiency Levels</SelectItem>
                {proficiencyLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(categoryFilter !== "all" || proficiencyFilter !== "all") && (
              <Button variant="ghost" onClick={resetFilters}>Clear Filters</Button>
            )}
          </div>
        </div>
      </Card>
      
      {skills.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <div className="text-lg text-muted-foreground">No skills found</div>
          <Button variant="link" onClick={() => navigate("/skills/new")}>Add your first skill</Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Proficiency Level</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell className="font-medium">{skill.name}</TableCell>
                <TableCell>{skill.category || "-"}</TableCell>
                <TableCell>
                  {skill.proficiencyLevel && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      skill.proficiencyLevel === "Expert" 
                        ? "bg-blue-100 text-blue-800" 
                        : skill.proficiencyLevel === "Intermediate"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                    }`}>
                      {skill.proficiencyLevel}
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{skill.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewSkill(skill.id)}
                      title="View skill details"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditSkill(skill.id)}
                      title="Edit skill"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default SkillList;
