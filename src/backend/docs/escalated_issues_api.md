# Escalated Issues API Documentation

## Overview
The escalated issues feature allows government officials (especially Grama Niladhari users) to see issues they originally handled that have been escalated to higher levels. This provides transparency and allows officials to track what happened to their cases.

## API Endpoints

### GET /api/issues/escalated/
**Description**: Returns issues that were escalated from the current user's level/jurisdiction

**Authentication**: Required (government officials only)

**Response**: Array of escalated issues with additional escalation information

**Example Response**:
```json
[
  {
    "id": 1,
    "reference_number": "GS20257B073A30",
    "title": "Road repair needed",
    "description": "The main road has potholes...",
    "status": "pending",
    "priority": "medium",
    "current_level": "divisional_secretary",
    "current_handler_name": "Admin User",
    "escalation_count": 1,
    "latest_escalation": {
      "from_level": "grama_niladhari",
      "to_level": "divisional_secretary",
      "reason": "Auto-escalated due to no response within deadline",
      "escalated_at": "2025-08-07T18:38:24.159765Z",
      "from_user": "Matara GN",
      "to_user": "Admin User"
    },
    "original_level": "grama_niladhari",
    "created_at": "2025-08-07T18:35:00Z",
    "updated_at": "2025-08-07T18:38:24Z"
  }
]
```

## User Experience

### For Grama Niladhari (GN) Users:
1. **Main Issues List** (`/api/issues/`): Shows only current issues at GN level (0 issues after escalation)
2. **Escalated Issues List** (`/api/issues/escalated/`): Shows issues that were escalated from their jurisdiction (1 issue)
3. **My Issues List** (`/api/issues/my/`): Shows issues they personally reported as citizens

### For Divisional Secretary (DS) Users:
1. **Main Issues List** (`/api/issues/`): Shows current issues at DS level (includes escalated issues)
2. **Escalated Issues List** (`/api/issues/escalated/`): Shows issues escalated from DS level to higher levels

## Filtering and Sorting

The escalated issues endpoint supports:
- **Filtering**: `status`, `priority`, `current_level`
- **Sorting**: `created_at`, `updated_at`, `escalated_at`
- **Default Sort**: `-updated_at` (newest first)

**Example Usage**:
```
GET /api/issues/escalated/?status=pending&ordering=-escalated_at
```

## Implementation Details

### Queryset Logic:
1. **Direct Escalations**: Issues escalated by the specific user
2. **Jurisdiction Escalations**: Issues escalated from the user's jurisdiction level
3. **Combined Results**: Union of both querysets with distinct filtering

### Security:
- Only authenticated government officials can access
- Citizens get empty queryset
- Users only see escalations from their jurisdiction

## Frontend Integration

### Recommended UI:
1. Add "Escalated Issues" tab/section to dashboard
2. Show escalation status badge on issue cards
3. Display escalation timeline in issue details
4. Provide filtering by escalation status

### Sample Frontend Code:
```javascript
// Fetch escalated issues
const response = await fetch('/api/issues/escalated/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const escalatedIssues = await response.json();

// Display with escalation info
escalatedIssues.forEach(issue => {
  const escalationInfo = issue.latest_escalation;
  console.log(`Issue ${issue.reference_number} escalated from ${escalationInfo.from_level} to ${escalationInfo.to_level}`);
});
```

## Benefits

1. **Transparency**: Officials can track their escalated cases
2. **Accountability**: Clear audit trail of escalations
3. **User Experience**: Separate lists prevent confusion
4. **Hierarchical Workflow**: Each level sees appropriate issues

## Testing

Test the functionality:
```bash
# GN user should see 0 current, 1 escalated
python manage.py shell -c "
from main.models import Issue, User
gn = User.objects.get(username='matargn')
current = Issue.objects.filter(grama_niladhari_division=gn.grama_niladhari_division, current_level='grama_niladhari').count()
escalated = Issue.objects.filter(escalations__from_level='grama_niladhari', grama_niladhari_division=gn.grama_niladhari_division).distinct().count()
print(f'Current: {current}, Escalated: {escalated}')
"
```

Expected Output: `Current: 0, Escalated: 1`
