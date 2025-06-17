
-- Add preferred_staff_id column to recurring_tasks table
ALTER TABLE public.recurring_tasks 
ADD COLUMN preferred_staff_id UUID NULL;

-- Add foreign key constraint to reference staff table
ALTER TABLE public.recurring_tasks 
ADD CONSTRAINT fk_recurring_tasks_preferred_staff 
FOREIGN KEY (preferred_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.recurring_tasks.preferred_staff_id IS 
'Optional preferred staff member for this recurring task. When specified, the task should be preferentially assigned to this staff member during scheduling.';
