from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, UserLoginView, UserProfileView,
    ProvinceListView, DistrictListView, DSDivisionListView, GramaNiladhariDivisionListView,
    IssueListView, IssueDetailView, IssueCreateView, MyIssuesView, EscalatedIssuesView,
    IssueResponseView, IssueResponseListView, IssueCommentsListView, PublicCommentView, 
    DashboardStatsView, DashboardRecentIssuesView,
    NotificationListView, mark_notification_read, search_administrative_divisions,
    upload_issue_attachment
)

urlpatterns = [
    # Authentication
    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', UserLoginView.as_view(), name='user-login'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Administrative divisions
    path('divisions/provinces/', ProvinceListView.as_view(), name='province-list'),
    path('divisions/districts/', DistrictListView.as_view(), name='district-list'),
    path('divisions/ds-divisions/', DSDivisionListView.as_view(), name='ds-division-list'),
    path('divisions/gn-divisions/', GramaNiladhariDivisionListView.as_view(), name='gn-division-list'),
    path('divisions/search/', search_administrative_divisions, name='division-search'),
    
    # Issues
    path('issues/', IssueListView.as_view(), name='issue-list'),
    path('issues/create/', IssueCreateView.as_view(), name='issue-create'),
    path('issues/my/', MyIssuesView.as_view(), name='my-issues'),
    path('issues/escalated/', EscalatedIssuesView.as_view(), name='escalated-issues'),
    path('issues/<int:issue_id>/', IssueDetailView.as_view(), name='issue-detail-by-id'),
    path('issues/<str:reference_number>/', IssueDetailView.as_view(), name='issue-detail'),
    path('issues/<int:issue_id>/responses/', IssueResponseListView.as_view(), name='issue-responses'),
    path('issues/<int:issue_id>/comments/', IssueCommentsListView.as_view(), name='issue-comments'),
    path('issues/<int:issue_id>/respond/', IssueResponseView.as_view(), name='issue-respond'),
    path('issues/<int:issue_id>/comment/', PublicCommentView.as_view(), name='issue-comment'),
    path('issues/<int:issue_id>/upload/', upload_issue_attachment, name='issue-upload'),
    
    # Dashboard and notifications
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard/recent-issues/', DashboardRecentIssuesView.as_view(), name='dashboard-recent-issues'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='notification-read'),
]