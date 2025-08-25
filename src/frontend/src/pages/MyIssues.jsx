import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { issuesAPI } from '../services/api';
import {
  ClockIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const { addToast } = useToast();

  const fetchMyIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) {
        params.append('status', filterStatus);
      }
      
      const response = await issuesAPI.getMyIssues(Object.fromEntries(params));
      setIssues(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching my issues:', error);
      addToast('Failed to load your issues', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, addToast]);

  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
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
          <p className="mt-4 text-gray-600">Loading your issues...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">My Issues</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track the progress of issues you've submitted
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/submit-issue"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Submit New Issue
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
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus 
                  ? `You don't have any ${filterStatus.replace('_', ' ')} issues.`
                  : "You haven't submitted any issues yet."
                }
              </p>
              <Link
                to="/submit-issue"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Submit Your First Issue
              </Link>
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
                          {issue.status.replace('_', ' ').toUpperCase()}
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
                        
                        {issue.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {issue.location}
                          </div>
                        )}

                        <div className="flex items-center">
                          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                          {issue.responses_count || 0} responses
                        </div>

                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {issue.views_count || 0} views
                        </div>
                      </div>

                      {issue.current_handler && (
                        <div className="mt-3 text-sm">
                          <span className="text-gray-500">Current handler: </span>
                          <span className="font-medium text-gray-900">
                            {issue.current_handler}
                          </span>
                        </div>
                      )}

                      {issue.last_response && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Latest update: </span>
                            <span className="text-gray-600">{issue.last_response}</span>
                          </div>
                          {issue.last_response_date && (
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(issue.last_response_date)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-6">
                      <Link
                        to={`/issue/${issue.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {issue.progress_percentage !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{issue.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${issue.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Time since last update */}
                  {issue.last_updated && (
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {formatDate(issue.last_updated)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyIssues;
