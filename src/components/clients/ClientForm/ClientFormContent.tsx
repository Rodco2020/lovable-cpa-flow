
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useClientForm } from '@/hooks/useClientForm';
import BasicInformationSection from './BasicInformationSection';
import FinancialSettingsSection from './FinancialSettingsSection';
import ClientFormLoading from './ClientFormLoading';

/**
 * ClientFormContent component
 * 
 * The main implementation of the client form interface.
 * Features:
 * - Create new clients with default values
 * - Edit existing clients with pre-populated fields
 * - Validate form input using zod schema
 * - Basic and financial information sections
 * - Staff liaison selection
 * - Notification preferences
 */
const ClientFormContent: React.FC = () => {
  const {
    form,
    isEditMode,
    isLoading,
    isClientLoading,
    staffOptions,
    onSubmit,
    navigate
  } = useClientForm();
  
  // Show loading state
  if (isClientLoading) {
    return <ClientFormLoading />;
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
              {/* Basic Information Section */}
              <BasicInformationSection form={form} />
              
              {/* Financial & Engagement Settings Section */}
              <FinancialSettingsSection 
                form={form} 
                staffOptions={staffOptions}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/clients')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Client' : 'Save Client'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ClientFormContent;
