
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getSkillById, deleteSkill } from "@/services/skills/skillsService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash, ArrowLeft } from "lucide-react";

const SkillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: skill, isLoading, error } = useQuery({
    queryKey: ["skill", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Skill ID is required");
      }
      console.log("Fetching skill with ID:", id);
      const skill = await getSkillById(id);
      console.log("Fetched skill:", skill);
      if (!skill) {
        throw new Error("Skill not found");
      }
      return skill;
    },
    enabled: Boolean(id),
    retry: false
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      toast.success("Skill deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills-health-check"] });
      navigate("/skills");
    },
    onError: (error) => {
      console.error("Failed to delete skill:", error);
      toast.error("Failed to delete the skill. Please try again.");
    }
  });

  const handleDelete = async () => {
    if (!id) return;
    deleteMutation.mutate(id);
  };

  if (!id) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">Invalid skill ID</div>
          <Button variant="secondary" onClick={() => navigate("/skills")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Skills List
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">Loading skill details...</div>
      </div>
    );
  }

  if (error || !skill) {
    console.error("Error loading skill:", error);
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            {error instanceof Error ? error.message : "Skill not found or error loading details"}
          </div>
          <Button variant="secondary" onClick={() => navigate("/skills")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Skills List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{skill.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/skills">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/skills/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteMutation.isPending}>
                <Trash className="mr-2 h-4 w-4" /> 
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
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

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Skill ID</h3>
              <p className="text-sm text-muted-foreground font-mono">{skill.id}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
            <p className="text-lg whitespace-pre-wrap">{skill.description || "No description provided"}</p>
          </div>

          {skill.createdAt && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span> {new Date(skill.createdAt).toLocaleDateString()}
              </div>
              {skill.updatedAt && skill.updatedAt !== skill.createdAt && (
                <div>
                  <span className="font-medium">Updated:</span> {new Date(skill.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillDetail;
