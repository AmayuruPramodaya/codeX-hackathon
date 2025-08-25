# GovSol - Government Issue Management System

A comprehensive government issue management system for Sri Lanka that enables citizens to submit issues to their local government and track progress through an automated escalation hierarchy.

## System Overview

GovSol is a full-stack web application designed to streamline communication between citizens and government officials at all levels. The system ensures accountability and timely responses through an automated escalation mechanism.

### Key Features

1. **Multi-level Government Hierarchy**: Issues are routed through 8 user types:
   - **Citizens**: Can submit and track issues
   - **Admin**: System administrators
   - **Grama Niladhari**: Local government officers (first level)
   - **Divisional Secretary**: Regional level (second level)  
   - **District Secretary**: District level (third level)
   - **Provincial Ministry**: Provincial level (fourth level)
   - **National Ministry**: National level (fifth level)
   - **Prime Minister**: Final escalation level

2. **Automated Escalation System**:
   - Issues start with relevant Grama Niladhari
   - Automatic escalation after 3 days of no response
   - Officials can request 10 additional days (max 2 times) by marking as "pending"
   - Each level has specific response timeframes

3. **Multi-language Support**: Users can submit issues in:
   - English
   - Sinhala (සිංහල)
   - Tamil (தமிழ்)

4. **Geographic Organization**: Complete Sri Lankan administrative structure:
   - 9 Provinces
   - 25 Districts
   - Multiple DS Divisions per district
   - Multiple Grama Niladhari Divisions per DS division

5. **Anonymous Submissions**: Citizens can submit issues without creating accounts

6. **Public Transparency**: All issues are publicly viewable with progress tracking

7. **Rich Media Support**: Attach images and short videos to issues and responses

8. **Public Commenting**: Registered users can comment on public issues

## Technical Architecture

### Backend (Django REST Framework)

- **Framework**: Django 5.2.5 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Authentication**: JWT tokens with automatic refresh
- **File Storage**: Local storage with media serving
- **API**: RESTful API with filtering, search, and pagination

### Frontend (React)

- **Framework**: React 19.1.0 with Vite
- **Styling**: Tailwind CSS 4.1.11
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **UI Components**: Headless UI

### Key Models

1. **User**: Extended Django user with government hierarchy info
2. **Province/District/DSDivision/GramaNiladhariDivision**: Administrative structure
3. **Issue**: Core issue model with escalation tracking
4. **IssueResponse**: Responses from officials
5. **IssueEscalation**: Escalation history tracking
6. **PublicComment**: Public comments on issues
7. **Notification**: System notifications

## Installation & Setup

### Prerequisites

- Python 3.13+
- Node.js 18+
- Git

### Backend Setup

1. **Clone and setup virtual environment**:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Database setup**:
   ```bash
   python manage.py migrate
   python manage.py populate_divisions  # Load Sri Lankan administrative data
   python manage.py createsuperuser
   ```

3. **Start development server**:
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login  
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Administrative Divisions
- `GET /api/divisions/provinces/` - List provinces
- `GET /api/divisions/districts/?province={id}` - List districts by province
- `GET /api/divisions/ds-divisions/?district={id}` - List DS divisions by district
- `GET /api/divisions/gn-divisions/?ds_division={id}` - List GN divisions by DS division
- `GET /api/divisions/search/?q={query}&type={type}` - Search divisions

### Issues
- `GET /api/issues/` - List all issues (public)
- `POST /api/issues/create/` - Create new issue
- `GET /api/issues/my/` - Get user's issues (authenticated)
- `GET /api/issues/{reference_number}/` - Get issue details
- `POST /api/issues/{id}/respond/` - Respond to issue (officials)
- `POST /api/issues/{id}/comment/` - Add public comment
- `POST /api/issues/{id}/upload/` - Upload attachment

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## User Workflow

### For Citizens

