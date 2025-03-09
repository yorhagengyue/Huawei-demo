'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import PageTransition from '@/components/common/PageTransition';
import { 
  Camera, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  XCircle, 
  CheckCircle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Info,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import ClientPageWrapper from '@/components/common/ClientPageWrapper';
import AuthRequiredDialog from '@/components/common/AuthRequiredDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Report creation steps
const STEPS = {
  LOCATION: 0,
  CATEGORY: 1,
  DETAILS: 2,
  REVIEW: 3
};

// Severity options
const severityOptions = [
  { id: 'low', label: 'Low', description: 'Not urgent, can be addressed in time' },
  { id: 'medium', label: 'Medium', description: 'Should be addressed soon' },
  { id: 'high', label: 'High', description: 'Requires immediate attention' },
];

// 添加确认对话框组件
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nearbyReports: any[];
}

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, nearbyReports }: ConfirmationDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          Similar Location Reports Exist
        </h3>
        <p className="text-gray-600 mb-4">
          We found the following existing reports at or near this location:
        </p>
        
        <div className="max-h-60 overflow-y-auto mb-4 border rounded-md">
          {nearbyReports.map((report, index) => (
            <div key={index} className="p-3 border-b last:border-b-0">
              <div className="font-medium">{report.title}</div>
              <div className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {report.location}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Status: {report.status} • Submitted: {new Date(report.submittedAt || report.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to submit a report for this same location? If it's the same issue, we recommend checking the existing reports.
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View Existing Reports
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Continue Submission
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReportDetailsPage() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth, isLoading: authLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  
  const [categoryData, setCategoryData] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  
  const [formData, setFormData] = useState({
    severity: 'medium',
    description: '',
    photo: null as File | null,
  });
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Current step
  const currentStep = STEPS.DETAILS;
  
  // Progress calculation
  const progress = ((currentStep + 1) / Object.keys(STEPS).length) * 100;
  
  // Authentication check
  useEffect(() => {
    // Log authentication state for debugging
    console.log('Auth state in DetailsPage:', {
      isAuthenticated,
      isLoading: authLoading,
      authChecked,
      user: !!user
    });
    
    // Verify authentication
    const verifyAuth = async () => {
      try {
        console.log('Starting authentication verification in DetailsPage');
        const isAuth = await checkAuth();
        console.log('Authentication result in DetailsPage:', isAuth);
        setAuthChecked(true);
      } catch (err) {
        console.error('Authentication check failed in DetailsPage:', err);
        setAuthChecked(true);
      }
    };
    
    // Only run auth check if not already checked and not currently loading
    if (!authChecked && !authLoading) {
      verifyAuth();
    }
  }, [isAuthenticated, authLoading, checkAuth, authChecked, user]);
  
  // Handle unauthorized state
  useEffect(() => {
    // Only take action after auth check is complete and not loading
    if (authChecked && !authLoading) {
      if (!isAuthenticated) {
        console.log('User is not authenticated in DetailsPage, showing dialog');
        setShowAuthDialog(true);
      } else {
        console.log('User is authenticated in DetailsPage');
      }
    }
  }, [authChecked, isAuthenticated, authLoading, router]);
  
  useEffect(() => {
    // Load location data from session storage
    const locationString = sessionStorage.getItem('reportLocation');
    if (!locationString) {
      router.push('/report/create/location');
      return;
    }
    
    // Load category data from session storage
    const categoryString = sessionStorage.getItem('reportCategory');
    if (!categoryString) {
      router.push('/report/create/category');
      return;
    }
    
    try {
      const location = JSON.parse(locationString);
      setLocationData(location);
      
      const category = JSON.parse(categoryString);
      setCategoryData(category);
      
      // Get category name from ID (in a real app, this would come from a database)
      const categoryMap: Record<string, string> = {
        'road_damage': 'Road Damage',
        'cleanliness': 'Cleanliness',
        'construction': 'Construction',
        'drainage': 'Drainage',
        'parking': 'Parking',
        'street_lighting': 'Street Lighting'
      };
      setCategoryName(categoryMap[category] || category);
      
      setIsLoadingData(false);
    } catch (error) {
      console.error('Failed to parse data:', error);
      setError('An error occurred loading previous data. Please try again.');
      setIsLoadingData(false);
    }
  }, [router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      
      // Simulate AI analysis suggestion based on the uploaded image
      // In a real implementation, this would call the Janus Pro API
      simulateAIAnalysis(file);
    }
  };
  
  // Simulate AI analysis (would be replaced with actual API call to Janus Pro)
  const simulateAIAnalysis = (file: File) => {
    // Show an "analyzing" message
    setAiSuggestion("Analyzing image with AI...");
    
    // Simulate AI processing time
    setTimeout(() => {
      // Generate a suggestion based on the category
      const suggestions = [
        "This appears to be a medium severity pothole issue. Consider adding details about its size.",
        "The image shows a drainage blockage issue that could cause flooding. Consider marking as high severity.",
        "This appears to be damaged pavement with cracks that may pose a safety risk.",
        "The lighting issue in the image appears to affect a large area. Consider adding details about nearby landmarks."
      ];
      
      // Pick a random suggestion
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setAiSuggestion(randomSuggestion);
    }, 2000);
  };
  
  // 添加重复位置检测相关状态
  const [nearbyReports, setNearbyReports] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // 检查相同位置的报告
  const checkNearbyReports = async (latitude: number, longitude: number) => {
    try {
      // 定义距离阈值（约50米）
      const distanceThreshold = 0.0005; // 纬度/经度大约对应50米
      
      // 获取所有报告
      const response = await fetch('/api/reports');
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to fetch reports for location check');
        return [];
      }
      
      // 提取报告数组
      const reports = data.reports || [];
      
      // 筛选出相近位置的报告
      const nearby = reports.filter((report: any) => {
        if (!report.latitude || !report.longitude) return false;
        
        const reportLat = typeof report.latitude === 'string' 
          ? parseFloat(report.latitude) 
          : report.latitude;
          
        const reportLng = typeof report.longitude === 'string' 
          ? parseFloat(report.longitude) 
          : report.longitude;
        
        // 计算距离（简化版 - 只用于检测非常接近的点）
        const latDiff = Math.abs(reportLat - latitude);
        const lngDiff = Math.abs(reportLng - longitude);
        
        return latDiff < distanceThreshold && lngDiff < distanceThreshold;
      });
      
      return nearby;
    } catch (error) {
      console.error('Error checking nearby reports:', error);
      return [];
    }
  };
  
  // 修改提交函数以支持重复位置检测
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 检查是否有相近位置的报告
      if (locationData?.latitude && locationData?.longitude) {
        const nearby = await checkNearbyReports(
          locationData.latitude,
          locationData.longitude
        );
        
        if (nearby.length > 0) {
          // 有相近位置的报告，显示确认对话框
          setNearbyReports(nearby);
          setShowConfirmation(true);
          setIsSubmitting(false);
          return;
        }
      }
      
      // 如果没有相近位置的报告，或用户确认提交，继续提交流程
      await submitReport();
    } catch (error) {
      console.error('Error in submit process:', error);
      setError('Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // 将原提交逻辑抽取为单独函数
  const submitReport = async () => {
    setIsSubmitting(true);
    
    try {
      const title = `${categoryName} issue at ${locationData?.address}`;
      
      // Create a complete report object with all collected data
      const reportData = {
        title,
        description: formData.description,
        category: categoryData,
        location: locationData?.address,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        severity: formData.severity,
        timestamp: new Date().toISOString()
      };
      
      console.log('Report data to submit:', reportData);
      
      // Submit to backend API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Check for success status - support both old and new API formats
      if (response.ok) {
        console.log('Report submitted successfully:', result);
        
        // Store the new report data temporarily to ensure dashboard shows it immediately
        try {
          // 获取报告ID - 适应不同的API响应结构
          const reportId = result.data?.id || result.report?.id || `temp-${Date.now()}`;
          console.log('Using report ID for temp storage:', reportId);
          
          // Create a new report object that matches the dashboard format
          const newReport = {
            id: reportId,
            title,
            description: formData.description,
            category: categoryData,
            status: 'Open',  // Set status to match API response
            location: locationData?.address,
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
            severity: formData.severity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            submittedAt: new Date().toISOString(),
            // Flag for new reports to be highlighted in dashboard
            isNew: true,
            // Store temporary for 1 hour
            tempExpiry: Date.now() + (60 * 60 * 1000)
          };
          
          // Get existing temporary reports
          const tempReportsJson = localStorage.getItem('tempNewReports') || '[]';
          const tempReports = JSON.parse(tempReportsJson);
          
          // Add new report to temp storage
          tempReports.push(newReport);
          
          // Remove expired temp reports
          const filteredReports = tempReports.filter(
            (report: any) => report.tempExpiry > Date.now()
          );
          
          // Save back to localStorage
          localStorage.setItem('tempNewReports', JSON.stringify(filteredReports));
          
          // Trigger dashboard refresh event
          if (typeof window !== 'undefined') {
            // Create and dispatch a custom event to notify dashboard to refresh
            const refreshEvent = new CustomEvent('dashboard:refresh', {
              detail: { reportId: newReport.id }
            });
            window.dispatchEvent(refreshEvent);
            
            console.log('Dispatched dashboard:refresh event');
          }
        } catch (storageError) {
          // Non-critical error, just log it
          console.error('Failed to store temporary report data:', storageError);
        }
        
        // Show success dialog
        setShowSuccessDialog(true);
        
        // Clear session data
        sessionStorage.removeItem('reportLocation');
        sessionStorage.removeItem('reportCategory');
      } else {
        console.error('Failed to submit report:', result);
        setError(result.message || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    router.push('/report/create/category');
  };
  
  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    // Navigate to dashboard after confirmation
    router.push('/dashboard');
  };
  
  if (isLoadingData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-center" style={{ minHeight: '50vh' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-2"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ClientPageWrapper>
      {/* 添加确认对话框 */}
      <ConfirmationDialog 
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          setShowConfirmation(false);
          submitReport();
        }}
        nearbyReports={nearbyReports}
      />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Report an Issue</h1>
        
        {/* Auth Required Dialog */}
        <AuthRequiredDialog 
          isOpen={showAuthDialog}
          setIsOpen={(open) => {
            setShowAuthDialog(open);
            if (!open) {
              router.push('/dashboard');
            }
          }}
          title="Authentication Required"
          message="You need to be logged in to report an issue. Please log in or create an account to continue."
          returnUrl="/report/create/details"
        />
        
        {/* Success Dialog */}
        <AlertDialog open={showSuccessDialog}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <AlertDialogTitle className="text-center">Report submitted successfully!</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Thank you for your submission. Your report has been received and will be reviewed by our team.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogAction 
                onClick={handleSuccessConfirm}
                className="bg-primary hover:bg-primary/90"
              >
                Return to Dashboard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Progress bar */}
        <div className="mb-8 bg-gray-100 h-2 rounded-full">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Step indicator */}
        <div className="flex justify-between mb-6 text-sm text-gray-500">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-1">1</div>
            <span>Location</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-1">2</div>
            <span>Category</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mb-1">3</div>
            <span>Details</span>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Provide issue details</h2>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Summary of previous selections */}
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="font-medium text-blue-800 mb-1">Selected Information</h3>
                <p className="text-blue-700 text-sm">
                  <span className="font-medium">Location:</span> {locationData?.address}
                </p>
                <p className="text-blue-700 text-sm">
                  <span className="font-medium">Category:</span> {categoryName}
                </p>
              </div>
            </div>
          </div>
          
          {/* Severity selection */}
          <div>
            <label className="block font-medium mb-2">Severity Level <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {severityOptions.map((option) => (
                <label 
                  key={option.id} 
                  className={`
                    flex items-center p-3 border rounded-md cursor-pointer transition-colors
                    ${formData.severity === option.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={option.id}
                    checked={formData.severity === option.id}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Description field */}
          <div>
            <label htmlFor="description" className="block font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Provide details about the issue..."
              value={formData.description}
              onChange={handleInputChange}
            />
            
            {/* AI suggestion */}
            {aiSuggestion && (
              <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-md">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-indigo-700">
                    <p className="font-medium mb-0.5">AI Suggestion</p>
                    <p>{aiSuggestion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Photo Upload */}
          <div>
            <label className="block font-medium mb-2">
              Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              {formData.photo ? (
                <div className="mb-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <Camera className="h-5 w-5" />
                    <span className="font-medium">Photo selected: {formData.photo.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(formData.photo.size / 1024)} KB
                  </p>
                </div>
              ) : (
                <Camera className="h-8 w-8 text-gray-400 mb-2" />
              )}
              
              <p className="text-sm text-gray-500 mb-2">
                {formData.photo ? 'Click to change photo' : 'Upload a photo of the issue'}
              </p>
              
              <label className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300 inline-flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>{formData.photo ? 'Change Photo' : 'Select Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              For best results, upload a clear image of the issue. This will help with AI analysis and routing.
            </p>
          </div>
          
          {/* Instructions */}
          <div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p>Provide as much detail as possible to help us address the issue efficiently. Your photo will be analyzed by our AI to help categorize and prioritize your report.</p>
              </div>
            </div>
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Important Notice</p>
                <p>Submitting false reports can lead to penalties. By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.</p>
              </div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting && (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
              )}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </ClientPageWrapper>
  );
} 