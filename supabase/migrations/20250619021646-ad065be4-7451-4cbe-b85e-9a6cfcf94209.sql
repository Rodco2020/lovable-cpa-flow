
-- Enable RLS on recurring_tasks table
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

-- Allow staff members to manage all tasks
CREATE POLICY "Staff can manage all recurring tasks" ON recurring_tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE staff.email = auth.jwt() ->> 'email'
    AND staff.status = 'active'
  )
);

-- Fallback policy for service role (used by server-side operations)
CREATE POLICY "Service role can manage all recurring tasks" ON recurring_tasks
FOR ALL USING (auth.role() = 'service_role');
