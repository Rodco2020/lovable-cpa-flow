
# Phase 7: Manual Testing Plan for Preferred Staff Feature

## Overview
This manual testing plan provides comprehensive guidance for testing the preferred staff feature end-to-end. It covers all workflows, edge cases, and error scenarios to ensure the feature meets all integration criteria.

## Pre-Test Setup

### Database Setup
1. Ensure you have at least 5 active staff members in the database
2. Verify there are existing recurring tasks (both with and without preferred staff)
3. Confirm client data is properly set up

### Test Environment
- Browser: Latest Chrome/Firefox/Safari
- Network: Both fast and slow connections should be tested
- User Role: Admin/Staff with task management permissions

## Test Scenarios

### 1. Complete Workflow Testing

#### Scenario 1.1: Create New Recurring Task with Preferred Staff
**Objective**: Test database → service → form → UI → submission → database workflow

**Steps**:
1. Navigate to Client Detail page
2. Click "Create New Task" or similar action
3. Fill in basic task information:
   - Name: "Manual Test Task 1"
   - Description: "Testing preferred staff assignment"
   - Estimated Hours: 3
   - Priority: High
   - Category: Advisory
4. Select required skills (at least one)
5. Set up recurrence pattern (Monthly, 15th of month)
6. In Preferred Staff dropdown, select a staff member
7. Submit the form
8. Verify task appears in task list with preferred staff shown
9. Edit the task to confirm preferred staff is persisted

**Expected Results**:
- Form submits successfully
- Task appears in list with preferred staff member displayed
- Data persists correctly in database
- No console errors

#### Scenario 1.2: Edit Existing Task to Add Preferred Staff
**Steps**:
1. Find a recurring task without preferred staff
2. Click Edit action
3. Navigate to Preferred Staff field
4. Select a staff member from dropdown
5. Save changes
6. Verify staff assignment is displayed
7. Refresh page and confirm persistence

**Expected Results**:
- Dropdown loads all active staff members
- Selection saves successfully
- UI updates to show assigned staff
- Data persists after page refresh

#### Scenario 1.3: Change Preferred Staff Assignment
**Steps**:
1. Find a recurring task with preferred staff assigned
2. Click Edit action
3. Change preferred staff to different staff member
4. Save changes
5. Verify new assignment is displayed

**Expected Results**:
- Current assignment is shown in dropdown
- New selection saves successfully
- UI reflects the change immediately

#### Scenario 1.4: Remove Preferred Staff Assignment
**Steps**:
1. Find a recurring task with preferred staff assigned
2. Click Edit action
3. Select "No preference" in dropdown
4. Save changes
5. Verify assignment is removed

**Expected Results**:
- Option to remove assignment is available
- Removal saves successfully
- UI shows "No preferred staff" or similar

### 2. Edge Cases Testing

#### Scenario 2.1: Editing Tasks with No Preferred Staff
**Steps**:
1. Find task without preferred staff
2. Edit the task
3. Verify preferred staff field shows "No preference"
4. Make other changes (name, hours, etc.) without touching staff field
5. Save changes

**Expected Results**:
- Field clearly indicates no staff assigned
- Other fields save correctly
- Preferred staff remains null

#### Scenario 2.2: Large Staff List Performance
**Steps**:
1. Ensure system has 50+ staff members
2. Open edit dialog for any task
3. Click on preferred staff dropdown
4. Scroll through the list
5. Search/filter if available
6. Select a staff member

**Expected Results**:
- Dropdown loads within 2 seconds
- Scrolling is smooth
- Search/filter works correctly
- Selection works properly

#### Scenario 2.3: Mixed Staff Status (Active/Inactive)
**Steps**:
1. Verify some staff members are marked as inactive
2. Edit a task
3. Check preferred staff dropdown
4. Verify only active staff appear

**Expected Results**:
- Only active staff members are shown
- Inactive staff are excluded from dropdown

### 3. Error Scenarios Testing

#### Scenario 3.1: Staff Member Deleted While Assigned
**Setup**: Assign a staff member to a task, then deactivate/delete that staff member

**Steps**:
1. Edit the task with deleted staff assignment
2. Observe behavior in preferred staff field
3. Try to save the task
4. Verify error handling

**Expected Results**:
- Form loads without crashing
- Clear indication that assigned staff is no longer available
- Option to select new staff or remove assignment
- Graceful error handling

#### Scenario 3.2: Network Issues During Staff Loading
**Setup**: Use browser dev tools to simulate slow/failed network

**Steps**:
1. Open edit dialog
2. Throttle network to slow 3G or disable
3. Observe preferred staff dropdown behavior
4. Restore network and test recovery

**Expected Results**:
- Loading indicator shown
- Error message for failed loads
- Graceful recovery when network restored
- Form remains functional

#### Scenario 3.3: Invalid Staff ID Scenarios
**Setup**: Use browser dev tools to modify form data

