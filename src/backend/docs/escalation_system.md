# Issue Escalation System

This document explains how the hierarchical issue escalation system works in GovSol.

## How It Works

### 1. Issue Assignment
- When an issue is created, it's initially assigned to the Grama Niladhari (GN) level
- The issue gets a `current_level` of 'grama_niladhari'
- A `next_escalation_date` is set to 3 days from creation

### 2. Automatic Escalation
- If no response is received within 3 days, the issue automatically escalates to the next level
- Escalation hierarchy: GN → Divisional Secretary → District Secretary → Provincial Ministry → National Ministry → Prime Minister

### 3. Response Handling
- When an official responds to an issue, the escalation timer resets
- Different response types have different effects:
  - **Regular response**: Resets timer, status changes to 'in_progress'
  - **Resolved**: Stops escalation timer, issue marked as resolved
  - **Pending**: Extends timer based on additional days requested
  - **Escalate**: Immediately escalates to next level

### 4. User Visibility
- Each user type only sees issues assigned to their level:
  - **Grama Niladhari**: Only sees issues at GN level in their area
  - **Divisional Secretary**: Only sees escalated issues at DS level in their division
  - **District Secretary**: Only sees escalated issues at district level
  - And so on...

## Implementation Details

### Management Command
Run the escalation check manually:
```bash
python manage.py escalate_issues
```

Run dry-run to see what would be escalated:
```bash
python manage.py escalate_issues --dry-run
```

### Automatic Scheduling
Set up a cron job to run escalation checks every hour:
```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
0 * * * * /path/to/project/backend/scripts/auto_escalate.sh
```

### API Changes
The following views now implement hierarchical filtering:
- `IssueListView`: Users only see issues at their level
- `DashboardRecentIssuesView`: Dashboard shows only relevant issues
- `IssueResponseView`: Users can only respond to issues at their level

### Database Fields
Key fields in the Issue model:
- `current_level`: Current escalation level (e.g., 'grama_niladhari')
- `current_handler`: User currently responsible for the issue
- `next_escalation_date`: When the issue should escalate if no response
- `escalation_count`: Number of times the issue has been escalated

## Testing

### Test Escalation
1. Create an issue or find an existing one
2. Set the `next_escalation_date` to the past:
   ```python
   from main.models import Issue
   from django.utils import timezone
   from datetime import timedelta
   
   issue = Issue.objects.first()
   issue.next_escalation_date = timezone.now() - timedelta(hours=1)
   issue.save()
   ```
3. Run escalation: `python manage.py escalate_issues`
4. Verify the issue moved to the next level

### Test User Visibility
1. Log in as different user types
2. Check that they only see issues appropriate to their level
3. Verify they can only respond to issues at their level

## Configuration

### Escalation Timing
- Default: 3 days for GN, DS, District levels
- Extended: 7 days for National Ministry and PM levels
- Configurable in the escalation command

### User Setup
Ensure users have proper:
- `user_type` (grama_niladhari, divisional_secretary, etc.)
- Jurisdiction fields (province, district, ds_division, grama_niladhari_division)
- `is_approved = True`

## Troubleshooting

### No Escalation Happening
- Check that users exist at the next level with proper jurisdiction
- Verify `next_escalation_date` is in the past
- Check that the issue status is 'pending' or 'in_progress'

### Users See Wrong Issues
- Verify user's jurisdiction fields match issue's location
- Check that `current_level` field is set correctly on issues
- Ensure user has proper `user_type`

### Log Files
Check escalation logs:
```bash
tail -f /var/log/govson_escalation.log
```
