import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ImageVideoViewer from '../components/ImageVideoViewer';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  UserCircleIcon,
  PlusIcon,
  FaceSmileIcon,
  PaperAirplaneIcon
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
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [issueComments, setIssueComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

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
        return 'bg-blue-50 text-[#001F54] border border-blue-200';
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

  const toggleComments = async (issueId) => {
    const isCurrentlyShowing = showComments[issueId];
    
    setShowComments(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }));

    // If opening comments and we don't have them yet, fetch them
    if (!isCurrentlyShowing && !issueComments[issueId]) {
      await fetchComments(issueId);
    }
  };

  const fetchComments = async (issueId) => {
    try {
      setLoadingComments(prev => ({ ...prev, [issueId]: true }));
      // Use the correct comments endpoint for public comments
      const response = await api.get(`/api/issues/${issueId}/comments/`);
      
      const comments = response.data.results || response.data || [];
      
      setIssueComments(prev => ({
        ...prev,
        [issueId]: comments
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      addToast('Failed to load comments', 'error');
      setIssueComments(prev => ({
        ...prev,
        [issueId]: []
      }));
    } finally {
      setLoadingComments(prev => ({ ...prev, [issueId]: false }));
    }
  };

  const handleCommentSubmit = async (issueId, e) => {
    e.preventDefault();
    const comment = newComment[issueId];
    if (!comment?.trim()) return;
    
    try {
      // Use the correct comment endpoint for public comments
      const response = await api.post(`/api/issues/${issueId}/comment/`, {
        content: comment.trim()  // Use 'content' field as expected by serializer
      });
      
      // Add new comment to the list
      setIssueComments(prev => ({
        ...prev,
        [issueId]: [response.data, ...(prev[issueId] || [])]
      }));
      
      // Clear the input
      setNewComment(prev => ({ ...prev, [issueId]: '' }));
      addToast('Comment added successfully!', 'success');
    } catch (error) {
      console.error('Error submitting comment:', error);
      addToast('Failed to add comment. Please try again.', 'error');
    }
  };

  const handleShare = async (issue) => {
    const shareData = {
      title: issue.title,
      text: issue.description,
      url: `${window.location.origin}/issue/${issue.id}`
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addToast('Issue shared successfully!', 'success');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${issue.title}\n\n${issue.description}\n\nView more: ${shareData.url}`);
        addToast('Issue link copied to clipboard!', 'success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(`${issue.title}\n\n${issue.description}\n\nView more: ${shareData.url}`);
          addToast('Issue link copied to clipboard!', 'success');
        } catch {
          addToast('Unable to share or copy link', 'error');
        }
      }
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Facebook-style Header */}
      <div className="bg-[#001F54] shadow-lg border-b border-blue-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Public Issues Feed</h1>
            <Link
              to="/submit-issue"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Issue</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Filters - Compact Facebook Style */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.province}
                onChange={(e) => handleFilterChange('province', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Provinces</option>
                {Array.isArray(divisions.provinces) && divisions.provinces.map(province => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Issues Feed */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading feed...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new issue.</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {/* Post Header - Facebook Style */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {issue.user?.first_name ? `${issue.user.first_name} ${issue.user.last_name}` : 'Anonymous User'}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{getTimeAgo(issue.created_at)}</span>
                        <span>•</span>
                        <MapPinIcon className="h-3 w-3" />
                        <span>{issue.location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{issue.title}</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">{issue.description}</p>

                  {/* Attachments - Facebook Style Grid */}
                  {issue.attachments && issue.attachments.length > 0 && (
                    <div className="mb-4">
                      {issue.attachments.length === 1 ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={issue.attachments[0].file_url}
                            alt="Issue attachment"
                            className="w-full h-64 object-cover cursor-pointer"
                            onClick={() => openImageViewer(issue.attachments, 0)}
                          />
                        </div>
                      ) : issue.attachments.length === 2 ? (
                        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border border-gray-200">
                          {issue.attachments.slice(0, 2).map((attachment, index) => (
                            <img
                              key={attachment.id}
                              src={attachment.file_url}
                              alt={`Issue attachment ${index + 1}`}
                              className="w-full h-48 object-cover cursor-pointer"
                              onClick={() => openImageViewer(issue.attachments, index)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={issue.attachments[0].file_url}
                            alt="Issue attachment 1"
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => openImageViewer(issue.attachments, 0)}
                          />
                          <div className="relative">
                            <img
                              src={issue.attachments[1].file_url}
                              alt="Issue attachment 2"
                              className="w-full h-48 object-cover cursor-pointer"
                              onClick={() => openImageViewer(issue.attachments, 1)}
                            />
                            {issue.attachments.length > 2 && (
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer"
                                   onClick={() => openImageViewer(issue.attachments, 1)}>
                                <span className="text-white font-semibold text-lg">
                                  +{issue.attachments.length - 2}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons - Simplified */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleComments(issue.id)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span className="font-medium">
                        Comment ({issueComments[issue.id]?.length || 0})
                      </span>
                    </button>

                    <button 
                      onClick={() => handleShare(issue)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <ShareIcon className="h-5 w-5" />
                      <span className="font-medium">Share</span>
                    </button>

                    <Link
                      to={`/issue/${issue.id}`}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors duration-200"
                    >
                      <EyeIcon className="h-5 w-5" />
                      <span className="font-medium">View Details</span>
                    </Link>
                  </div>

                  {/* Comments Section */}
                  {showComments[issue.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Comments List - Scrollable */}
                      <div className="max-h-96 overflow-y-auto mb-4">
                        {loadingComments[issue.id] ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                          </div>
                        ) : issueComments[issue.id] && issueComments[issue.id].length > 0 ? (
                          <div className="space-y-3">
                            {issueComments[issue.id].map((comment) => (
                              <div key={comment.id} className="flex space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserCircleIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                                    <p className="font-semibold text-sm text-gray-900">
                                      {comment.author_name || 'Anonymous User'}
                                      {comment.is_anonymous && (
                                        <span className="ml-2 text-xs text-gray-500 font-normal">
                                          (Anonymous)
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1 break-words">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                    <span>{getTimeAgo(comment.created_at)}</span>
                                    <button className="hover:underline">Reply</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p className="text-sm">No comments yet. Be the first to comment!</p>
                          </div>
                        )}
                      </div>

                      {/* Comment Input */}
                      <form onSubmit={(e) => handleCommentSubmit(issue.id, e)} className="flex space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={newComment[issue.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [issue.id]: e.target.value }))}
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                            disabled={loadingComments[issue.id]}
                          />
                          <button
                            type="button"
                            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            disabled={loadingComments[issue.id]}
                          >
                            <FaceSmileIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="submit"
                            className="p-2 text-orange-500 hover:text-orange-600 disabled:opacity-50"
                            disabled={loadingComments[issue.id] || !newComment[issue.id]?.trim()}
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </form>
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
