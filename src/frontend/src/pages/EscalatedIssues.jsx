import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { issuesAPI } from '../services/api';
import {
  ClockIcon,
  MapPinIcon,
  ArrowUpIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const EscalatedIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchEscalatedIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) {
        params.append('status', filterStatus);
      }
      if (filterLevel) {
        params.append('current_level', filterLevel);
      }
      
      const response = await issuesAPI.getEscalatedIssues(Object.fromEntries(params));
      setIssues(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching escalated issues:', error);
      addToast('Failed to load escalated issues', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterLevel, addToast]);

  useEffect(() => {
    fetchEscalatedIssues();
  }, [fetchEscalatedIssues]);

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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            Escalated issues are only available to government officials.
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
          <p className="mt-4 text-gray-600">Loading escalated issues...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ArrowUpIcon className="h-6 w-6 text-red-500 mr-2" />
                Escalated Issues
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Issues that have been escalated from your jurisdiction level
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Your level:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(user?.user_type)}`}>
                {formatLevelName(user?.user_type)}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by current level:</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="divisional_secretary">Divisional Secretary</option>
                <option value="district_secretary">District Secretary</option>
                <option value="provincial_ministry">Provincial Ministry</option>
                <option value="national_ministry">National Ministry</option>
                <option value="prime_minister">Prime Minister</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <ArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No escalated issues found</h3>
              <p className="text-gray-600">
                {filterStatus || filterLevel 
                  ? "No escalated issues match your current filters."
                  : "You don't have any escalated issues to track."
                }
              </p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 border-red-500">
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

                      {/* Escalation Information */}
                      {issue.latest_escalation && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center mb-2">
                            <ArrowUpIcon className="h-4 w-4 text-red-500 mr-2" />
                            <span className="font-medium text-red-900">Escalation Details</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">From: </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLevelBadgeColor(issue.latest_escalation.from_level)}`}>
                                {formatLevelName(issue.latest_escalation.from_level)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">To: </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLevelBadgeColor(issue.latest_escalation.to_level)}`}>
                                {formatLevelName(issue.latest_escalation.to_level)}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-gray-600">Reason: </span>
                              <span className="text-gray-900">{issue.latest_escalation.reason}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Escalated: </span>
                              <span className="text-gray-900">{formatDateTime(issue.latest_escalation.escalated_at)}</span>
                            </div>
                            {issue.latest_escalation.from_user && (
                              <div>
                                <span className="text-gray-600">By: </span>
                                <span className="text-gray-900">{issue.latest_escalation.from_user}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Current Status */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Originally submitted {formatDate(issue.created_at)}
                        </div>
                        
                        {issue.gn_division_name && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {issue.gn_division_name}
                          </div>
                        )}

                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          Escalated {issue.escalation_count} time(s)
                        </div>
                      </div>

                      {/* Current Handler */}
                      {issue.current_handler_name && (
                        <div className="mt-3 text-sm">
                          <span className="text-gray-500">Current handler: </span>
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
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Last updated: {formatDateTime(issue.updated_at)}
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
                Showing {issues.length} escalated issue(s) from your jurisdiction. 
                These issues are now being handled at higher levels in the government hierarchy.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalatedIssues;
