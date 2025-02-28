'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ConfirmDialog from '@/components/common/ConfirmDialog';

export default function ChangePasswordPage() {
  const { isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Reset error messages
    setErrorMessage('');
    
    // Check if all fields are filled
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setErrorMessage('All fields are required');
      return false;
    }
    
    // Check if new password is at least 6 characters
    if (formData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return false;
    }
    
    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleSubmit = async () => {
    setShowConfirmDialog(false);
    
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      // Send API request to change password
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Try to get detailed error
        let errorMessage = 'Failed to change password';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        // User-friendly error message
        let userFriendlyError = 'Unable to change your password. Please try again.';
        if (response.status === 401) {
          userFriendlyError = 'Your session has expired. Please log in again.';
        } else if (response.status === 400) {
          if (errorMessage.includes('Current password is incorrect')) {
            userFriendlyError = 'The current password you entered is incorrect.';
          } else {
            userFriendlyError = 'The password information you provided is invalid. Please check and try again.';
          }
        } else if (response.status >= 500) {
          userFriendlyError = 'Our servers are currently experiencing issues. Please try again later.';
        }
        
        throw new Error(userFriendlyError);
      }
      
      // Success
      setSuccessMessage('Password changed successfully!');
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setErrorMessage(error.message || 'Failed to change password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const cancelPasswordChange = () => {
    setShowConfirmDialog(false);
  };

  // If authentication is still loading, show loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-md rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
          
          {/* Back link */}
          <div className="mb-6">
            <Link 
              href="/account-settings"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Account Settings
            </Link>
          </div>
          
          {/* Error message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          {/* Success message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          
          {/* Password change form */}
          <form onSubmit={handleSubmitAttempt} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                required
                minLength={6}
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 6 characters long.
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changing Password...
                  </span>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will need to use the new password for your next login."
        confirmText="Change Password"
        cancelText="Cancel"
        onConfirm={handleSubmit}
        onCancel={cancelPasswordChange}
        type="warning"
      />
    </div>
  );
} 