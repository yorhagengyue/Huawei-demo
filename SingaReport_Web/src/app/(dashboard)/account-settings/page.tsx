'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Link from 'next/link';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  address?: string;
  postalCode?: string;
  preferredLanguage?: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  _count?: { reports: number };
};

// Define tab interface for better type safety
interface Tab {
  id: string;
  name: string;
}

// Define tabs array
const tabs: Tab[] = [
  { id: 'profile', name: 'Profile' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'security', name: 'Security' }
];

export default function AccountSettingsPage() {
  const { isAuthenticated, isLoading: authLoading, user, checkAuth } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // 错误弹窗状态
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  
  // 成功弹窗状态
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successDialogMessage, setSuccessDialogMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    address: '',
    postalCode: '',
    preferredLanguage: 'english',
    notificationsEnabled: true,
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false
  });

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<any>(null);

  // Fetch user data
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Get auth token
      const token = localStorage.getItem('auth_token');
      console.log('Token exists:', !!token);
      if (token) {
        console.log('Token first 10 chars:', token.substring(0, 10));
      }
      
      // Fetch user profile data
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include', // Send cookies as well
        cache: 'no-store' // Prevent Next.js from caching the response
      });

      // Add debug logs
      console.log('Fetch user profile - Status code:', response.status);

      if (!response.ok) {
        // Try to read error details
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || '';
        } catch (e) {
          // Unable to parse JSON
          console.error('Unable to parse error response:', e);
        }
        
        // User-friendly error message
        let userFriendlyError = 'Unable to load your profile. Please try again.';
        if (response.status === 401) {
          userFriendlyError = 'Your session has expired. Please log in again.';
        } else if (response.status === 404) {
          userFriendlyError = 'Your profile information could not be found.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Our servers are currently experiencing issues. Please try again later.';
        }
        
        throw new Error(`${userFriendlyError} (${response.status})`);
      }

      const data = await response.json();
      setUserProfile(data.data);
      
      // Update form data
      setFormData({
        name: data.data.name || '',
        phone: data.data.phone || '',
        bio: data.data.bio || '',
        address: data.data.address || '',
        postalCode: data.data.postalCode || '',
        preferredLanguage: data.data.preferredLanguage || 'english',
        notificationsEnabled: data.data.notificationsEnabled,
        emailNotifications: data.data.emailNotifications,
        pushNotifications: data.data.pushNotifications,
        smsNotifications: data.data.smsNotifications
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const errorMsg = (error as Error).message || 'Failed to fetch user profile. Please try again later.';
      setErrorMessage(errorMsg);
      setErrorDialogMessage(errorMsg);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there are any changes
    const dataToSend: any = {};
    if (formData.name !== userProfile?.name) dataToSend.name = formData.name;
    if (formData.phone !== userProfile?.phone) dataToSend.phone = formData.phone;
    if (formData.bio !== userProfile?.bio) dataToSend.bio = formData.bio;
    if (formData.address !== userProfile?.address) dataToSend.address = formData.address;
    if (formData.postalCode !== userProfile?.postalCode) dataToSend.postalCode = formData.postalCode;
    if (formData.preferredLanguage !== userProfile?.preferredLanguage) dataToSend.preferredLanguage = formData.preferredLanguage;
    
    if (activeTab === 'notifications') {
      if (formData.notificationsEnabled !== userProfile?.notificationsEnabled) 
        dataToSend.notificationsEnabled = formData.notificationsEnabled;
      if (formData.emailNotifications !== userProfile?.emailNotifications) 
        dataToSend.emailNotifications = formData.emailNotifications;
      if (formData.pushNotifications !== userProfile?.pushNotifications) 
        dataToSend.pushNotifications = formData.pushNotifications;
      if (formData.smsNotifications !== userProfile?.smsNotifications) 
        dataToSend.smsNotifications = formData.smsNotifications;
    }
    
    // Check if there are any changes
    if (Object.keys(dataToSend).length === 0) {
      const noChangesMsg = 'No changes detected in your profile';
      setErrorMessage(noChangesMsg);
      setErrorDialogMessage(noChangesMsg);
      setShowErrorDialog(true);
      return;
    }
    
    // Store the data to submit
    setFormDataToSubmit(dataToSend);
    // Show confirmation dialog
    setShowSubmitConfirm(true);
  };

  const handleSubmit = async () => {
    setShowSubmitConfirm(false);
    
    if (!formDataToSubmit) {
      return;
    }
    
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(formDataToSubmit),
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Try to get more detailed error
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        // User-friendly error message
        let userFriendlyError = 'Unable to update your profile. Please try again.';
        if (response.status === 401) {
          userFriendlyError = 'Your session has expired. Please log in again.';
        } else if (response.status === 400) {
          userFriendlyError = 'Some information you provided is invalid. Please check and try again.';
        } else if (response.status >= 500) {
          userFriendlyError = 'Our servers are currently experiencing issues. Please try again later.';
        }
        
        throw new Error(userFriendlyError);
      }
      
      const data = await response.json();
      setUserProfile(data.data);
      
      // Display success dialog instead of inline message
      const successMsg = 'Profile updated successfully!';
      setSuccessMessage(successMsg);
      setSuccessDialogMessage(successMsg);
      setShowSuccessDialog(true);
      
      // Reset formDataToSubmit
      setFormDataToSubmit(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMsg = error.message || 'Failed to update profile. Please try again later.';
      setErrorMessage(errorMsg);
      setErrorDialogMessage(errorMsg);
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };
  
  const cancelSubmit = () => {
    setShowSubmitConfirm(false);
    setFormDataToSubmit(null);
  };

  // 处理关闭错误弹窗
  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };
  
  // 处理错误弹窗重试按钮
  const handleErrorRetry = () => {
    setShowErrorDialog(false);
    fetchUserProfile();
  };

  // 处理关闭成功弹窗
  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  // If authentication is still loading, show loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If on the security tab, show password change option
  const renderSecurityTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
          <p className="text-gray-600 mb-4">
            Change your password to keep your account secure. We recommend using a strong, unique password that you don't use for other services.
          </p>
          <Link 
            href="/account-settings/change-password"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Change Password
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Activity</h3>
          <p className="text-gray-600 mb-4">
            Monitor and manage your account activity. If you notice any suspicious activity, please change your password immediately.
          </p>
          {/* This could link to an activity log page in the future */}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => {
              setSuccessDialogMessage('Coming soon: Account activity monitoring');
              setShowSuccessDialog(true);
            }}
          >
            View Activity Log
          </button>
        </div>
      </div>
    );
  };

  // Main page content with proper error handling
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      ) : userProfile ? (
        <div>
          {/* Tab Navigation */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="flex border-b overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } flex-shrink-0 px-6 py-3 border-b-2 font-medium text-sm focus:outline-none transition-colors`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {/* Profile Form */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmitAttempt}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Language
                      </label>
                      <select
                        id="preferredLanguage"
                        name="preferredLanguage"
                        value={formData.preferredLanguage}
                        onChange={handleInputChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      >
                        <option value="english">English</option>
                        <option value="chinese">Chinese</option>
                        <option value="malay">Malay</option>
                        <option value="tamil">Tamil</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                        saving ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
              
              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <form onSubmit={handleSubmitAttempt}>
                  <div className="space-y-6">
                    <div className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notificationsEnabled"
                          name="notificationsEnabled"
                          type="checkbox"
                          checked={formData.notificationsEnabled}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="notificationsEnabled" className="font-medium text-gray-700">
                          Enable Notifications
                        </label>
                        <p className="text-gray-500">Receive system notifications and updates</p>
                      </div>
                    </div>
                    
                    <div className="ml-6 space-y-4">
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            name="emailNotifications"
                            type="checkbox"
                            checked={formData.emailNotifications}
                            onChange={handleCheckboxChange}
                            disabled={!formData.notificationsEnabled}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                            Email Notifications
                          </label>
                          <p className="text-gray-500">Receive notifications via email</p>
                        </div>
                      </div>
                      
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="pushNotifications"
                            name="pushNotifications"
                            type="checkbox"
                            checked={formData.pushNotifications}
                            onChange={handleCheckboxChange}
                            disabled={!formData.notificationsEnabled}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="pushNotifications" className="font-medium text-gray-700">
                            Push Notifications
                          </label>
                          <p className="text-gray-500">Browser push notifications</p>
                        </div>
                      </div>
                      
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="smsNotifications"
                            name="smsNotifications"
                            type="checkbox"
                            checked={formData.smsNotifications}
                            onChange={handleCheckboxChange}
                            disabled={!formData.notificationsEnabled}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="smsNotifications" className="font-medium text-gray-700">
                            SMS Notifications
                          </label>
                          <p className="text-gray-500">Receive notifications via SMS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                        saving ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && renderSecurityTab()}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Unable to load user profile. Please check your internet connection or try again later.</p>
          <button
            onClick={fetchUserProfile}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Error Dialog */}
      <ConfirmDialog
        isOpen={showErrorDialog}
        title="Notification"
        message={errorDialogMessage}
        confirmText="Retry"
        cancelText="Close"
        onConfirm={handleErrorRetry}
        onCancel={handleCloseErrorDialog}
        type="danger"
      />
      
      {/* Success Dialog */}
      <ConfirmDialog
        isOpen={showSuccessDialog}
        title="Success"
        message={successDialogMessage}
        confirmText="OK"
        cancelText=""
        onConfirm={handleCloseSuccessDialog}
        onCancel={handleCloseSuccessDialog}
        type="info"
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Confirm Profile Update"
        message="Are you sure you want to update your profile information?"
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={handleSubmit}
        onCancel={cancelSubmit}
        type="info"
      />
    </div>
  );
} 