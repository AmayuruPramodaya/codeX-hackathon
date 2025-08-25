import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
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
        
        // Handle paginated responses (DRF format with results array)
        const responsesData = responsesResponse.data?.results || responsesResponse.data;
        const commentsData = commentsResponse.data?.results || commentsResponse.data;
        
        setResponses(Array.isArray(responsesData) ? responsesData : []);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        console.error('Error fetching issue detail:', error);
        addToast('Failed to load issue details', 'error');
        // Set default empty arrays to prevent mapping errors
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
      // Set response_type based on status selection, default to 'response' for regular responses
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
      // Refetch data instead of reloading
      const fetchUpdatedData = async () => {
        try {
          const [responsesResponse, commentsResponse] = await Promise.all([
            api.get(`/api/issues/${id}/responses/`),
            api.get(`/api/issues/${id}/comments/`)
          ]);
          
          // Handle paginated responses
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
      // Refetch data instead of reloading
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h1>
          <p className="text-gray-600 mb-4">The issue you're looking for doesn't exist.</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Issue Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`}></div>
                <h1 className="text-2xl font-bold text-gray-900">{issue.title}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
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
                  <UserIcon className="h-4 w-4 mr-1" />
                  {issue.is_anonymous ? 'Anonymous User' : issue.submitted_by}
                </div>

                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                  {Array.isArray(responses) ? responses.length : 0} responses
                </div>
              </div>

              <p className="text-gray-700 text-base leading-relaxed">
                {issue.description}
              </p>

              {issue.current_handler && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-600 font-medium">
                    Current Handler: {issue.current_handler}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {issue.attachments && issue.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Attachments</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {issue.attachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    {attachment.file_type === 'image' ? (
                      <img
                        src={attachment.file_url}
                        alt="Attachment"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <VideoCameraIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Responses Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Response Timeline</h2>
          
          {!responses || responses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No responses yet</p>
          ) : (
            <div className="space-y-6">
              {Array.isArray(responses) && responses.map((response, index) => (
                <div key={response.id} className="relative">
                  {index !== responses.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {response.responder_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {response.responder_role?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(response.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{response.message}</p>
                      
                      {response.status_change && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">Status changed to: </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(response.status_change)}`}>
                            {response.status_change.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}

                      {response.attachments && response.attachments.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          {response.attachments.map((attachment, attachIndex) => (
                            <div key={attachIndex} className="relative">
                              {attachment.file_type === 'image' ? (
                                <img
                                  src={attachment.file_url}
                                  alt="Response attachment"
                                  className="w-full h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
                                  <VideoCameraIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response Form */}
        {canRespond && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Response</h3>
            
            <form onSubmit={handleResponseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message *
                </label>
                <textarea
                  value={responseForm.message}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your response..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  value={responseForm.status}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Regular response</option>
                  <option value="pending">Mark as Pending</option>
                  <option value="resolved">Mark as Resolved</option>
                  <option value="escalate">Escalate Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                
                {responseForm.attachments.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {responseForm.attachments.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="bg-gray-100 rounded p-2 text-center">
                          {file.type.startsWith('image/') ? (
                            <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto" />
                          ) : (
                            <VideoCameraIcon className="h-8 w-8 text-gray-400 mx-auto" />
                          )}
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Submit Response
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Public Comments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Comments</h3>
          
          {/* Comment Form */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentForm.content}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a public comment..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {!comments || comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              Array.isArray(comments) && comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;