
# Preferred Staff Feature - Deployment Guide

## Pre-Deployment Checklist

### Code Review
- [ ] All code changes reviewed and approved
- [ ] Unit tests passing (100% coverage for new functionality)
- [ ] Integration tests passing
- [ ] Performance tests validated
- [ ] Security review completed

### Database Preparation
- [ ] Migration script tested in staging environment
- [ ] Backup of production database created
- [ ] Database constraints validated
- [ ] Foreign key relationships verified

### Environment Validation
- [ ] Staging environment mirrors production
- [ ] All dependencies updated
- [ ] Configuration files reviewed
- [ ] Environment variables validated

## Deployment Steps

### Step 1: Database Migration
```sql
-- Execute in production database
-- Migration: Add preferred_staff_id to recurring_tasks

BEGIN;

-- Add the new column
ALTER TABLE public.recurring_tasks 
ADD COLUMN preferred_staff_id UUID NULL;

-- Add foreign key constraint
ALTER TABLE public.recurring_tasks 
ADD CONSTRAINT fk_recurring_tasks_preferred_staff 
FOREIGN KEY (preferred_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;

-- Add column comment for documentation
COMMENT ON COLUMN public.recurring_tasks.preferred_staff_id IS 
'Optional preferred staff member for this recurring task. When specified, the task should be preferentially assigned to this staff member during scheduling.';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'recurring_tasks' AND column_name = 'preferred_staff_id';

-- Test the foreign key constraint
DO $$
BEGIN
    -- This should succeed (NULL value)
    INSERT INTO recurring_tasks (id, name, client_id, template_id, estimated_hours, required_skills, priority, category, recurrence_type, preferred_staff_id)
    VALUES (gen_random_uuid(), 'Test Task', (SELECT id FROM clients LIMIT 1), (SELECT id FROM task_templates LIMIT 1), 1, ARRAY['Test'], 'Medium', 'Test', 'Monthly', NULL);
    
    -- Clean up test record
    DELETE FROM recurring_tasks WHERE name = 'Test Task';
    
    RAISE NOTICE 'Migration completed successfully';
END $$;

COMMIT;
```

### Step 2: Application Deployment
1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Production**
   - Upload build artifacts
   - Update environment configuration
   - Restart application services

3. **Verify Deployment**
   - Check application startup logs
   - Verify database connectivity
   - Test basic functionality

### Step 3: Feature Validation
1. **Smoke Tests**
   - [ ] Application loads successfully
   - [ ] User authentication works
   - [ ] Basic navigation functional

2. **Feature Tests**
   - [ ] Preferred staff dropdown loads
   - [ ] Can create task with preferred staff
   - [ ] Can edit existing task to add preferred staff
   - [ ] Can remove preferred staff assignment
   - [ ] Changes persist correctly

3. **Integration Tests**
   - [ ] Task list displays preferred staff
   - [ ] Form validation works correctly
   - [ ] Error handling functions properly
   - [ ] Performance is acceptable

## Post-Deployment Monitoring

### Key Metrics to Monitor
- Application response times
- Database query performance
- Error rates and types
- User engagement with new feature

### Monitoring Commands
```bash
# Check application logs
tail -f /var/log/application.log

# Monitor database performance
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Check foreign key constraint usage
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE conname = 'fk_recurring_tasks_preferred_staff';
```

### Success Indicators
- [ ] No increase in error rates
- [ ] Response times within acceptable limits
- [ ] Database performance stable
- [ ] Users successfully using new feature

## Rollback Procedures

### When to Rollback
- Critical bugs affecting core functionality
- Performance degradation beyond acceptable limits
- Data integrity issues
- Security vulnerabilities discovered

### Rollback Steps

#### 1. Application Rollback
```bash
# Deploy previous version
git checkout [previous-stable-tag]
npm run build
# Deploy previous build
```

#### 2. Database Rollback (if necessary)
```sql
-- Only if database issues require column removal
-- CAUTION: This will lose all preferred staff assignments

BEGIN;

-- Remove foreign key constraint
ALTER TABLE public.recurring_tasks 
DROP CONSTRAINT IF EXISTS fk_recurring_tasks_preferred_staff;

-- Remove column (DESTRUCTIVE OPERATION)
ALTER TABLE public.recurring_tasks 
DROP COLUMN IF EXISTS preferred_staff_id;

-- Verify rollback
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'recurring_tasks' AND column_name = 'preferred_staff_id';
-- Should return no rows

COMMIT;
```

### Rollback Validation
- [ ] Application functions without new feature
- [ ] No references to removed database column
- [ ] Core functionality unaffected
- [ ] User workflows operational

## Security Validation

### Security Checklist
- [ ] Input validation on all form fields
- [ ] SQL injection protection verified
- [ ] Authorization checks in place
- [ ] No sensitive data in client-side code
- [ ] Proper error messages (no data leakage)

### Security Tests
```javascript
// Test SQL injection prevention
const maliciousInput = "'; DROP TABLE staff; --";
// Verify this doesn't cause database issues

// Test authorization
// Verify users can only access their own data

// Test input validation
// Verify invalid UUIDs are rejected
```

## Performance Validation

### Performance Benchmarks
- Page load time: < 2 seconds
- Form submission: < 1 second
- Staff dropdown loading: < 500ms
- Task list rendering: < 1 second

### Performance Tests
```bash
# Load testing with curl
for i in {1..100}; do
  curl -s -o /dev/null -w "%{time_total}\n" http://yourapp.com/api/staff/dropdown
done

# Database query performance
EXPLAIN ANALYZE SELECT rt.*, s.full_name 
FROM recurring_tasks rt 
LEFT JOIN staff s ON rt.preferred_staff_id = s.id;
```

## Communication Plan

### Stakeholder Notification
- [ ] Development team notified of deployment
- [ ] QA team ready for post-deployment testing
- [ ] Support team briefed on new feature
- [ ] End users informed of new capability

### Documentation Updates
- [ ] Technical documentation updated
- [ ] User guides published
- [ ] API documentation current
- [ ] Training materials prepared

## Contingency Planning

### Issue Response Team
- **Primary Contact**: [Development Lead]
- **Database Support**: [Database Administrator]
- **Infrastructure**: [DevOps Engineer]
- **Communication**: [Project Manager]

### Escalation Procedures
1. **Minor Issues**: Fix in next regular deployment
2. **Major Issues**: Hotfix deployment within 4 hours
3. **Critical Issues**: Immediate rollback consideration

### Emergency Contacts
- Development Team: [Contact Info]
- Infrastructure Team: [Contact Info]
- Management: [Contact Info]

## Success Criteria

### Technical Success
- [ ] Zero critical bugs in first 48 hours
- [ ] Performance metrics within baseline +10%
- [ ] 99.9% uptime maintained
- [ ] All automated tests passing

### Business Success
- [ ] Feature adoption rate > 20% in first week
- [ ] No user complaints about functionality
- [ ] Improved task management efficiency
- [ ] Positive user feedback

## Post-Deployment Review

### 24-Hour Review
- Check all monitoring dashboards
- Review error logs and user feedback
- Validate performance metrics
- Confirm feature adoption

### 1-Week Review
- Analyze usage patterns
- Gather user feedback
- Review performance trends
- Plan any necessary adjustments

### 1-Month Review
- Comprehensive feature assessment
- Business impact analysis
- Technical debt evaluation
- Future enhancement planning

## Lessons Learned Documentation

After deployment completion, document:
- What went well during deployment
- Issues encountered and resolutions
- Process improvements for future deployments
- Technical insights gained
- Business value delivered

This information will improve future deployment processes and inform similar feature development.
