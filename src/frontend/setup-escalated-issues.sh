#!/usr/bin/env bash

# Frontend Development and Testing Guide for Escalated Issues

echo "=== Escalated Issues Frontend Setup Guide ==="
echo

echo "1. Installing Dependencies..."
echo "Make sure you have all required dependencies:"
echo "   cd frontend"
echo "   npm install"
echo

echo "2. Starting Development Server..."
echo "   npm run dev"
echo

echo "3. Testing the Feature:"
echo "   - Visit http://localhost:3000"
echo "   - Login as a government official (GN user: matargn)"
echo "   - Navigate to 'Escalated Issues' from header menu"
echo "   - Or click 'View Escalated Issues' from dashboard"
echo

echo "4. Expected User Flow:"
echo "   For Grama Niladhari Users:"
echo "   ├── Dashboard → Shows 'View Escalated Issues' button"
echo "   ├── Header Menu → 'Escalated Issues' link"
echo "   ├── Escalated Issues Page → Shows escalated issues with details"
echo "   └── Issue Details → Full escalation timeline"
echo

echo "5. API Endpoints Created:"
echo "   ├── GET /api/issues/escalated/ → Escalated issues"
echo "   ├── GET /api/issues/ → Current issues"
echo "   └── GET /api/issues/my/ → User's submitted issues"
echo

echo "6. Components Added:"
echo "   ├── EscalatedIssues.jsx → Main escalated issues view"
echo "   ├── IssueManagement.jsx → Issue management dashboard"
echo "   ├── Updated Header.jsx → Navigation links"
echo "   ├── Updated Dashboard.jsx → Quick access buttons"
echo "   └── Updated api.js → API functions"
echo

echo "7. Visual Features:"
echo "   ├── Red border for escalated issues"
echo "   ├── Color-coded level badges"
echo "   ├── Escalation timeline display"
echo "   ├── Priority indicators"
echo "   └── Status badges"
echo

echo "8. Access Control:"
echo "   ├── Only government officials can view"
echo "   ├── Citizens see access denied message"
echo "   └── JWT authentication required"
echo

echo "9. Responsive Design:"
echo "   ├── Mobile-friendly interface"
echo "   ├── Tablet optimized"
echo "   └── Desktop full features"
echo

echo "✅ Frontend implementation complete!"
echo "✅ Escalated issues now visible to GN users"
echo "✅ Full transparency and tracking available"
echo

echo "Test the feature by:"
echo "1. Starting backend: cd backend && python manage.py runserver"
echo "2. Starting frontend: cd frontend && npm run dev"
echo "3. Login as GN user and check escalated issues"
