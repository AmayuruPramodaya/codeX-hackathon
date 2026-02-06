import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  PaperClipIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const SubmitIssue = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    language: 'en',
    province: '',
    district: '',
    ds_division: '',
    gn_division: '',
    address: '',
    is_anonymous: false,
    anonymous_name: '',
    anonymous_id: '',
    anonymous_phone: '',
    anonymous_address: ''
  });

  const [divisions, setDivisions] = useState({
    provinces: [],
    districts: [],
    dsDivisions: [],
    gnDivisions: []
  });

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await api.get('/api/divisions/provinces/');
        const provincesData = response.data?.results || response.data || [];
        setDivisions(prev => ({
          ...prev,
          provinces: Array.isArray(provincesData) ? provincesData : []
        }));
      } catch (error) {
        console.error('Error fetching provinces:', error);
        addToast('Failed to load provinces. Please ensure the backend divisions API is implemented.', 'error');
        setDivisions(prev => ({ ...prev, provinces: [] }));
      }
    };

    loadProvinces();
  }, [addToast]);

  // Load districts when province changes
  const loadDistricts = async (provinceId) => {
    if (!provinceId) {
      setDivisions(prev => ({ ...prev, districts: [], dsDivisions: [], gnDivisions: [] }));
      return;
    }

    try {
      const response = await api.get(`/api/divisions/districts/?province=${provinceId}`);
      const districtsData = response.data?.results || response.data || [];
      setDivisions(prev => ({
        ...prev,
        districts: Array.isArray(districtsData) ? districtsData : [],
        dsDivisions: [],
        gnDivisions: []
      }));
    } catch (error) {
      console.error('Error fetching districts:', error);
      addToast('Failed to load districts. Please ensure the backend divisions API is implemented.', 'error');
      setDivisions(prev => ({ ...prev, districts: [] }));
    }
  };

  // Load DS divisions when district changes
  const loadDSDivisions = async (districtId) => {
    if (!districtId) {
      setDivisions(prev => ({ ...prev, dsDivisions: [], gnDivisions: [] }));
      return;
    }

    try {
      const response = await api.get(`/api/divisions/ds-divisions/?district=${districtId}`);
      const dsDivisionsData = response.data?.results || response.data || [];
      setDivisions(prev => ({
        ...prev,
        dsDivisions: Array.isArray(dsDivisionsData) ? dsDivisionsData : [],
        gnDivisions: []
      }));
    } catch (error) {
      console.error('Error fetching DS divisions:', error);
      addToast('Failed to load DS divisions. Please ensure the backend divisions API is implemented.', 'error');
      setDivisions(prev => ({ ...prev, dsDivisions: [] }));
    }
  };

  // Load GN divisions when DS division changes
  const loadGNDivisions = async (dsDivisionId) => {
    if (!dsDivisionId) {
      setDivisions(prev => ({ ...prev, gnDivisions: [] }));
      return;
    }

    try {
      const response = await api.get(`/api/divisions/gn-divisions/?ds_division=${dsDivisionId}`);
      const gnDivisionsData = response.data?.results || response.data || [];
      setDivisions(prev => ({
        ...prev,
        gnDivisions: Array.isArray(gnDivisionsData) ? gnDivisionsData : []
      }));
    } catch (error) {
      console.error('Error fetching GN divisions:', error);
      addToast('Failed to load GN divisions. Please ensure the backend divisions API is implemented.', 'error');
      setDivisions(prev => ({ ...prev, gnDivisions: [] }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle location changes
    if (name === 'province') {
      setFormData(prev => ({ ...prev, district: '', ds_division: '', gn_division: '' }));
      loadDistricts(value);
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, ds_division: '', gn_division: '' }));
      loadDSDivisions(value);
    } else if (name === 'ds_division') {
      setFormData(prev => ({ ...prev, gn_division: '' }));
      loadGNDivisions(value);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 30 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      addToast('Some files were skipped. Only images and videos under 10MB are allowed.', 'warning');
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    if (!formData.ds_division) {
      newErrors.ds_division = 'DS Division is required';
    }

    if (formData.is_anonymous) {
      if (!formData.anonymous_name.trim()) {
        newErrors.anonymous_name = 'Name is required for anonymous submission';
      }
      if (!formData.anonymous_id.trim()) {
        newErrors.anonymous_id = 'ID number is required for anonymous submission';
      }
      if (!formData.anonymous_phone.trim()) {
        newErrors.anonymous_phone = 'Phone number is required for anonymous submission';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitFormData = new FormData();

      // Add form fields, excluding empty values for optional fields
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        // Always include required fields even if empty (let backend validation handle it)
        const requiredFields = ['title', 'description', 'category', 'province', 'district', 'ds_division'];
        
        // Include non-empty values or required fields
        if (value !== '' || requiredFields.includes(key)) {
          // Convert boolean to string for FormData
          if (typeof value === 'boolean') {
            submitFormData.append(key, value.toString());
          } else {
            submitFormData.append(key, value);
          }
        }
      });

      // Add attachments
      attachments.forEach(file => {
        submitFormData.append('attachments', file);
      });

      // Debug: Log what we're sending
      console.log('Submitting form data:');
      for (let [key, value] of submitFormData.entries()) {
        console.log(key, ':', value);
      }

      await api.post('/api/issues/create/', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      addToast('Issue submitted successfully! You will receive updates on the progress.', 'success');
      navigate('/public-issues');
    } catch (error) {
      console.error('Error submitting issue:', error);
      console.error('Error response:', error.response?.data);
      
      // Show specific validation errors if available
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errorMessages = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errorData[field]}`);
            }
          });
          addToast(`Validation errors: ${errorMessages.join('; ')}`, 'error');
        } else {
          addToast(errorData.toString(), 'error');
        }
      } else {
        addToast(error.message || 'Failed to submit issue. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 glass-effect fade-in-up">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#001F54]">Submit New Issue</h1>
            <p className="mt-3 text-lg text-slate-600">
              Report issues to the relevant government authorities. Your submission will be tracked through the resolution process.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Anonymous Submission Toggle */}
            <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center">
                <input
                  id="is_anonymous"
                  name="is_anonymous"
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-orange-500 focus:ring-orange-500 border-orange-300 rounded"
                />
                <label htmlFor="is_anonymous" className="ml-3 block text-sm font-medium text-slate-900">
                  Submit anonymously (provide your details below for tracking)
                </label>
              </div>
            </div>

            {/* Anonymous Details */}
            {formData.is_anonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="anonymous_name"
                    value={formData.anonymous_name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${
                      errors.anonymous_name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.anonymous_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.anonymous_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    name="anonymous_id"
                    value={formData.anonymous_id}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${
                      errors.anonymous_id ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter your ID number"
                  />
                  {errors.anonymous_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.anonymous_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="anonymous_phone"
                    value={formData.anonymous_phone}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${
                      errors.anonymous_phone ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.anonymous_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.anonymous_phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="anonymous_address"
                    value={formData.anonymous_address}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            )}

            {/* Issue Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="Brief description of the issue"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="utilities">Utilities</option>
                  <option value="transportation">Transportation</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="environment">Environment</option>
                  <option value="public_safety">Public Safety</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                >
                  <option value="en">English</option>
                  <option value="si">සිංහල</option>
                  <option value="ta">தமிழ்</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="Provide detailed information about the issue"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <h3 className="text-xl font-bold text-[#001F54] mb-6 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-3 text-orange-500" />
                Location Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Province *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 ${
                      errors.province ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select Province</option>
                    {Array.isArray(divisions.provinces) && divisions.provinces.map(province => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    District *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={!formData.province}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-slate-100 transition-all duration-300 ${
                      errors.district ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select District</option>
                    {Array.isArray(divisions.districts) && divisions.districts.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    DS Division *
                  </label>
                  <select
                    name="ds_division"
                    value={formData.ds_division}
                    onChange={handleInputChange}
                    disabled={!formData.district}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-slate-100 transition-all duration-300 ${
                      errors.ds_division ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select DS Division</option>
                    {Array.isArray(divisions.dsDivisions) && divisions.dsDivisions.map(division => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                  {errors.ds_division && (
                    <p className="mt-1 text-sm text-red-600">{errors.ds_division}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    GN Division
                  </label>
                  <select
                    name="gn_division"
                    value={formData.gn_division}
                    onChange={handleInputChange}
                    disabled={!formData.ds_division}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-slate-100 transition-all duration-300"
                  >
                    <option value="">Select GN Division</option>
                    {Array.isArray(divisions.gnDivisions) && divisions.gnDivisions.map(division => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Specific Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    placeholder="Street address, landmarks, etc."
                  />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Attachments
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors duration-300">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <PaperClipIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <p className="text-lg text-slate-600 font-medium">
                    Click to upload images or videos
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Maximum 10MB per file
                  </p>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200 hover:shadow-md transition-shadow duration-300">
                        {file.type.startsWith('image/') ? (
                          <PhotoIcon className="h-10 w-10 text-orange-500 mx-auto mb-2" />
                        ) : (
                          <VideoCameraIcon className="h-10 w-10 text-orange-500 mx-auto mb-2" />
                        )}
                        <p className="text-xs text-slate-700 truncate font-medium">{file.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mr-4 px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Issue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitIssue;
