import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const StatusManager = ({ issue, onStatusUpdate, compact = false }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Check if user can manage status
  const canManageStatus = () => {
    if (!user) return false;
    
    const governmentUserTypes = [
      'grama_niladhari',
      'divisional_secretary', 
      'district_secretary',
      'provincial_ministry',
      'national_ministry',
      'prime_minister',
      'admin'
    ];
    
    return governmentUserTypes.includes(user.user_type) || user.role === 'staff';
  };

  // Get available status options based on current status and user level
  const getAvailableStatusOptions = () => {
    if (!issue || !canManageStatus()) return [];
    
    const currentStatus = issue.status;
    const userType = user.user_type;
    
    let options = [];
    
    // Basic status transitions available to all government officials
    if (currentStatus === 'pending') {
      options.push(
        { value: 'in_progress', label: t('inProgress'), icon: ClockIcon, color: 'text-yellow-600' },
        { value: 'resolved', label: t('resolved'), icon: CheckCircleIcon, color: 'text-green-600' }
      );
    } else if (currentStatus === 'in_progress') {
      options.push(
        { value: 'resolved', label: t('resolved'), icon: CheckCircleIcon, color: 'text-green-600' },
        { value: 'pending', label: t('pending'), icon: ClockIcon, color: 'text-blue-600' }
      );
    }
    
    // Higher level officials can close issues
    if (['admin', 'district_secretary', 'provincial_ministry', 'national_ministry', 'prime_minister'].includes(userType)) {
      if (currentStatus !== 'closed') {
        options.push({ 
          value: 'closed', 
          label: t('closed'), 
          icon: XCircleIcon, 
          color: 'text-gray-600' 
        });
      }
    }
    
    return options;
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      await api.patch(`/api/issues/${issue.id}/`, {
        status: selectedStatus
      });
      
      addToast(t('statusUpdated'), 'success');
      setSelectedStatus('');
      setShowConfirm(false);
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(selectedStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addToast(t('statusUpdateFailed'), 'error');
    } finally {
      setLoading(false);
    }
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

  if (!canManageStatus() || !issue) {
    return null;
  }

  const availableOptions = getAvailableStatusOptions();
  
  if (availableOptions.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
          {issue.status?.replace('_', ' ').toUpperCase()}
        </span>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            if (e.target.value) {
              setShowConfirm(true);
            }
          }}
          className="text-sm border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{t('updateStatus')}</option>
          {availableOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {showConfirm && selectedStatus && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStatusUpdate}
              disabled={loading}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setSelectedStatus('');
                setShowConfirm(false);
              }}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{t('updateStatus')}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
          {issue.status?.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableOptions.map(option => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => {
                setSelectedStatus(option.value);
                setShowConfirm(true);
              }}
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                selectedStatus === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${option.color}`} />
              <span className="text-sm font-medium text-gray-900">{option.label}</span>
            </button>
          );
        })}
      </div>
      
      {showConfirm && selectedStatus && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">Confirm Status Update</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Are you sure you want to change the status from "{issue.status?.replace('_', ' ')}" to "{availableOptions.find(opt => opt.value === selectedStatus)?.label}"?
              </p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleStatusUpdate}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Confirm Update'}
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('');
                    setShowConfirm(false);
                  }}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusManager;
