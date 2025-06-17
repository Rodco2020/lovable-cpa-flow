# Preferred Staff Feature - Technical Documentation

## Overview
The Preferred Staff feature allows users to assign a preferred staff member to recurring tasks. This optional assignment helps optimize task scheduling by indicating which staff member should be prioritized when assigning tasks.

## Database Schema Changes

### New Column: `preferred_staff_id`
- **Table**: `recurring_tasks`
- **Type**: `UUID`
- **Nullable**: `YES`
- **Default**: `NULL`
- **Foreign Key**: References `staff(id)` with `ON DELETE SET NULL`

```sql
ALTER TABLE public.recurring_tasks 
ADD COLUMN preferred_staff_id UUID NULL;

ALTER TABLE public.recurring_tasks 
ADD CONSTRAINT fk_recurring_tasks_preferred_staff 
FOREIGN KEY (preferred_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;
```

## API Changes

### Service Layer Updates

#### `taskService.ts`
- **Modified Functions**:
  - `createRecurringTask()`: Now accepts `preferredStaffId` parameter
  - `updateRecurringTask()`: Now handles `preferredStaffId` updates
  - `getRecurringTaskById()`: Returns task with `preferredStaffId` populated

#### `staffDropdownService.ts`
- **New Service**: Provides filtered staff options for dropdown selection
- **Function**: `getActiveStaffForDropdown()`: Returns only active staff members

### Type Definitions

#### Updated Types
```typescript
interface RecurringTask {
  // ... existing fields
  preferredStaffId: string | null;
}

interface StaffOption {
  id: string;
  full_name: string;
}
```

## Component Architecture

### New Components
1. **PreferredStaffField**: Form field component for staff selection
2. **EditRecurringTaskContainer**: Container component managing task editing workflow

### Modified Components
1. **EditRecurringTaskDialog**: Updated to include preferred staff selection
2. **ClientAssignedTasksOverview**: Updated to display preferred staff assignments

## Form Integration

### Form Hook: `useEditTaskForm`
- **Updated**: Now handles `preferredStaffId` field initialization and validation
- **Validation**: Ensures valid staff ID format (UUID) or null
- **Reset Logic**: Properly resets preferred staff field on form reset

### Form Fields
- **Field Name**: `preferredStaffId`
- **Component**: Custom dropdown with "No preference" option
- **Validation**: Optional field, validates UUID format when provided

## Data Flow

### Create Workflow
1. User selects preferred staff from dropdown
2. Form validates staff ID
3. Task created with `preferredStaffId` field populated
4. Database stores association with foreign key constraint

### Update Workflow
1. Form loads existing preferred staff (if any)
2. User can change, add, or remove preferred staff
3. Update service validates and saves changes
4. UI reflects updated assignment

### Display Workflow
1. Task list queries include preferred staff data
2. Staff names resolved through staff service
3. UI displays staff name or "No preferred staff"

## Error Handling

### Validation Errors
- Invalid staff ID format
- Reference to non-existent staff member
- Network connectivity issues

### Data Integrity
- Foreign key constraint prevents invalid references
- ON DELETE SET NULL ensures data consistency when staff is removed
- Form validation prevents submission of invalid data

## Performance Considerations

### Query Optimization
- Efficient JOIN queries for staff name resolution
- Indexed foreign key for fast lookups
- Minimal impact on existing task queries

### Caching
- Staff dropdown options cached for session
- Lazy loading of staff data when needed

## Security Considerations

### Input Validation
- UUID format validation on client and server
- SQL injection protection through parameterized queries
- Authorization checks for staff access

### Data Privacy
- Staff assignments visible only to authorized users
- No sensitive staff data exposed in dropdown

## Testing Coverage

### Unit Tests
- Form validation logic
- Service layer functions
- Component rendering

### Integration Tests
- End-to-end task creation/editing workflows
- Database constraint validation
- Error handling scenarios

### Performance Tests
- Large staff list handling
- Concurrent operations
- Memory usage validation

## Backward Compatibility

### Database Migration
- Non-breaking column addition
- Nullable field ensures existing data compatibility
- Default value (NULL) for existing records

### API Compatibility
- Optional parameter in existing endpoints
- Graceful handling of missing field
- No changes to existing response structures

## Monitoring and Logging

### Key Metrics
- Form submission success rates
- Staff assignment usage patterns
- Performance impact measurements

### Error Logging
- Invalid staff ID attempts
- Database constraint violations
- Network timeout scenarios

## Deployment Checklist

### Pre-Deployment
- [ ] Database migration tested in staging
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated

### Deployment Steps
1. Apply database migration
2. Deploy application code
3. Verify functionality in production
4. Monitor error logs and performance

### Post-Deployment
- [ ] Verify preferred staff functionality
- [ ] Check database constraints
- [ ] Monitor performance metrics
- [ ] Validate error handling

## Rollback Procedures

### Database Rollback
```sql
-- Remove foreign key constraint
ALTER TABLE public.recurring_tasks 
DROP CONSTRAINT fk_recurring_tasks_preferred_staff;

-- Remove column
ALTER TABLE public.recurring_tasks 
DROP COLUMN preferred_staff_id;
```

### Application Rollback
- Deploy previous version without preferred staff code
- Remove form fields and validation
- Restore original component structure

## Maintenance

### Regular Tasks
- Monitor foreign key constraint performance
- Review staff assignment usage patterns
- Update staff dropdown options as needed

### Potential Enhancements
- Staff workload balancing
- Automated staff assignment suggestions
- Integration with scheduling algorithms

## Troubleshooting

### Common Issues
1. **Staff not appearing in dropdown**: Check staff status (active/inactive)
2. **Form validation errors**: Verify UUID format and staff existence
3. **Save failures**: Check network connectivity and database constraints

### Debug Steps
1. Check browser console for client-side errors
2. Verify database constraints and data integrity
3. Review server logs for API errors
4. Test with different browsers and network conditions
