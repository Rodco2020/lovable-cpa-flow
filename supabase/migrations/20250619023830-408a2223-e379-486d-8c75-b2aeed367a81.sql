
-- Update the recurring task to assign Luis Rodriguez as preferred staff
UPDATE recurring_tasks 
SET preferred_staff_id = '5251bce8-7d0e-4bf4-bcfa-fcc85836b919',
    updated_at = now()
WHERE id = 'ed761f97-d317-4ea8-9f48-233c99816350';

-- Verify the update was successful
SELECT 
    rt.id,
    rt.name,
    rt.preferred_staff_id,
    s.full_name as preferred_staff_name,
    rt.updated_at
FROM recurring_tasks rt
LEFT JOIN staff s ON rt.preferred_staff_id = s.id
WHERE rt.id = 'ed761f97-d317-4ea8-9f48-233c99816350';
