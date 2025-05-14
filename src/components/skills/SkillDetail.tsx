
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getSkillById, deleteSkill } from "@/services/skillService";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash } from "lucide-react";

const SkillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: skill, isLoading, error } = useQuery({
    queryKey: ["skill", id],
    queryFn: async () => {
      if (!id) return null;
      const skill = await getSkillById(id);
      if (!skill) {
        throw new Error("Skill not found");
      }
      return skill;
    }
  });

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteSkill(id);
      toast({
        title: "Skill deleted",
        description: "The skill has been successfully removed."
      });
      navigate("/skills");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the skill. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading skill details...</div>;
  }

  if (error || !skill) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Skill not found or error loading details</div>
        <Button variant="secondary" onClick={() => navigate("/skills")}>
          Back to Skills List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{skill.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/skills">Back to List</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/skills/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the "{skill.name}" skill. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Details</CardTitle>
          <CardDescription>Complete information about this skill</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-lg">{skill.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
              <p className="text-lg">{skill.category || "Not specified"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Proficiency Level</h3>
              <p className="text-lg">
                {skill.proficiencyLevel && (
                  <span className={`px-2 py-1 rounded text-sm ${
                    skill.proficiencyLevel === "Expert" 
                      ? "bg-blue-100 text-blue-800" 
                      : skill.proficiencyLevel === "Intermediate"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                  }`}>
                    {skill.proficiencyLevel}
                  </span>
                )}
                {!skill.proficiencyLevel && "Not specified"}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="text-lg whitespace-pre-wrap">{skill.description || "No description provided"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillDetail;
