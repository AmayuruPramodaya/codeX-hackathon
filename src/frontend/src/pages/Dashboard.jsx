import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_issues: 0,
    pending_issues: 0,
    resolved_issues: 0,
    my_issues: 0,
    escalated_issues: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, issuesResponse] = await Promise.all([
          api.get('/api/dashboard/stats/'),
          api.get('/api/dashboard/recent-issues/')
        ]);
        
        setStats(statsResponse.data);
        setRecentIssues(issuesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [addToast]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-[#001F54] text-white';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Issues',
      value: stats.total_issues,
      icon: ClipboardDocumentListIcon,
      color: 'bg-[#001F54]',
      textColor: 'text-[#001F54]'
    },
    {
      title: 'Pending Issues',
      value: stats.pending_issues,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Resolved Issues',
      value: stats.resolved_issues,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'My Issues',
      value: stats.my_issues,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Escalated Issues',
      value: stats.escalated_issues,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your issues and activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`${card.color} rounded-lg p-3`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
                  <Link
                    to="/my-issues"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {recentIssues.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No recent issues found
                  </div>
                ) : (
                  recentIssues.map((issue) => (
                    <div key={issue.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {issue.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                            {issue.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatDate(issue.created_at)}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                              {issue.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/issue/${issue.id}`}
                          className="ml-4 text-sm text-blue-600 hover:text-blue-500"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/submit-issue"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-center block transition-colors"
                >
                  Submit New Issue
                </Link>
                <Link
                  to="/public-issues"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-center block transition-colors"
                >
                  Browse Public Issues
                </Link>
                {(user?.user_type === 'admin' || 
                  user?.user_type === 'grama_niladhari' || 
                  user?.user_type === 'divisional_secretary' ||
                  user?.user_type === 'district_secretary' ||
                  user?.user_type === 'provincial_ministry' ||
                  user?.user_type === 'national_ministry' ||
                  user?.user_type === 'prime_minister') && (
                  <Link
                    to="/manage-issues"
                    className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium text-center block transition-colors"
                  >
                    Manage Issues
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#001F54] to-blue-900 rounded-lg shadow-sm p-6 text-white">
              <div className="flex items-center mb-3">
                <ChartBarIcon className="h-6 w-6 mr-2" />
                <h3 className="text-lg font-semibold">Your Role</h3>
              </div>
              <p className="text-blue-100 mb-2">
                {user?.user_type?.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-blue-100">
                {user?.user_type === 'citizen' && 'You can submit and track issues in your area.'}
                {user?.user_type === 'grama_niladhari' && 'You handle issues in your Grama Niladhari division.'}
                {user?.user_type === 'divisional_secretary' && 'You manage escalated issues in your divisional secretariat.'}
                {user?.user_type === 'district_secretary' && 'You oversee issues across your district.'}
                {user?.user_type === 'provincial_ministry' && 'You handle provincial-level issues.'}
                {user?.user_type === 'national_ministry' && 'You manage national ministry issues.'}
                {user?.user_type === 'prime_minister' && 'You have access to all escalated issues.'}
                {user?.user_type === 'admin' && 'You have full system administration privileges.'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm text-gray-900">
                    {stats.active_users || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