**Steps**:
1. Open edit dialog
2. Use browser inspector to modify preferred staff value to invalid ID
3. Try to submit form
4. Observe validation behavior

**Expected Results**:
- Client-side validation catches invalid IDs
- Server-side validation provides clear error
- Form prevents submission with invalid data

### 4. Performance Testing

#### Scenario 4.1: Form Loading Performance
**Steps**:
1. Open edit dialog for task with preferred staff
2. Measure time from click to fully loaded form
3. Test with both small and large staff lists
4. Test on slow devices/networks

**Expected Results**:
- Form loads within 2 seconds on normal connection
- Performance degrades gracefully on slow connections
- No significant lag with large staff lists

#### Scenario 4.2: Multiple Concurrent Operations
**Steps**:
1. Open multiple browser tabs
2. Edit different tasks simultaneously
3. Update preferred staff assignments
4. Save all changes
5. Verify data consistency

**Expected Results**:
- All operations complete successfully
- No data corruption or conflicts
- UI remains responsive

### 5. Data Integrity Verification

#### Scenario 5.1: Data Persistence Across Sessions
**Steps**:
1. Create/edit tasks with various preferred staff settings
2. Log out and log back in
3. Verify all assignments are preserved
4. Check task list displays
5. Re-edit tasks to confirm data

**Expected Results**:
- All preferred staff assignments persist
- No data loss across sessions
- Consistent display in all views

#### Scenario 5.2: Bulk Operations Impact
**Steps**:
1. Perform bulk operations on tasks (if available)
2. Verify preferred staff assignments are preserved
3. Check that bulk operations don't affect preferred staff

**Expected Results**:
- Preferred staff data unaffected by bulk operations
- No unexpected changes to assignments

### 6. Regression Testing

#### Scenario 6.1: Existing Task Functionality
**Steps**:
1. Test all existing task operations without touching preferred staff:
   - Create task without preferred staff
   - Edit task name, description, hours
   - Change recurrence patterns
   - Update skills and priorities
   - Delete tasks
2. Verify all operations work as before

**Expected Results**:
- All existing functionality works unchanged
- No regressions in task management
- Form behavior consistent with previous version

#### Scenario 6.2: Integration with Other Features
**Steps**:
1. Test task generation from recurring tasks
2. Verify task instance creation preserves preferred staff
3. Check scheduling features (if available)
4. Test reporting features with preferred staff data

**Expected Results**:
- Integration points work correctly
- Preferred staff data flows through system
- No conflicts with other features

## Success Criteria Checklist

### ✅ All workflows function correctly end-to-end
- [ ] Create new task with preferred staff
- [ ] Edit existing task to add preferred staff
- [ ] Change preferred staff assignment
- [ ] Remove preferred staff assignment
- [ ] All operations save and persist correctly

### ✅ Data integrity maintained throughout all operations
- [ ] No data corruption during updates
- [ ] Preferred staff IDs remain valid
- [ ] Null assignments handled correctly
- [ ] Data persists across sessions

### ✅ Performance meets acceptable standards
- [ ] Form loads within 2 seconds
- [ ] Staff dropdown performs well with large lists
- [ ] Multiple concurrent operations work smoothly
- [ ] No memory leaks or performance degradation

### ✅ No regressions in existing recurring task functionality
- [ ] All existing task operations work unchanged
- [ ] Recurrence patterns unaffected
- [ ] Skills and priorities work correctly
- [ ] Task generation and scheduling unaffected

## Test Data Requirements

### Minimum Test Data
- 5+ active staff members
- 3+ inactive staff members (for testing exclusion)
- 10+ existing recurring tasks
- Tasks with various recurrence patterns
- Tasks with different skill requirements

### Test User Accounts
- Admin user with full permissions
- Staff user with limited permissions
- Users without task management permissions

## Reporting Template

```
## Test Execution Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Browser/OS]
**Test Duration**: [Time]

### Summary
- Total Scenarios: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]

### Failed Tests
[List any failed scenarios with details]

### Performance Notes
[Any performance observations]

### Recommendations
[Suggestions for improvements]

### Sign-off
[ ] All critical workflows tested
[ ] No blocking issues found
[ ] Feature ready for production
```

## Notes for Testers

1. **Clear Browser Cache**: Start each test session with a clear cache
2. **Document Issues**: Take screenshots of any unexpected behavior
3. **Test Variations**: Try different combinations of settings
4. **Edge Cases**: Pay special attention to null/empty states
5. **Cross-Browser**: Test in multiple browsers if possible
6. **Mobile**: Test responsive behavior on mobile devices
7. **Accessibility**: Verify keyboard navigation works
8. **Error States**: Don't just test happy paths

## Emergency Rollback Plan

If critical issues are found:
1. Document the issue thoroughly
2. Determine if it's blocking for production
3. Consider feature flag to disable preferred staff functionality
4. Notify development team immediately
5. Preserve test data for debugging
