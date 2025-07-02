-- Phase 3: Enable real-time updates for task tables
-- Enable replica identity to capture complete row data during updates
ALTER TABLE recurring_tasks REPLICA IDENTITY FULL;
ALTER TABLE task_instances REPLICA IDENTITY FULL;
ALTER TABLE clients REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE task_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;