'use client';

import { useState } from 'react';
import Link from 'next/link';

// Report creation steps
const STEPS = {
  LOCATION: 0,
  CATEGORY: 1,
  DETAILS: 2,
  REVIEW: 3,
}

export default function NewReportPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
            <p className="text-gray-600 mt-2">Help improve Singapore by reporting urban issues</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span className={step >= STEPS.LOCATION ? 'text-primary font-medium' : ''}>Location</span>
              <span className={step >= STEPS.CATEGORY ? 'text-primary font-medium' : ''}>Category</span>
              <span className={step >= STEPS.DETAILS ? 'text-primary font-medium' : ''}>Details</span>
              <span className={step >= STEPS.REVIEW ? 'text-primary font-medium' : ''}>Review</span>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              {/* Step content */}
              {step === STEPS.LOCATION && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Where is the issue located?</h2>
                  <div className="bg-gray-100 h-[300px] rounded-lg flex items-center justify-center">
                    {/* Map placeholder - would be replaced with actual map component */}
                    <p className="text-gray-500">Map Loading...</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        placeholder="Enter location or address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={formData.location.address}
                        onChange={(e) => updateFormData({ 
                          location: { 
                            ...formData.location, 
                            address: e.target.value 
                          } 
                        })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        <span className="mr-2">📍</span> Use Current Location
                      </button>
                      <button 
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        <span className="mr-2">🔍</span> Search Location
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === STEPS.CATEGORY && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">What type of issue are you reporting?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={`border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors ${
                          formData.category === category.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-gray-200'
                        }`}
                        onClick={() => updateFormData({ category: category.id })}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                      </button>
                    ))}
                  </div>

                  {formData.category && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">Select a subcategory</h3>
                      <div className="space-y-2">
                        {getSubcategories(formData.category).map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center">
                            <input
                              type="radio"
                              id={subcategory.id}
                              name="subcategory"
                              className="text-primary focus:ring-primary"
                              checked={formData.subcategory === subcategory.id}
                              onChange={() => updateFormData({ subcategory: subcategory.id })}
                            />
                            <label htmlFor={subcategory.id} className="ml-2 text-gray-700">
                              {subcategory.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === STEPS.DETAILS && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Provide additional details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Brief summary of the issue"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={formData.title}
                        onChange={(e) => updateFormData({ title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe the issue in detail"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Photos
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <div className="text-gray-500">
                          <p>Drag and drop images here or click to upload</p>
                          <p className="text-xs mt-1">Max 5 images, 10MB each</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          multiple 
                        />
                        <button className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium">
                          Select Files
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="anonymous"
                        className="text-primary focus:ring-primary h-4 w-4"
                        checked={formData.anonymous}
                        onChange={(e) => updateFormData({ anonymous: e.target.checked })}
                      />
                      <label htmlFor="anonymous" className="ml-2 text-gray-700 text-sm">
                        Submit this report anonymously
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === STEPS.REVIEW && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Review and Submit</h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="text-gray-900">{formData.location.address || 'No address provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p className="text-gray-900">
                        {getCategoryName(formData.category)} &gt; {getSubcategoryName(formData.subcategory)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Title</h3>
                      <p className="text-gray-900">{formData.title || 'No title provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="text-gray-900">{formData.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Photos</h3>
                      <p className="text-gray-900">
                        {formData.images.length > 0 
                          ? `${formData.images.length} photos uploaded` 
                          : 'No photos uploaded'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Anonymous</h3>
                      <p className="text-gray-900">{formData.anonymous ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">
                      By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                {step > 0 ? (
                  <button
                    onClick={onBack}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </Link>
                )}
                
                {step < Object.keys(STEPS).length - 1 ? (
                  <button
                    onClick={onNext}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={onSubmit}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 font-medium"
                  >
                    Submit Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample data for the page
const categories = [
  { id: 'roads', name: 'Road Issues', icon: '🛣️' },
  { id: 'cleanliness', name: 'Cleanliness', icon: '🧹' },
  { id: 'facilities', name: 'Public Facilities', icon: '🏛️' },
  { id: 'safety', name: 'Safety Concerns', icon: '⚠️' },
  { id: 'environment', name: 'Environment', icon: '🌳' },
  { id: 'noise', name: 'Noise Issues', icon: '🔊' },
  { id: 'construction', name: 'Construction', icon: '🏗️' },
  { id: 'others', name: 'Others', icon: '📋' },
];

const subcategories = {
  roads: [
    { id: 'potholes', name: 'Potholes' },
    { id: 'road_damage', name: 'Road Damage' },
    { id: 'traffic_lights', name: 'Traffic Light Issues' },
    { id: 'road_markings', name: 'Faded Road Markings' },
  ],
  cleanliness: [
    { id: 'littering', name: 'Littering' },
    { id: 'illegal_dumping', name: 'Illegal Dumping' },
    { id: 'public_cleanliness', name: 'Public Area Cleanliness' },
  ],
  // Additional subcategories for other categories would be defined here
};

// Helper functions
function getSubcategories(categoryId: string) {
  return subcategories[categoryId as keyof typeof subcategories] || [];
}

function getCategoryName(categoryId: string) {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : '';
}

function getSubcategoryName(subcategoryId: string) {
  for (const categoryId in subcategories) {
    const subcat = subcategories[categoryId as keyof typeof subcategories].find(s => s.id === subcategoryId);
    if (subcat) return subcat.name;
  }
  return '';
} 