
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Services
import { createStaff, updateStaff, getStaffById } from "@/services/staff";
import { getAllSkills } from "@/services/skillService";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Types
import { Staff, StaffStatus } from "@/types/staff";
import { Skill } from "@/types/skill";

/**
 * Form schema with Zod validation for staff member data
 */
const staffFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  roleTitle: z.string().min(1, "Role/title is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  costPerHour: z.number().positive("Cost per hour must be positive"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.enum(["active", "inactive"] as const),
});

/**
 * TypeScript type for form values derived from the schema
 */
type StaffFormValues = z.infer<typeof staffFormSchema>;

/**
 * StaffFormSkeleton - Shows a loading state while fetching data
 */
const StaffFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-center p-8">Loading staff data...</div>
    </div>
  );
};

/**
 * SkillsSection - Component for rendering the skills selection section
 */
interface SkillsSectionProps {
  form: any;
  skills: Skill[] | undefined;
  isLoading: boolean;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ form, skills, isLoading }) => {
  return (
    <FormField
      control={form.control}
      name="skills"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel>Skills</FormLabel>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
              <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {skills?.map((skill) => (
                <FormField
                  key={skill.id}
                  control={form.control}
                  name="skills"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={skill.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(skill.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, skill.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== skill.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {skill.name}
                          {skill.category && (
                            <span className="text-xs text-gray-500 block">
                              {skill.category}
                            </span>
                          )}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

/**
 * StaffForm Component - Handles creating and editing staff members
 * 
 * This component provides a form for adding new staff members or editing existing ones.
 * It uses React Hook Form with Zod for validation and TanStack Query for data fetching.
 */
const StaffForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Form setup with Zod validation
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      fullName: "",
      roleTitle: "",
      skills: [],
      costPerHour: 0,
      email: "",
      phone: "",
      status: "active",
    },
  });

  // Fetch staff data for edit mode
  const { 
    data: staff, 
    isLoading: isLoadingStaff 
  } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: isEditMode,
  });

  // Fetch all skills from the skills service
  const { 
    data: skills, 
    isLoading: isLoadingSkills 
  } = useQuery({
    queryKey: ["skills"],
    queryFn: getAllSkills,
  });

  // Populate form with existing data if in edit mode
  useEffect(() => {
    if (staff) {
      form.reset({
        fullName: staff.fullName,
        roleTitle: staff.roleTitle,
        skills: staff.skills,
        costPerHour: staff.costPerHour,
        email: staff.email,
        phone: staff.phone,
        status: staff.status,
      });
    }
  }, [staff, form]);

  // Mutation for creating a new staff member
  const createMutation = useMutation({
    mutationFn: (data: Omit<Staff, "id" | "createdAt" | "updatedAt">) => createStaff(data),
    onSuccess: () => {
      toast.success("Staff member has been successfully added");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate("/staff");
    },
    onError: (error) => {
      console.error("Error creating staff member:", error);
      toast.error("Failed to create staff member");
    }
  });

  // Mutation for updating an existing staff member
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Staff, "id" | "createdAt">> }) =>
      updateStaff(id, data),
    onSuccess: () => {
      toast.success("Staff information has been successfully updated");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate(`/staff/${id}`);
    },
    onError: (error) => {
      console.error("Error updating staff member:", error);
      toast.error("Failed to update staff member");
    }
  });

  // Form submission handler
  const onSubmit = (data: StaffFormValues) => {
    // Ensure assignedSkills field is also set to match skills (for backward compatibility)
    const staffData = {
      ...data,
      assignedSkills: data.skills,
    };
    
    if (isEditMode && id) {
      updateMutation.mutate({ id, data: staffData });
    } else {
      createMutation.mutate(staffData as Omit<Staff, "id" | "createdAt" | "updatedAt">);
    }
  };

  // Show loading skeleton while fetching staff data in edit mode
  if (isLoadingStaff) {
    return <StaffFormSkeleton />;
  }

  // Render the staff form
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {isEditMode ? "Edit Staff Member" : "Add New Staff Member"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode
            ? "Update the information for this staff member"
            : "Create a new staff profile with all required information"}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information Fields */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role / Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costPerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Hour ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="active" id="active" />
                            <label htmlFor="active">Active</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="inactive" id="inactive" />
                            <label htmlFor="inactive">Inactive</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Skills Selection */}
              <SkillsSection 
                form={form}
                skills={skills}
                isLoading={isLoadingSkills}
              />

              {/* Form Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/staff")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : 
                    isEditMode ? "Update Staff Member" : "Create Staff Member"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffForm;