1. **Registration** (optional):
   - Create account with basic info
   - Select province/district for location context

2. **Issue Submission**:
   - Fill out issue form with title, description
   - Select exact location (province → district → DS → GN division)
   - Attach photos/videos if needed
   - Choose language (English/Sinhala/Tamil)
   - Submit anonymously or with account

3. **Track Progress**:
   - View issue status and responses
   - See escalation history
   - Receive updates as officials respond

### For Government Officials

1. **Registration**:
   - Register with specific user type
   - Provide administrative location details
   - Wait for admin approval

2. **Issue Management**:
   - View issues in jurisdiction
   - Respond with progress updates
   - Mark as resolved with evidence
   - Request additional time if needed
   - Escalate to higher authority

3. **Dashboard**:
   - Monitor pending issues
   - Track response times
   - View jurisdiction statistics

## Response Hierarchy & Escalation

1. **Issue Assignment**:
   - New issues automatically assigned to relevant Grama Niladhari
   - Based on geographic location selected by citizen

2. **Response Timeline**:
   - Each level has 3 days to respond
   - Can request 10 additional days (max 2 times total)
   - Auto-escalation if no response within timeframe

3. **Escalation Path**:
   ```
   Grama Niladhari (3 days)
   ↓ (if no response)
   Divisional Secretary (3 days)
   ↓ (if no response)  
   District Secretary (3 days)
   ↓ (if no response)
   Provincial Ministry (3 days)
   ↓ (if no response)
   National Ministry (3 days)
   ↓ (if no response)
   Prime Minister (final level)
   ```

4. **Response Types**:
   - **Response**: Regular update with message
   - **Pending**: Request additional time
   - **Resolved**: Mark issue as completed
   - **Escalate**: Manually escalate to next level

## Security Features

- JWT authentication with automatic token refresh
- Role-based access control
- Government account approval system
- Input validation and sanitization
- File upload restrictions
- CORS protection
- CSRF protection

## Public Features

- **Public Issue Browser**: View all issues without account
- **Progress Tracking**: See real-time progress updates
- **Public Comments**: Registered users can comment
- **Search & Filter**: Find issues by location, status, keywords
- **Anonymous Reporting**: Submit without creating account

## Admin Features

- **User Management**: Approve government accounts
- **Content Moderation**: Approve public comments
- **System Settings**: Configure escalation timeframes
- **Data Export**: Export issues and statistics
- **Notification Management**: System-wide announcements

## Deployment Considerations

### Production Setup

1. **Environment Variables**:
   ```
   SECRET_KEY=your-secret-key
   DEBUG=False
   DATABASE_URL=postgresql://...
   ALLOWED_HOSTS=yourdomain.com
   ```

2. **Database**:
   - Use PostgreSQL for production
   - Regular backups
   - Read replicas for scaling

3. **File Storage**:
   - AWS S3 or similar for media files
   - CDN for static assets

4. **Web Server**:
   - Nginx + Gunicorn for Django
   - PM2 or similar for React build

5. **Security**:
   - SSL certificates
   - Firewall configuration
   - Regular security updates

## Future Enhancements

1. **Mobile Application**: React Native app for better mobile experience
2. **SMS Notifications**: Send updates via SMS for users without internet
3. **Offline Capability**: PWA features for offline usage
4. **Analytics Dashboard**: Advanced reporting and analytics
5. **Integration**: Connect with existing government systems
6. **AI Assistance**: Automatic issue categorization and response suggestions
7. **Multi-tenancy**: Support for multiple provinces/countries

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## Support

For technical support or questions:
- Email: support@govsol.lk
- Phone: 1919 (24/7 helpline)
- Documentation: [docs.govsol.lk]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**GovSol** - Connecting citizens with their government for a better Sri Lanka.
#   G o v e r n m e n t - S o l u t i o n - s y s t e m  
 #   G o v e r n m e n t - S o l u t i o n - s y s t e m  
 