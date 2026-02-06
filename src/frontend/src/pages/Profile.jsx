import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts';
import { useToast } from '../contexts/ToastContext';
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    national_id: '',
    province: null,
    district: null,
    ds_division: null,
    grama_niladhari_division: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        national_id: user.national_id || '',
        province: user.province || null,
        district: user.district || null,
        ds_division: user.ds_division || null,
        grama_niladhari_division: user.grama_niladhari_division || null
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.first_name.trim()) {
      newErrors.first_name = t('firstNameRequired');
    }
    if (!profileData.last_name.trim()) {
      newErrors.last_name = t('lastNameRequired');
    }
    if (!profileData.email.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profileData.email)) {
      newErrors.email = t('invalidEmail');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/api/auth/profile/', profileData);
      updateUser(response.data);
      setIsEditing(false);
      addToast(t('profileUpdated'), 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast(error.response?.data?.detail || t('profileUpdateFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form data to original user data
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        national_id: user.national_id || '',
        province: user.province || null,
        district: user.district || null,
        ds_division: user.ds_division || null,
        grama_niladhari_division: user.grama_niladhari_division || null
      });
    }
  };

  const getUserTypeDisplay = (userType) => {
    const userTypeMap = {
      'citizen': t('citizen'),
      'admin': t('admin'),
      'grama_niladhari': t('gramaNiladhari'),
      'divisional_secretary': t('divisionalSecretary'),
      'district_secretary': t('districtSecretary'),
      'provincial_ministry': t('provincialMinistry'),
      'national_ministry': t('nationalMinistry'),
      'prime_minister': t('primeMinister')
    };
    return userTypeMap[userType] || userType;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg glass-effect rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-20 w-20 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-lg">
                  {user.profile_picture ? (
                    <img 
                      src={user.profile_picture} 
                      alt={t('profilePicture')}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-white" />
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors">
                  <CameraIcon className="h-3 w-3" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-lg text-slate-600">@{user.username}</p>
                <div className="flex items-center mt-1">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">
                    {getUserTypeDisplay(user.user_type)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  {t('editProfile')}
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
                  >
                    <CheckIcon className="h-5 w-5 mr-2" />
                    {loading ? t('saving') : t('save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-lg"
                  >
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    {t('cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white/90 backdrop-blur-lg glass-effect rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
            {t('personalInformation')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('firstName')} *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 ${
                    errors.first_name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                  {user.first_name || t('notSpecified')}
                </div>
              )}
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('lastName')} *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 ${
                    errors.last_name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                  {user.last_name || t('notSpecified')}
                </div>
              )}
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                {t('email')} *
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                  {user.email || t('notSpecified')}
                </div>
              )}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                {t('phone')}
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                  {user.phone || t('notSpecified')}
                </div>
              )}
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <IdentificationIcon className="h-4 w-4 inline mr-1" />
                {t('nationalId')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="national_id"
                  value={profileData.national_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                  {user.national_id || t('notSpecified')}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                {t('address')}
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                  {user.address || t('notSpecified')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white/90 backdrop-blur-lg glass-effect rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
            {t('accountInformation')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('username')}
              </label>
              <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                {user.username}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('userType')}
              </label>
              <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                {getUserTypeDisplay(user.user_type)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('memberSince')}
              </label>
              <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 font-medium">
                {new Date(user.date_joined).toLocaleDateString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('accountStatus')}
              </label>
              <div className="px-4 py-3 bg-slate-50 rounded-xl">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.is_approved ? t('approved') : t('pending')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
