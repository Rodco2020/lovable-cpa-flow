
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skill, ProficiencyLevel, SkillCategory } from "@/types/skill";
import { getSkillById, createSkill, updateSkill } from "@/services/skills/skillsService";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Define the schema with required name field
const skillSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().optional(),
  proficiencyLevel: z.enum(["Beginner", "Intermediate", "Expert"] as const).optional(),
  category: z.enum(["Tax", "Audit", "Advisory", "Bookkeeping", "Compliance", "Administrative", "Other"] as const).optional(),
});

type FormValues = z.infer<typeof skillSchema>;

const SkillForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  // Add debugging for route parameters and edit mode detection
  React.useEffect(() => {
    console.log('🔧 SkillForm: Component mounted');
    console.log('🔧 Route ID parameter:', id);
    console.log('🔧 Is Edit Mode:', isEditMode);
    console.log('🔧 Current URL:', window.location.href);
    console.log('🔧 Current pathname:', window.location.pathname);
  }, [id, isEditMode]);

  const { data: existingSkill, isLoading: isLoadingSkill, error: loadError } = useQuery({
    queryKey: ["skill", id],
    queryFn: async () => {
      if (!id) return null;
      console.log("🔧 Loading skill for edit:", id);
      const skill = await getSkillById(id);
      console.log("🔧 Loaded skill:", skill);
      return skill;
    },
    enabled: isEditMode,
    retry: false
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      description: "",
      proficiencyLevel: undefined,
      category: undefined,
    },
    values: existingSkill ? {
      name: existingSkill.name,
      description: existingSkill.description || "",
      proficiencyLevel: existingSkill.proficiencyLevel,
      category: existingSkill.category,
    } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      toast.success("Skill created successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills-health-check"] });
      navigate("/skills");
    },
    onError: (error) => {
      console.error("Failed to create skill:", error);
      toast.error("Failed to create skill. Please try again.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormValues }) => updateSkill(id, data),
    onSuccess: () => {
      toast.success("Skill updated successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills-health-check"] });
      queryClient.invalidateQueries({ queryKey: ["skill", id] });
      navigate("/skills");
    },
    onError: (error) => {
      console.error("Failed to update skill:", error);
      toast.error("Failed to update skill. Please try again.");
    }
  });

  const onSubmit = async (data: FormValues) => {
    console.log('🔧 Form submission - Edit Mode:', isEditMode, 'ID:', id);
    
    const skillData = {
      name: data.name,
      description: data.description,
      proficiencyLevel: data.proficiencyLevel,
      category: data.category,
    };
    
    if (isEditMode && id) {
      console.log('🔧 Updating skill with ID:', id);
      updateMutation.mutate({ id, data: skillData });
    } else {
      console.log('🔧 Creating new skill');
      createMutation.mutate(skillData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const categories: SkillCategory[] = ["Tax", "Audit", "Advisory", "Bookkeeping", "Compliance", "Administrative", "Other"];
  const proficiencyLevels: ProficiencyLevel[] = ["Beginner", "Intermediate", "Expert"];

  if (isEditMode && isLoadingSkill) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">Loading skill data...</div>
      </div>
    );
  }

  if (isEditMode && (loadError || !existingSkill)) {
    console.error("🔧 Error loading skill for edit:", loadError);
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            {loadError instanceof Error ? loadError.message : "Skill not found"}
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
        <h1 className="text-3xl font-bold">
          {isEditMode ? `Edit Skill${existingSkill ? `: ${existingSkill.name}` : ''}` : "Add New Skill"}
        </h1>
        <Button variant="outline" onClick={() => navigate("/skills")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter skill name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proficiencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proficiency Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a proficiency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proficiencyLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter skill description"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/skills")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading 
                  ? (isEditMode ? "Updating..." : "Creating...") 
                  : (isEditMode ? "Update Skill" : "Create Skill")
                }
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SkillForm;
