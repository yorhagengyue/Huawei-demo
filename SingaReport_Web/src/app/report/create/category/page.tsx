'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Info, 
  AlertTriangle, 
  UtilityPole, 
  Trash, 
  HardHat, 
  CloudRain, 
  Car, 
  Lightbulb,
  Building,
  Leaf,
  Volume2,
  FileText
} from 'lucide-react';

// Report creation steps
const STEPS = {
  LOCATION: 0,
  CATEGORY: 1,
  DETAILS: 2,
  REVIEW: 3
};

// Category options with icons and descriptions
const categories = [
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: <UtilityPole className="h-12 w-12 mb-2 text-primary" />,
    description: 'Roads, bridges, public structures, potholes, street damage'
  },
  {
    id: 'cleanliness',
    name: 'Cleanliness',
    icon: <Trash className="h-12 w-12 mb-2 text-primary" />,
    description: 'Litter, illegal dumping, public bin issues, graffiti'
  },
  {
    id: 'facilities',
    name: 'Facilities',
    icon: <Building className="h-12 w-12 mb-2 text-primary" />,
    description: 'Public buildings, recreation areas, street furniture, lighting'
  },
  {
    id: 'safety',
    name: 'Safety',
    icon: <AlertTriangle className="h-12 w-12 mb-2 text-primary" />,
    description: 'Hazardous conditions, dangerous areas, public safety issues'
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: <Leaf className="h-12 w-12 mb-2 text-primary" />,
    description: 'Trees, plants, parks, drainage, flooding, water issues'
  },
  {
    id: 'noise',
    name: 'Noise',
    icon: <Volume2 className="h-12 w-12 mb-2 text-primary" />,
    description: 'Excessive noise, late night disturbances, construction noise'
  },
  {
    id: 'construction',
    name: 'Construction',
    icon: <HardHat className="h-12 w-12 mb-2 text-primary" />,
    description: 'Construction sites, building work, roadwork, barriers'
  },
  {
    id: 'other',
    name: 'Other',
    icon: <FileText className="h-12 w-12 mb-2 text-primary" />,
    description: 'Any other issue not covered by the categories above'
  }
];

export default function CategorySelectionPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Current step
  const currentStep = STEPS.CATEGORY;
  
  // Progress calculation
  const progress = ((currentStep + 1) / Object.keys(STEPS).length) * 100;
  
  useEffect(() => {
    // Check if location data exists in session storage
    const locationString = sessionStorage.getItem('reportLocation');
    if (!locationString) {
      // No location data, redirect back to location selection
      router.push('/report/create/location');
      return;
    }
    
    try {
      const location = JSON.parse(locationString);
      setLocationData(location);
      
      // Check if category is already selected (coming back from details page)
      const categoryData = sessionStorage.getItem('reportCategory');
      if (categoryData) {
        setSelectedCategory(JSON.parse(categoryData));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to parse location data:', error);
      setError('An error occurred loading previous data. Please try again.');
      setIsLoading(false);
    }
  }, [router]);
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  const handleNext = () => {
    if (!selectedCategory) {
      setError('Please select a category to continue');
      return;
    }
    
    try {
      // Save selected category to session storage
      sessionStorage.setItem('reportCategory', JSON.stringify(selectedCategory));
      
      // Navigate to details page
      router.push('/report/create/details');
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save your selection. Please try again.');
    }
  };
  
  const handleBack = () => {
    router.push('/report/create/location');
  };
  
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-center" style={{ minHeight: '50vh' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Report an Issue</h1>
      
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
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mb-1">2</div>
          <span>Category</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mb-1">3</div>
          <span>Details</span>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">What type of issue are you reporting?</h2>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      {/* Category selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary/10 border-primary'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className="flex flex-col items-center text-center">
              {category.icon}
              <h3 className="font-medium text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="mb-6">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p>Select the category that best matches the issue you're reporting. This helps us route your report to the right department.</p>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className={`px-4 py-2 bg-primary text-white rounded-md ${
            !selectedCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
          }`}
          disabled={!selectedCategory}
        >
          Next
        </button>
      </div>
    </div>
  );
} 