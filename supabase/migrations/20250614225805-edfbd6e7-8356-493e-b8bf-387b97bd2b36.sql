
-- Add fee_per_hour column to the skills table
ALTER TABLE public.skills 
ADD COLUMN fee_per_hour NUMERIC DEFAULT 75.00;

-- Add a comment to document the new column
COMMENT ON COLUMN public.skills.fee_per_hour IS 'Hourly fee charged to clients for tasks requiring this skill';
