'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Info, Upload, CheckCircle2, X, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StepTransition from '@/components/common/StepTransition';

// Dynamically import file uploader component
const FileUploader = dynamic(() => import('@/components/files/FileUploader'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-gray-500">Loading file uploader...</p>
      </div>
    </div>
  )
});

// Dynamically import LocationPicker to avoid server/client rendering mismatch
const LocationPicker = dynamic(() => import('@/components/maps/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-gray-500">Loading location picker...</p>
      </div>
    </div>
  )
});

// Report creation steps
const STEPS = {
  LOCATION: 0,
  CATEGORY: 1,
  DETAILS: 2,
  REVIEW: 3,
}

export default function NewReportPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, checkAuth } = useAuth();
  
  // Check if client-side
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Login prompt dialog state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [directionTransition, setDirectionTransition] = useState<'forward' | 'backward'>('forward');

  // Ensure user is logged in
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Show login prompt if user is not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowLoginPrompt(true);
    }
  }, [isAuthenticated, authLoading]);

  // Handle login redirect
  const handleLoginRedirect = () => {
    router.push('/login?redirect=/report/new');
  };

  const [step, setStep] = useState(STEPS.LOCATION);
  const [formData, setFormData] = useState({
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
      address: '',
    },
    category: '',
    subcategory: '',
    title: '',
    description: '',
    images: [] as string[],
    anonymous: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Progress bar calculation
  const progress = ((step + 1) / Object.keys(STEPS).length) * 100;

  // Handle next step navigation
  const onNext = () => {
    if (step < Object.keys(STEPS).length - 1) {
      setDirectionTransition('forward');
      setStep(step + 1);
    }
  };

  // Handle previous step navigation
  const onBack = () => {
    setDirectionTransition('backward');
    setStep((value) => value - 1);
  };

  // Check if next step button should be disabled
  const isNextDisabled = () => {
    if (step === STEPS.LOCATION && !formData.location.latitude) return true;
    if (step === STEPS.CATEGORY && !formData.category) return true;
    if (step === STEPS.DETAILS && !formData.title) return true;
    return false;
  };

  // Update form data
  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({...formData, ...data});
  };

  // Handle file upload success
  const handleUploadSuccess = (_fileId: string, fileData: any) => {
    // Update image list
    updateFormData({
      images: [...formData.images, fileData.url]
    });
  };

  // Handle form submission
  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare report data
      const reportData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        location: formData.location.address,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        anonymous: formData.anonymous,
        mediaUrls: formData.images,
        isDemo: false
      };
      
      // Send API request
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      
      // Parse response
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit report');
      }
      
      // Get report ID
      const reportId = responseData.id || responseData.reportId || (responseData.data && responseData.data.id);
      
      console.log('Report submitted successfully:', responseData);
      
      // Success
      setSuccess(true);
      
      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(reportId ? `/report/success?id=${reportId}` : '/report/success');
      }, 2000);
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Content for the location step
  const locationStep = (
    <div>
      <h2 className="text-xl font-semibold mb-4">Where is the issue located?</h2>
      
      {isClient && (
        <LocationPicker
          onLocationSelected={(location) => {
            updateFormData({
              location: {
                latitude: location.latitude,
                longitude: location.longitude,
                address: location.address,
              },
            });
          }}
          initialLocation={formData.location}
        />
      )}

      {!isClient && (
        <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
      
      {formData.location.address && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-900">Selected Location:</h3>
          <p className="text-blue-700 text-sm mt-1">{formData.location.address}</p>
        </div>
      )}
      
      <div className="mt-4 flex items-start space-x-2 text-gray-500 text-sm">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p>Click on the map to select the exact location of the issue. You can drag the marker to adjust if needed.</p>
      </div>
    </div>
  );
  
  // Content for the category step
  const categoryStep = (
    <div>
      <h2 className="text-xl font-semibold mb-4">What type of issue are you reporting?</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {categories.map(category => (
          <div
            key={category.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.category === category.id
                ? 'bg-primary/10 border-primary'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => updateFormData({ 
              category: category.id,
              subcategory: '' // Reset subcategory when category changes
            })}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <h3 className="font-medium">{category.name}</h3>
          </div>
        ))}
      </div>
      
      {formData.category && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Please specify further:</h3>
          <div className="grid grid-cols-2 gap-2">
            {getSubcategories(formData.category).map(subcategory => (
              <div
                key={subcategory.id}
                className={`p-3 border rounded-md cursor-pointer ${
                  formData.subcategory === subcategory.id
                    ? 'bg-primary/10 border-primary'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
                onClick={() => updateFormData({ subcategory: subcategory.id })}
              >
                {subcategory.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  // Content for the details step
  const detailsStep = (
    <div>
      <h2 className="text-xl font-semibold mb-4">Provide details about this issue</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Brief title describing the issue"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            className="w-full p-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Provide detailed information about the issue..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Photos
          </label>
          
          {isClient && (
            <FileUploader
              onSuccess={handleUploadSuccess}
              allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
              multiple={true}
            />
          )}
          
          {formData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Uploaded images:</p>
              <div className="flex flex-wrap gap-2">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                    <Image 
                      src={imageUrl} 
                      alt={`Uploaded image ${index + 1}`} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <button
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const updatedImages = [...formData.images];
                        updatedImages.splice(index, 1);
                        updateFormData({ images: updatedImages });
                      }}
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            className="w-4 h-4 text-primary border border-gray-300 rounded focus:ring-primary"
            checked={formData.anonymous}
            onChange={(e) => updateFormData({ anonymous: e.target.checked })}
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
            Submit anonymously (your name will not be shown publicly)
          </label>
        </div>
      </div>
    </div>
  );
  
  // Content for the review step
  const reviewStep = (
    <div>
      <h2 className="text-xl font-semibold mb-4">Review and Submit</h2>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700">Location</h3>
          <p className="text-sm mt-1">{formData.location.address || 'No location selected'}</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700">Category</h3>
          <p className="text-sm mt-1">
            {formData.category ? getCategoryName(formData.category) : 'No category selected'}
            {formData.subcategory && ` > ${getSubcategoryName(formData.subcategory)}`}
          </p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700">Title</h3>
          <p className="text-sm mt-1">{formData.title || 'No title provided'}</p>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700">Description</h3>
          <p className="text-sm mt-1 whitespace-pre-wrap">{formData.description || 'No description provided'}</p>
        </div>
        
        {formData.images.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-700">Images ({formData.images.length})</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((imageUrl, index) => (
                <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
                  <Image 
                    src={imageUrl} 
                    alt={`Uploaded image ${index + 1}`} 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-700">Submission Type</h3>
          <p className="text-sm mt-1">{formData.anonymous ? 'Anonymous' : 'Public (your name will be shown)'}</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
  
  // Success state
  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your submission. Your report has been received and will be processed shortly.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/dashboard"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/map"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              View Map
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Return the appropriate step content based on current step
  const getStepContent = () => {
    switch(step) {
      case STEPS.LOCATION:
        return locationStep;
      case STEPS.CATEGORY:
        return categoryStep;
      case STEPS.DETAILS:
        return detailsStep;
      case STEPS.REVIEW:
        return reviewStep;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Login prompt dialog */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Need to Login</h2>
              <button 
                onClick={() => router.push('/')} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <LogIn className="text-blue-600 w-8 h-8" />
              </div>
              <p className="text-gray-600 mb-4">
                You need to login to submit a report. Please log in or register an account first.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLoginRedirect}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h1>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Step Content with Animation */}
        <StepTransition step={step} direction={directionTransition}>
          {getStepContent()}
        </StepTransition>
      </div>

      <div className="flex justify-between mt-6">
        {step > 0 ? (
          <button 
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        ) : (
          <Link href="/" className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        )}

        <button 
          onClick={step === STEPS.REVIEW ? onSubmit : onNext}
          disabled={isNextDisabled() || isSubmitting}
          className={`px-6 py-2 rounded-md ${isNextDisabled() || isSubmitting 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
              Submitting...
            </span>
          ) : (
            step === STEPS.REVIEW ? 'Submit Report' : 'Next'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

// Sample data for categories and subcategories
const categories = [
  { id: 'roads', name: 'Road Issues', icon: '🛣️' },
  { id: 'cleanliness', name: 'Cleanliness', icon: '🧹' },
  { id: 'facilities', name: 'Public Facilities', icon: '🏛️' },
  { id: 'safety', name: 'Safety Hazards', icon: '⚠️' },
  { id: 'environment', name: 'Environment', icon: '🌳' },
  { id: 'other', name: 'Other', icon: '📝' },
];

const subcategories = {
  roads: [
    { id: 'pothole', name: 'Pothole' },
    { id: 'road_damage', name: 'Road Damage' },
    { id: 'traffic_light', name: 'Traffic Light Issues' },
    { id: 'road_marking', name: 'Road Marking' },
    { id: 'illegal_parking', name: 'Illegal Parking' },
  ],
  cleanliness: [
    { id: 'litter', name: 'Litter' },
    { id: 'illegal_dumping', name: 'Illegal Dumping' },
    { id: 'public_bins', name: 'Public Bin Issues' },
    { id: 'graffiti', name: 'Graffiti' },
  ],
  facilities: [
    { id: 'damaged_facility', name: 'Damaged Facility' },
    { id: 'playground', name: 'Playground Issues' },
    { id: 'public_toilet', name: 'Public Toilet Problems' },
    { id: 'street_lighting', name: 'Street Lighting' },
    { id: 'bus_stop', name: 'Bus Stop Issues' },
  ],
  safety: [
    { id: 'dangerous_structure', name: 'Dangerous Structure' },
    { id: 'falling_objects', name: 'Falling Objects' },
    { id: 'missing_manhole', name: 'Missing Manhole' },
    { id: 'unsafe_construction', name: 'Unsafe Construction' },
  ],
  environment: [
    { id: 'fallen_tree', name: 'Fallen Tree' },
    { id: 'overgrown_vegetation', name: 'Overgrown Vegetation' },
    { id: 'pest_problem', name: 'Pest Problem' },
    { id: 'water_pollution', name: 'Water Pollution' },
  ],
  other: [
    { id: 'noise', name: 'Noise Complaint' },
    { id: 'vandalism', name: 'Vandalism' },
    { id: 'other_issue', name: 'Other Issue' },
  ],
};

function getSubcategories(categoryId: string) {
  return subcategories[categoryId as keyof typeof subcategories] || [];
}

function getCategoryName(categoryId: string) {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : 'Unknown Category';
}

function getSubcategoryName(subcategoryId: string) {
  for (const categoryKey in subcategories) {
    const subs = subcategories[categoryKey as keyof typeof subcategories];
    const subcategory = subs.find(s => s.id === subcategoryId);
    if (subcategory) return subcategory.name;
  }
  return 'Unknown Subcategory';
} 