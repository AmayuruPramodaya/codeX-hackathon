import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { issuesAPI } from '../services/api';
import {
  ClockIcon,
  MapPinIcon,
  UserIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const IssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) {
        params.append('status', filterStatus);
      }
      
      const response = await issuesAPI.getIssues(Object.fromEntries(params));
      setIssues(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      addToast('Failed to load issues', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, addToast]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'grama_niladhari':
        return 'bg-blue-100 text-blue-800';
      case 'divisional_secretary':
        return 'bg-purple-100 text-purple-800';
      case 'district_secretary':
        return 'bg-indigo-100 text-indigo-800';
      case 'provincial_ministry':
        return 'bg-pink-100 text-pink-800';
      case 'national_ministry':
        return 'bg-red-100 text-red-800';
      case 'prime_minister':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLevelName = (level) => {
    return level?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if user is government official
  const isGovernmentOfficial = user?.user_type && [
    'grama_niladhari', 'divisional_secretary', 'district_secretary',
    'provincial_ministry', 'national_ministry', 'prime_minister', 'admin'
  ].includes(user.user_type);

  if (!isGovernmentOfficial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            Issue management is only available to government officials.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issue Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage issues assigned to your level
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span className="text-sm text-gray-500">Your level:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(user?.user_type)}`}>
                {formatLevelName(user?.user_type)}
              </span>
              <Link
                to="/escalated-issues"
                className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                View Escalated Issues
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">
                {filterStatus 
                  ? `No ${filterStatus.replace('_', ' ')} issues found for your level.`
                  : "No issues are currently assigned to your level."
                }
              </p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {issue.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          #{issue.reference_number}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Submitted {formatDate(issue.created_at)}
                        </div>
                        
                        {issue.gn_division_name && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {issue.gn_division_name}
                          </div>
                        )}

                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {issue.response_count || 0} responses
                        </div>
                      </div>

                      {/* Current Handler */}
                      {issue.current_handler_name && (
                        <div className="mt-3 text-sm">
                          <span className="text-gray-500">Handler: </span>
                          <span className="font-medium text-gray-900">
                            {issue.current_handler_name}
                          </span>
                          <span className="text-gray-500"> at </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-1 ${getLevelBadgeColor(issue.current_level)}`}>
                            {formatLevelName(issue.current_level)}
                          </span>
                        </div>
                      )}

                      {/* Reporter Information */}
                      <div className="mt-3 text-sm">
                        <span className="text-gray-500">Reported by: </span>
                        <span className="font-medium text-gray-900">
                          {issue.is_anonymous ? 'Anonymous' : issue.reporter_name}
                        </span>
                      </div>
                    </div>

                    <div className="ml-6">
                      <Link
                        to={`/issue/${issue.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View & Respond
                      </Link>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Last updated: {formatDate(issue.updated_at)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Info */}
        {issues.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-blue-900">
                Showing {issues.length} issue(s) assigned to your level. 
                Use "View Escalated Issues" to track issues that have been escalated from your jurisdiction.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueManagement;
