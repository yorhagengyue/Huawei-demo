'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Info } from 'lucide-react';

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
  // Check if client-side
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [step, setStep] = useState(STEPS.LOCATION);
  const [formData, setFormData] = useState({
    location: {
      latitude: null,
      longitude: null,
      address: '',
    },
    category: '',
    subcategory: '',
    title: '',
    description: '',
    images: [],
    anonymous: false,
  });

  // Progress bar calculation
  const progress = ((step + 1) / Object.keys(STEPS).length) * 100;

  // Handle next step navigation
  const onNext = () => {
    if (step < Object.keys(STEPS).length - 1) {
      setStep(step + 1);
    }
  };

  // Handle previous step navigation
  const onBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Update form data
  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData({...formData, ...data});
  };

  // Handle form submission
  const onSubmit = async () => {
    // This would connect to the API endpoint to submit the report
    console.log('Submitting report:', formData);
    // Redirect to success page or dashboard after submission
    // router.push('/report/success');
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

  // ... rest of the component
  // ... existing category, details, review steps
  
  // Return the appropriate step content based on current step
  const getStepContent = () => {
    switch(step) {
      case STEPS.LOCATION:
        return locationStep;
      // ... other cases for different steps
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {getStepContent()}
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
          disabled={
            (step === STEPS.LOCATION && !formData.location.latitude) ||
            (step === STEPS.CATEGORY && !formData.category) ||
            (step === STEPS.DETAILS && !formData.title)
          }
          className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 ${
            ((step === STEPS.LOCATION && !formData.location.latitude) ||
            (step === STEPS.CATEGORY && !formData.category) ||
            (step === STEPS.DETAILS && !formData.title)) 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          {step === STEPS.REVIEW ? 'Submit Report' : 'Next'}
        </button>
      </div>
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