
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { useClientForm } from '@/hooks/useClientForm';
import BasicInformationSection from '@/components/clients/ClientForm/BasicInformationSection';
import FinancialSettingsSection from '@/components/clients/ClientForm/FinancialSettingsSection';

/**
 * Client form component
 * 
 * Allows creating new clients or editing existing ones with form validation
 */
const ClientForm: React.FC = () => {
  const { 
    form, 
    isEditMode, 
    isLoading, 
    isClientLoading,
    staffOptions,
    onSubmit,
    navigate 
  } = useClientForm();
  
  if (isClientLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading client data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/clients')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <CardTitle>{isEditMode ? 'Edit Client' : 'Add New Client'}</CardTitle>
        </div>
        <CardDescription>
          {isEditMode 
            ? 'Update client information and preferences'
            : 'Enter client details to add them to your system'
          }
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <BasicInformationSection form={form} />
            
            <Separator />
            
            <FinancialSettingsSection 
              form={form} 
              staffOptions={staffOptions} 
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="ml-auto"
            >
              <Save className="h-4 w-4 mr-1" />
              {isLoading ? 'Saving...' : 'Save Client'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ClientForm;
