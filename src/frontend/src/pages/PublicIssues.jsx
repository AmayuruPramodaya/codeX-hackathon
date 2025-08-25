import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ClockIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const PublicIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    province: '',
    district: ''
  });
  const [divisions, setDivisions] = useState({
    provinces: [],
    districts: []
  });

  const { addToast } = useToast();

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.province) params.append('province', filters.province);
      if (filters.district) params.append('district', filters.district);

      // Use the regular issues endpoint instead of public-specific one
      const response = await api.get(`/api/issues/?${params.toString()}`);
      setIssues(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      // Set empty array on error to prevent crashes
      setIssues([]);
      addToast('Failed to load issues', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, addToast]);

  useEffect(() => {
    fetchIssues();
    
    const loadProvinces = async () => {
      try {
        const response = await api.get('/api/divisions/provinces/');
        setDivisions(prev => ({ 
          ...prev, 
          provinces: Array.isArray(response.data) ? response.data : [] 
        }));
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setDivisions(prev => ({ ...prev, provinces: [] }));
      }
    };
    
    loadProvinces();
  }, [fetchIssues]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchIssues();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchIssues]);

  const fetchDistricts = async (provinceId) => {
    if (!provinceId) {
      setDivisions(prev => ({ ...prev, districts: [] }));
      return;
    }

    try {
      const response = await api.get(`/api/divisions/districts/?province=${provinceId}`);
      setDivisions(prev => ({ 
        ...prev, 
        districts: Array.isArray(response.data) ? response.data : [] 
      }));
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDivisions(prev => ({ ...prev, districts: [] }));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'province') {
      setFilters(prev => ({ ...prev, district: '' }));
      fetchDistricts(value);
    }
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Public Issues</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track the progress of all submitted issues
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Province Filter */}
            <div>
              <select
                value={filters.province}
                onChange={(e) => handleFilterChange('province', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Provinces</option>
                {Array.isArray(divisions.provinces) && divisions.provinces.map(province => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                disabled={!filters.province}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Districts</option>
                {Array.isArray(divisions.districts) && divisions.districts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or submit a new issue.</p>
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
                          {formatDate(issue.created_at)}
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
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${issue.progress_percentage}%` }}
                        ></div>
                      </div>
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

export default PublicIssues;
