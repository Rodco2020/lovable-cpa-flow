
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { getClientById, createClient, updateClient } from '@/services/clientService';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Define form schema using Zod
const clientFormSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  primaryContact: z.string().min(1, "Primary contact is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  billingAddress: z.string().min(1, "Billing address is required"),
  industry: z.enum([
    "Retail", 
    "Healthcare", 
    "Manufacturing", 
    "Technology", 
    "Financial Services", 
    "Professional Services", 
    "Construction", 
    "Hospitality", 
    "Education", 
    "Non-Profit",
    "Other"
  ] as const),
  status: z.enum(["Active", "Inactive", "Pending", "Archived"] as const),
  expectedMonthlyRevenue: z.coerce.number().positive("Revenue must be positive"),
  paymentTerms: z.enum(["Net15", "Net30", "Net45", "Net60"] as const),
  billingFrequency: z.enum(["Monthly", "Quarterly", "Annually", "Project-Based"] as const),
  defaultTaskPriority: z.string().min(1, "Default task priority is required"),
  notificationPreferences: z.object({
    emailReminders: z.boolean().default(true),
    taskNotifications: z.boolean().default(true),
  }),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;
  
  // Fetch client data if in edit mode
  const client = isEditMode ? getClientById(id!) : null;
  
  // Initialize form with client data or defaults
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: isEditMode && client ? {
      legalName: client.legalName,
      primaryContact: client.primaryContact,
      email: client.email,
      phone: client.phone,
      billingAddress: client.billingAddress,
      industry: client.industry,
      status: client.status,
      expectedMonthlyRevenue: client.expectedMonthlyRevenue,
      paymentTerms: client.paymentTerms,
      billingFrequency: client.billingFrequency,
      defaultTaskPriority: client.defaultTaskPriority,
      notificationPreferences: {
        emailReminders: client.notificationPreferences.emailReminders,
        taskNotifications: client.notificationPreferences.taskNotifications,
      },
    } : {
      legalName: "",
      primaryContact: "",
      email: "",
      phone: "",
      billingAddress: "",
      industry: "Other" as IndustryType,
      status: "Active" as ClientStatus,
      expectedMonthlyRevenue: 0,
      paymentTerms: "Net30" as PaymentTerms,
      billingFrequency: "Monthly" as BillingFrequency,
      defaultTaskPriority: "Medium",
      notificationPreferences: {
        emailReminders: true,
        taskNotifications: true,
      },
    }
  });
  
  const onSubmit = (data: ClientFormValues) => {
    // Create a properly typed client data object that meets the required interfaces
    const clientData = {
      legalName: data.legalName,
      primaryContact: data.primaryContact,
      email: data.email,
      phone: data.phone,
      billingAddress: data.billingAddress, 
      industry: data.industry as IndustryType,
      status: data.status as ClientStatus,
      expectedMonthlyRevenue: data.expectedMonthlyRevenue,
      paymentTerms: data.paymentTerms as PaymentTerms,
      billingFrequency: data.billingFrequency as BillingFrequency,
      defaultTaskPriority: data.defaultTaskPriority,
      notificationPreferences: {
        emailReminders: data.notificationPreferences.emailReminders,
        taskNotifications: data.notificationPreferences.taskNotifications,
      },
    };

    if (isEditMode && client) {
      updateClient(client.id, clientData);
      toast({
        title: "Client updated",
        description: `${data.legalName} has been updated successfully.`,
      });
    } else {
      createClient(clientData);
      toast({
        title: "Client created",
        description: `${data.legalName} has been added successfully.`,
      });
    }
    navigate('/clients');
  };

  // Redirect if client not found in edit mode
  if (isEditMode && !client) {
    navigate('/clients');
    return null;
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/clients')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <CardTitle>{isEditMode ? 'Edit Client' : 'Add New Client'}</CardTitle>
        <CardDescription>
          {isEditMode 
            ? 'Update client information and preferences'
            : 'Enter client details to create a new client profile'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client's legal name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact*</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of primary contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" type="email" {...field} />
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
                        <FormLabel>Phone*</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="billingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Address*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Full billing address" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Financial Services">Financial Services</SelectItem>
                            <SelectItem value="Professional Services">Professional Services</SelectItem>
                            <SelectItem value="Construction">Construction</SelectItem>
                            <SelectItem value="Hospitality">Hospitality</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Financial & Engagement Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial & Engagement Settings</h3>
                
                <FormField
                  control={form.control}
                  name="expectedMonthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Monthly Revenue ($)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="100" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Used for revenue forecasting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Net15">Net 15</SelectItem>
                            <SelectItem value="Net30">Net 30</SelectItem>
                            <SelectItem value="Net45">Net 45</SelectItem>
                            <SelectItem value="Net60">Net 60</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="billingFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Frequency*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Annually">Annually</SelectItem>
                            <SelectItem value="Project-Based">Project-Based</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="defaultTaskPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Task Priority*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default priority for new tasks assigned to this client
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3 mt-6">
                  <h4 className="text-sm font-medium">Notification Preferences</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="emailReminders" 
                      checked={form.watch("notificationPreferences.emailReminders")}
                      onCheckedChange={(checked) => {
                        form.setValue("notificationPreferences.emailReminders", checked as boolean);
                      }}
                    />
                    <Label htmlFor="emailReminders">Email reminders for upcoming tasks</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="taskNotifications" 
                      checked={form.watch("notificationPreferences.taskNotifications")}
                      onCheckedChange={(checked) => {
                        form.setValue("notificationPreferences.taskNotifications", checked as boolean);
                      }}
                    />
                    <Label htmlFor="taskNotifications">Task status change notifications</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/clients')}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Client' : 'Save Client'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ClientForm;
