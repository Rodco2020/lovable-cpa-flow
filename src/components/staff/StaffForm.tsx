
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStaffById, createStaff, updateStaff } from "@/services/staffService";
import { getAllSkills } from "@/services/skillService";
import { Staff, StaffStatus } from "@/types/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

// Form schema with Zod validation
const staffFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  roleTitle: z.string().min(1, "Role/title is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  costPerHour: z.number().positive("Cost per hour must be positive"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.enum(["active", "inactive"] as const),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

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
  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["staff", id],
    queryFn: () => getStaffById(id || ""),
    enabled: isEditMode,
  });

  // Fetch all skills from the skills service
  const { data: skills, isLoading: isLoadingSkills } = useQuery({
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

  // Mutation for creating or updating staff
  const createMutation = useMutation({
    mutationFn: (data: Omit<Staff, "id" | "createdAt" | "updatedAt">) => createStaff(data),
    onSuccess: () => {
      toast({
        title: "Staff created",
        description: "New staff member has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate("/staff");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Staff, "id" | "createdAt">> }) =>
      updateStaff(id, data),
    onSuccess: () => {
      toast({
        title: "Staff updated",
        description: "Staff information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      navigate(`/staff/${id}`);
    },
  });

  const onSubmit = (data: StaffFormValues) => {
    if (isEditMode && id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data as Omit<Staff, "id" | "createdAt" | "updatedAt">);
    }
  };

  if (isLoadingStaff) {
    return <div className="flex justify-center p-8">Loading staff data...</div>;
  }

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

              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Skills</FormLabel>
                    </div>
                    {isLoadingSkills ? (
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
                                                (value) => value !== skill.id
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

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/staff")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? "Update Staff Member" : "Create Staff Member"}
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
