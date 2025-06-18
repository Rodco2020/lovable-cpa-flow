
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const PreferredStaffDebugPanel: React.FC = () => {
  const [taskId, setTaskId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [debugResults, setDebugResults] = useState<any>(null);

  const testDirectDatabaseUpdate = async () => {
    if (!taskId || !staffId) {
      toast.error('Please enter both Task ID and Staff ID');
      return;
    }

    console.log('[Debug] Testing direct database update');
    console.log('[Debug] Task ID:', taskId);
    console.log('[Debug] Staff ID:', staffId);

    try {
      // First, get the current task
      const { data: currentTask, error: fetchError } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (fetchError) {
        console.error('[Debug] Error fetching task:', fetchError);
        toast.error('Error fetching task: ' + fetchError.message);
        return;
      }

      console.log('[Debug] Current task:', currentTask);

      // Update the preferred_staff_id directly
      const { data: updatedTask, error: updateError } = await supabase
        .from('recurring_tasks')
        .update({ 
          preferred_staff_id: staffId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        console.error('[Debug] Error updating task:', updateError);
        toast.error('Error updating task: ' + updateError.message);
        return;
      }

      console.log('[Debug] Updated task:', updatedTask);

      // Verify the update
      const { data: verifyTask, error: verifyError } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (verifyError) {
        console.error('[Debug] Error verifying task:', verifyError);
        toast.error('Error verifying task: ' + verifyError.message);
        return;
      }

      console.log('[Debug] Verified task:', verifyTask);

      setDebugResults({
        currentTask,
        updatedTask,
        verifyTask,
        success: verifyTask.preferred_staff_id === staffId
      });

      if (verifyTask.preferred_staff_id === staffId) {
        toast.success('Direct database update successful!');
      } else {
        toast.error('Direct database update failed - value not persisted');
      }

    } catch (error) {
      console.error('[Debug] Error in test:', error);
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const clearResults = () => {
    setDebugResults(null);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Preferred Staff Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="taskId">Task ID</Label>
            <Input
              id="taskId"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter task ID"
            />
          </div>
          <div>
            <Label htmlFor="staffId">Staff ID</Label>
            <Input
              id="staffId"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="Enter staff ID"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testDirectDatabaseUpdate}>
            Test Direct DB Update
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {debugResults && (
          <div className="mt-4 p-4 border rounded-lg bg-muted">
            <h4 className="font-semibold mb-2">Debug Results:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Success:</strong> {debugResults.success ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Current Task preferred_staff_id:</strong> {debugResults.currentTask?.preferred_staff_id || 'null'}
              </div>
              <div>
                <strong>Updated Task preferred_staff_id:</strong> {debugResults.updatedTask?.preferred_staff_id || 'null'}
              </div>
              <div>
                <strong>Verified Task preferred_staff_id:</strong> {debugResults.verifyTask?.preferred_staff_id || 'null'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreferredStaffDebugPanel;
