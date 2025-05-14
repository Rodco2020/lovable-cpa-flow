
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skill, ProficiencyLevel, SkillCategory } from "@/types/skill";
import { getSkillById, createSkill, updateSkill } from "@/services/skillService";
import { toast } from "@/hooks/use-toast";
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
  const isEditMode = Boolean(id);

  const { data: existingSkill, isLoading: isLoadingSkill } = useQuery({
    queryKey: ["skill", id],
    queryFn: async () => {
      if (!id) return null;
      return getSkillById(id);
    },
    enabled: isEditMode,
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

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && id) {
        await updateSkill(id, data);
        toast({
          title: "Skill updated",
          description: "The skill has been updated successfully.",
        });
      } else {
        await createSkill(data);
        toast({
          title: "Skill created",
          description: "The new skill has been created successfully.",
        });
      }
      navigate("/skills");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} skill. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const categories: SkillCategory[] = ["Tax", "Audit", "Advisory", "Bookkeeping", "Compliance", "Administrative", "Other"];
  const proficiencyLevels: ProficiencyLevel[] = ["Beginner", "Intermediate", "Expert"];

  if (isEditMode && isLoadingSkill) {
    return <div className="text-center py-8">Loading skill data...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isEditMode ? "Edit Skill" : "Add New Skill"}</h1>
        <Button variant="outline" onClick={() => navigate("/skills")}>
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
              <Button type="button" variant="outline" onClick={() => navigate("/skills")}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update Skill" : "Create Skill"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SkillForm;
