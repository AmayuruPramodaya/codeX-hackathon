import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ImageVideoViewer from '../components/ImageVideoViewer';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ClockIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  PhotoIcon,
  VideoCameraIcon
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerAttachments, setViewerAttachments] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

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
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'closed':
        return 'bg-slate-50 text-slate-700 border border-slate-200';
      case 'escalated':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 shadow-lg shadow-red-200';
      case 'high':
        return 'bg-orange-500 shadow-lg shadow-orange-200';
      case 'medium':
        return 'bg-amber-500 shadow-lg shadow-amber-200';
      case 'low':
        return 'bg-emerald-500 shadow-lg shadow-emerald-200';
      default:
        return 'bg-slate-500 shadow-lg shadow-slate-200';
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

  const openImageViewer = (attachments, index = 0) => {
    setViewerAttachments(attachments);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeImageViewer = () => {
    setViewerOpen(false);
    setViewerAttachments([]);
    setViewerIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-lg">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 glass-effect">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text-primary">Public Issues</h1>
              <p className="mt-2 text-lg text-slate-600">
                Track the progress of all submitted issues
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                to="/submit-issue"
                className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Submit New Issue
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 glass-effect fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
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
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
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
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
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
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-100 transition-all duration-300"
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
        <div className="space-y-6">
          {issues.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center glass-effect">
              <FunnelIcon className="h-16 w-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No issues found</h3>
              <p className="text-slate-600 text-lg">Try adjusting your search criteria or submit a new issue.</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 glass-effect fade-in-up">
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-4 h-4 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {issue.title}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <p className="text-slate-700 mb-6 text-lg leading-relaxed line-clamp-2">
                        {issue.description}
                      </p>

                      {/* Issue Attachments */}
                      {issue.attachments && issue.attachments.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center mb-4">
                            <PhotoIcon className="h-5 w-5 text-slate-600 mr-2" />
                            <span className="text-sm font-medium text-slate-700">
                              Attachments ({issue.attachments.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {issue.attachments.slice(0, 4).map((attachment, index) => (
                              <div
                                key={attachment.id}
                                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200"
                                onClick={() => openImageViewer(issue.attachments, index)}
                              >
                                {attachment.file_type === 'image' ? (
                                  <img
                                    src={attachment.file_url}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-full h-20 object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-20 bg-slate-100 flex items-center justify-center">
                                    <VideoCameraIcon className="h-8 w-8 text-slate-500" />
                                  </div>
                                )}
                                
                                {/* Overlay for video files */}
                                {attachment.file_type === 'video' && (
                                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                    <VideoCameraIcon className="h-6 w-6 text-white" />
                                  </div>
                                )}

                                {/* Show count overlay if more than 4 attachments */}
                                {index === 3 && issue.attachments.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      +{issue.attachments.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 mr-2" />
                          {formatDate(issue.created_at)}
                        </div>
                        
                        {issue.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-5 w-5 mr-2" />
                            {issue.location}
                          </div>
                        )}

                        <div className="flex items-center">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                          {issue.responses_count || 0} responses
                        </div>

                        <div className="flex items-center">
                          <EyeIcon className="h-5 w-5 mr-2" />
                          {issue.views_count || 0} views
                        </div>
                      </div>

                      {issue.current_handler && (
                        <div className="mt-4 text-sm">
                          <span className="text-slate-500">Current handler: </span>
                          <span className="font-semibold text-slate-900">
                            {issue.current_handler}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ml-8">
                      <Link
                        to={`/issue/${issue.id}`}
                        className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {issue.progress_percentage !== undefined && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{issue.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-slate-600 to-slate-700 h-3 rounded-full transition-all duration-500" 
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

      {/* Image/Video Viewer Modal */}
      {viewerOpen && (
        <ImageVideoViewer
          attachments={viewerAttachments}
          currentIndex={viewerIndex}
          onClose={closeImageViewer}
          onIndexChange={setViewerIndex}
        />
      )}
    </div>
  );
};

export default PublicIssues;
