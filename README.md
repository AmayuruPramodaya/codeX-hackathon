# GovSol - Government Issue Management System

<img src="./src/home.jpg">

<img src="./src/site.jpg">

## Setup

### Prerequisites

Before setting up GovSol, ensure you have the following installed:

#### System Requirements
- **Python 3.13+** - Backend framework runtime
- **Node.js 18+** - Frontend development environment
- **Git** - Version control
- **SQLite** - Default database (PostgreSQL for production)

#### Optional Tools
- **PostgreSQL** - Production database
- **Redis** - Caching and session storage
- **Nginx** - Web server for production

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Backend Environment Variables
SECRET_KEY=your-super-secret-django-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# File Upload Settings
MEDIA_ROOT=media/
STATIC_ROOT=staticfiles/

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=1440  # minutes (24 hours)

# Email Settings (Optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Production Settings (Override for production)
# DEBUG=False
# DATABASE_URL=postgresql://user:password@localhost/govsol
# ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```


## Build & Run

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # Linux/Mac
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup database:**
   ```bash
   python manage.py migrate
   python manage.py populate_divisions  # Load Sri Lankan administrative data
   python manage.py createsuperuser     # Create admin account
   ```

5. **Launch backend service:**
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Launch frontend service:**
   ```bash
   npm run dev
   ```

### Run Demos

#### Demo 1: Complete Issue Submission Flow
```bash
# 1. Start both services
cd backend && python manage.py runserver 8000 &
cd frontend && npm run dev &

# 2. Open browser to http://localhost:5173
# 3. Navigate to "Submit Issue" 
# 4. Fill out the form with test data
# 5. Submit and note the reference number
```

#### Demo 2: Government Official Response
```bash
# 1. Create a government official account
python manage.py shell
>>> from main.models import User
>>> user = User.objects.create_user(
...     username='testgn',
...     email='gn@test.com',
...     password='testpass123',
...     user_type='grama_niladhari',
...     is_approved=True
... )

# 2. Login as the official and respond to issues
```

#### Demo 3: Escalation System Test
```bash
# Test automatic escalation
python manage.py shell
>>> from main.models import Issue
>>> from django.utils import timezone
>>> from datetime import timedelta
>>> 
>>> # Set issue to past escalation date
>>> issue = Issue.objects.first()
>>> issue.next_escalation_date = timezone.now() - timedelta(hours=1)
>>> issue.save()
>>> 
>>> # Run escalation
>>> exit()
python manage.py escalate_issues
```

### Production Build

#### Backend Production Build
```bash
# Install production dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

#### Frontend Production Build
```bash
# Build for production
npm run build

# Serve with production server
npm run preview
```

## Usage

### Sample API Calls

#### 1. User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "citizen"
  }'
```

#### 2. User Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepass123"
  }'
```

#### 3. Create Issue (Anonymous)
```bash
curl -X POST http://localhost:8000/api/issues/create/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Road pothole repair needed",
    "description": "Large pothole on Main Street causing vehicle damage",
    "category": "infrastructure",
    "language": "en",
    "reporter_name": "Anonymous Citizen",
    "reporter_phone": "0771234567",
    "province": 1,
    "district": 1,
    "ds_division": 1,
    "grama_niladhari_division": 1,
    "address": "Main Street, near bus stop",
    "is_anonymous": true
  }'
```

#### 4. Get Public Issues
```bash
curl -X GET "http://localhost:8000/api/issues/?page=1&page_size=10"
```

#### 5. Get Issue Details
```bash
curl -X GET "http://localhost:8000/api/issues/GS2025ABCD1234/"
```

#### 6. Get Administrative Divisions
```bash
# Get all provinces
curl -X GET "http://localhost:8000/api/divisions/provinces/"

# Get districts for a province
curl -X GET "http://localhost:8000/api/divisions/districts/?province=1"

# Get DS divisions for a district
curl -X GET "http://localhost:8000/api/divisions/ds-divisions/?district=1"
```

### UI Steps to Exercise the POC

#### For Citizens:

1. **Submit an Issue:**
   - Visit http://localhost:5173
   - Click "Submit Issue"
   - Select location: Province → District → DS Division → GN Division
   - Fill in issue details (title, description, category)
   - Choose language preference
   - Submit (anonymous or with account)
   - Note the reference number provided

2. **Track Issue Progress:**
   - Use the reference number to search for your issue
   - View current status and any official responses
   - See escalation history if applicable

3. **Browse Public Issues:**
   - Visit "Public Issues" page
   - Filter by location, category, or status
   - View issue details and public comments

#### For Government Officials:

1. **Register as Official:**
   - Click "Register" and select user type (e.g., Grama Niladhari)
   - Provide jurisdiction details
   - Wait for admin approval

2. **Manage Assigned Issues:**
   - Login and go to Dashboard
   - View issues assigned to your level and jurisdiction
   - Respond to issues with updates
   - Mark issues as resolved or escalate them

3. **Admin Functions:**
   - Approve government official accounts
   - Moderate public comments
   - View system-wide statistics

#### Testing Escalation:

1. **Create Test Issue:**
   - Submit an issue through the UI
   - Note the reference number

2. **Simulate Time Passage:**
   ```bash
   # In Django shell
   python manage.py shell
   >>> from main.models import Issue
   >>> from django.utils import timezone
   >>> from datetime import timedelta
   >>> issue = Issue.objects.get(reference_number='YOUR_REF_NUMBER')
   >>> issue.next_escalation_date = timezone.now() - timedelta(hours=1)
   >>> issue.save()
   ```

3. **Trigger Escalation:**
   ```bash
   python manage.py escalate_issues
   ```

4. **Verify Escalation:**
   - Check the issue in UI to see it moved to next level
   - View escalation history in issue details

### Performance Testing

#### Load Testing with curl
```bash
# Test concurrent issue submissions
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/issues/create/ \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test Issue $i\",\"description\":\"Load test\",\"category\":\"other\",\"reporter_name\":\"Tester\",\"province\":1,\"district\":1,\"ds_division\":1,\"grama_niladhari_division\":1,\"is_anonymous\":true}" &
done
wait
```

#### API Response Time Testing
```bash
# Measure API response times
time curl -X GET "http://localhost:8000/api/issues/"
time curl -X GET "http://localhost:8000/api/divisions/provinces/"
time curl -X GET "http://localhost:8000/api/dashboard/stats/"
```

## Team Info

### Team Name
**CodeX**

### Team Members

| Name | Role | GitHub Handle | Email |
|------|------|---------------|-------|
| **Amayuru Pramodaya** | Team Lead | [@AmayuruPramodaya](https://github.com/AmayuruPramodaya) | gamayuru011@gmail.com |
| **Kevin Thulnith** | Backend Developer | [@KevinThulnith](https://github.com/KevinThulnith) | kevinthulnith@gmail.com |
| **Yasiru Ravidith** | Frontend Developer | [@YasiruRavidith](https://github.com/YasiruRavidith) | yasiruravidith123@gmail.com |
| **Chirath Dinuka** | DevOps/Architecture | [@chirathDinuka](https://github.com/chirathDinuka) |



