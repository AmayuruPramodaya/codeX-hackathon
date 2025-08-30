import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import ImageVideoViewer from '../components/ImageVideoViewer';
import {
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

function IssueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [responses, setResponses] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseForm, setResponseForm] = useState({
    message: '',
    status: '',
    attachments: []
  });
  const [commentForm, setCommentForm] = useState({
    content: ''
  });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerAttachments, setViewerAttachments] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    const fetchIssueDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [issueResponse, responsesResponse, commentsResponse] = await Promise.all([
          api.get(`/api/issues/${id}/`),
          api.get(`/api/issues/${id}/responses/`),
          api.get(`/api/issues/${id}/comments/`)
        ]);

        setIssue(issueResponse.data);
        
        const responsesData = responsesResponse.data?.results || responsesResponse.data;
        const commentsData = commentsResponse.data?.results || commentsResponse.data;
        
        setResponses(Array.isArray(responsesData) ? responsesData : []);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        console.error('Error fetching issue detail:', error);
        addToast('Failed to load issue details', 'error');
        setResponses([]);
        setComments([]);
        if (error.response?.status === 404) {
          navigate('/public-issues');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetail();
  }, [id, addToast, navigate]);

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseForm.message.trim()) {
      addToast('Please enter a response message', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('message', responseForm.message);
      const responseType = responseForm.status || 'response';
      formData.append('response_type', responseType);
      
      responseForm.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      await api.post(`/api/issues/${id}/respond/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      addToast('Response submitted successfully', 'success');
      setResponseForm({ message: '', status: '', attachments: [] });
      
      const fetchUpdatedData = async () => {
        try {
          const [responsesResponse, commentsResponse] = await Promise.all([
            api.get(`/api/issues/${id}/responses/`),
            api.get(`/api/issues/${id}/comments/`)
          ]);
          
          const responsesData = responsesResponse.data?.results || responsesResponse.data;
          const commentsData = commentsResponse.data?.results || commentsResponse.data;
          
          setResponses(Array.isArray(responsesData) ? responsesData : []);
          setComments(Array.isArray(commentsData) ? commentsData : []);
        } catch (error) {
          console.error('Error refetching data:', error);
        }
      };
      fetchUpdatedData();
    } catch (error) {
      console.error('Error submitting response:', error);
      addToast('Failed to submit response', 'error');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.content.trim()) {
      addToast('Please enter a comment', 'error');
      return;
    }

    try {
      await api.post(`/api/issues/${id}/comment/`, {
        content: commentForm.content
      });

      addToast('Comment added successfully', 'success');
      setCommentForm({ content: '' });
      
      const fetchUpdatedData = async () => {
        try {
          const commentsResponse = await api.get(`/api/issues/${id}/comments/`);
          const commentsData = commentsResponse.data?.results || commentsResponse.data;
          setComments(Array.isArray(commentsData) ? commentsData : []);
        } catch (error) {
          console.error('Error refetching comments:', error);
        }
      };
      fetchUpdatedData();
    } catch (error) {
      console.error('Error submitting comment:', error);
      addToast('Failed to add comment', 'error');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setResponseForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setResponseForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const openViewer = (attachments, index = 0) => {
    setViewerAttachments(attachments);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerAttachments([]);
    setViewerIndex(0);
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canRespond = user && (
    user.user_type === 'admin' ||
    user.user_type === 'grama_niladhari' ||
    user.user_type === 'divisional_secretary' ||
    user.user_type === 'district_secretary' ||
    user.user_type === 'provincial_ministry' ||
    user.user_type === 'national_ministry' ||
    user.user_type === 'prime_minister'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Issue Not Found</h1>
          <p className="text-slate-600 mb-4">The issue you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/public-issues')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Issues
            </button>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="font-medium">Issue #{issue.id}</span>
              <span>•</span>
              <span>{formatDate(issue.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column - Issue Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Issue Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)} opacity-90`}></div>
                    <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                      {issue.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                      {issue.priority?.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-3 leading-tight">{issue.title}</h1>
                <p className="text-slate-200 text-lg">
                  Submitted by {issue.is_anonymous ? 'Anonymous User' : issue.submitted_by}
                </p>
              </div>
              
              <div className="p-8">
                <div className="prose max-w-none mb-6">
                  <p className="text-slate-700 text-lg leading-relaxed">{issue.description}</p>
                </div>

                {issue.current_handler && (
                  <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-900">
                        Currently handled by: {issue.current_handler}
                      </span>
                    </div>
                  </div>
                )}

                {/* Enhanced Media Gallery */}
                {issue.attachments && issue.attachments.length > 0 && (
                  <div className="mt-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center">
                        <PhotoIcon className="h-6 w-6 mr-2 text-blue-600" />
                        Media Gallery
                      </h3>
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {issue.attachments.length} files
                      </span>
                    </div>
                    
                    {/* Featured Media Display */}
                    {issue.attachments.find(a => a.attachment_type === 'image' || a.attachment_type === 'video') && (
                      <div className="mb-6">
                        {(() => {
                          const featuredMedia = issue.attachments.find(a => a.attachment_type === 'image' || a.attachment_type === 'video');
                          const mediaIndex = issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video').findIndex(a => a.id === featuredMedia.id);
                          
                          return (
                            <div 
                              className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200"
                              onClick={() => openViewer(issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video'), mediaIndex)}
                            >
                              {featuredMedia.attachment_type === 'image' ? (
                                <img
                                  src={featuredMedia.file_url}
                                  alt={featuredMedia.description || "Featured media"}
                                  className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23475569">Image Preview</text></svg>';
                                  }}
                                />
                              ) : (
                                <video
                                  src={featuredMedia.file_url}
                                  className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                                  preload="metadata"
                                />
                              )}
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                  <div className="bg-white/90 backdrop-blur-sm text-slate-900 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                    {featuredMedia.attachment_type === 'image' ? (
                                      <PhotoIcon className="h-4 w-4 mr-1" />
                                    ) : (
                                      <VideoCameraIcon className="h-4 w-4 mr-1" />
                                    )}
                                    {featuredMedia.attachment_type === 'image' ? 'Image' : 'Video'}
                                  </div>
                                  <div className="bg-white/90 backdrop-blur-sm text-slate-900 p-2 rounded-full">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Media Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {issue.attachments.map((attachment, index) => (
                        <div key={index} className="relative group">
                          {attachment.attachment_type === 'image' ? (
                            <div 
                              className="cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200" 
                              onClick={() => openViewer(issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video'), 
                                                     issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video').findIndex(a => a.id === attachment.id))}
                            >
                              <img
                                src={attachment.file_url}
                                alt={attachment.description || "Attachment"}
                                className="w-full h-16 object-cover transition-transform duration-200 group-hover:scale-110"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23475569">IMG</text></svg>';
                                }}
                              />
                              <div className="absolute top-1 right-1 bg-blue-600 text-white p-1 rounded opacity-90">
                                <PhotoIcon className="h-2.5 w-2.5" />
                              </div>
                            </div>
                          ) : attachment.attachment_type === 'video' ? (
                            <div 
                              className="cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200" 
                              onClick={() => openViewer(issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video'), 
                                                     issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video').findIndex(a => a.id === attachment.id))}
                            >
                              <video
                                src={attachment.file_url}
                                className="w-full h-16 object-cover transition-transform duration-200 group-hover:scale-110"
                                preload="metadata"
                              />
                              <div className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-90">
                                <VideoCameraIcon className="h-2.5 w-2.5" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/40 text-white p-1 rounded-full opacity-70">
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-16 bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors border border-slate-200"
                                 onClick={() => window.open(attachment.file_url, '_blank')}>
                              <PhotoIcon className="h-5 w-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video').length > 1 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => openViewer(issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video'), 0)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          View All Media ({issue.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video').length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Response Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <ChatBubbleLeftIcon className="h-6 w-6 mr-2 text-blue-600" />
                Response Timeline
              </h2>
              
              {!responses || responses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftIcon className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-lg">No responses yet</p>
                  <p className="text-slate-400 text-sm mt-1">Be the first to respond to this issue</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Array.isArray(responses) && responses.map((response, index) => (
                    <div key={response.id} className="relative">
                      {index !== responses.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-slate-900 text-lg">
                                {response.responder_name}
                              </span>
                              <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-sm font-medium">
                                {response.responder_role?.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-slate-500">
                              {formatDate(response.created_at)}
                            </span>
                          </div>
                          
                          <p className="text-slate-700 mb-4 leading-relaxed">{response.message}</p>
                          
                          {response.status_change && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <span className="text-sm text-slate-600">Status updated to: </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(response.status_change)}`}>
                                {response.status_change.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          )}

                          {response.attachments && response.attachments.length > 0 && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-slate-700 flex items-center">
                                  <PhotoIcon className="h-4 w-4 mr-1" />
                                  Attachments
                                </span>
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                                  {response.attachments.length}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {response.attachments.map((attachment, attachIndex) => (
                                  <div key={attachIndex} className="relative group">
                                    {attachment.attachment_type === 'image' ? (
                                      <div 
                                        className="cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200" 
                                        onClick={() => openViewer(response.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video'), 
                                                                 response.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video').findIndex(a => a.id === attachment.id))}
                                      >
                                        <img
                                          src={attachment.file_url}
                                          alt={attachment.description || "Response attachment"}
                                          className="w-full h-12 object-cover transition-transform duration-200 group-hover:scale-110"
                                          onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23475569">IMG</text></svg>';
                                          }}
                                        />
                                        <div className="absolute top-0.5 right-0.5 bg-green-600 text-white p-0.5 rounded opacity-90">
                                          <PhotoIcon className="h-2 w-2" />
                                        </div>
                                      </div>
                                    ) : attachment.attachment_type === 'video' ? (
                                      <div 
                                        className="cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200" 
                                        onClick={() => openViewer(response.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video'), 
                                                                 response.attachments.filter(a => a.attachment_type === 'image' || a.attachment_type === 'video').findIndex(a => a.id === attachment.id))}
                                      >
                                        <video
                                          src={attachment.file_url}
                                          className="w-full h-12 object-cover transition-transform duration-200 group-hover:scale-110"
                                          preload="metadata"
                                        />
                                        <div className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded opacity-90">
                                          <VideoCameraIcon className="h-2 w-2" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="bg-black/40 text-white p-1 rounded-full opacity-70">
                                            <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-full h-12 bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors border border-slate-200"
                                           onClick={() => window.open(attachment.file_url, '_blank')}>
                                        <PhotoIcon className="h-4 w-4 text-slate-500" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Issue Meta & Actions */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Issue Meta Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Issue Details</h3>
              <div className="space-y-4">
                {issue.location && (
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Location</p>
                      <p className="text-sm text-slate-900">{issue.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <UserIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Category</p>
                    <p className="text-sm text-slate-900">{issue.category || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Created</p>
                    <p className="text-sm text-slate-900">{formatDate(issue.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Form */}
            {canRespond && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Add Response</h3>
                <form onSubmit={handleResponseSubmit} className="space-y-4">
                  <div>
                    <textarea
                      value={responseForm.message}
                      onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter your response..."
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {user?.role === 'staff' && (
                    <div>
                      <select
                        value={responseForm.status}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No status change</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  {responseForm.attachments.length > 0 && (
                    <div className="space-y-2">
                      {responseForm.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span className="text-sm text-slate-600 truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Submit Response
                  </button>
                </form>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Comments</h3>
              
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-4 space-y-3">
                  <textarea
                    value={commentForm.content}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Add a comment..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
                  >
                    Add Comment
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-slate-900 text-sm">
                            {comment.author_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image/Video Viewer Modal */}
      {viewerOpen && (
        <ImageVideoViewer
          attachments={viewerAttachments}
          initialIndex={viewerIndex}
          onClose={closeViewer}
        />
      )}
    </div>
  );
}

export default IssueDetail;
