'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WelcomePrompt from '@/components/welcome/WelcomePrompt';
import { useAuth } from '@/contexts/AuthContext';
import { FiMapPin, FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowRight } from 'react-icons/fi';
import { Info } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import map components to ensure they only load client-side
const MapContainer = dynamic(() => import('@/components/maps/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const { user, isLoading } = useAuth();
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Ensure map only renders on client-side
  useEffect(() => {
    setIsMapVisible(true);
  }, []);

  // Categories for the feature section
  const categories = [
    {
      icon: <FiAlertTriangle className="h-6 w-6 text-orange-500" />,
      title: 'Infrastructure Issues',
      description: 'Report potholes, damaged sidewalks, or street light outages'
    },
    {
      icon: <FiMapPin className="h-6 w-6 text-blue-500" />,
      title: 'Public Facilities',
      description: 'Report issues with parks, public toilets, or communal areas'
    },
    {
      icon: <FiCheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Environmental Concerns',
      description: 'Report littering, pollution, or other environmental issues'
    },
    {
      icon: <FiInfo className="h-6 w-6 text-purple-500" />,
      title: 'Public Transport',
      description: 'Report issues with bus stops, train stations, or service'
    }
  ];

  // Success stories for the testimonial section
  const successStories = [
    {
      title: 'Pothole Repair on Orchard Road',
      description: 'A dangerous pothole was fixed within 3 days of reporting',
      image: '/images/success-1.jpg'
    },
    {
      title: 'Street Light Replacement',
      description: 'Dark street corner now properly lit after community reports',
      image: '/images/success-2.jpg'
    },
    {
      title: 'Park Cleanup Initiative',
      description: 'Local park restored after multiple littering reports',
      image: '/images/success-3.jpg'
    }
  ];

  return (
    <main className="flex min-h-screen flex-col">
      {/* First-time visitor prompt */}
      <WelcomePrompt />
      
      {/* Hero section */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Make Singapore Better <span className="text-primary">Together</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Report urban issues, track their resolution, and help improve our city. Your feedback creates a better Singapore for everyone.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/report/create" 
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-md transition-colors"
                >
                  Report an Issue
                </Link>
                <Link 
                  href="/map" 
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-primary font-medium rounded-lg shadow-md border border-gray-200 transition-colors"
                >
                  View Issue Map
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <Image
                  src="/logo.png"
                  alt="SingaReport Logo"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Hotspot Map */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Real-time Hotspot Map</h2>
            <p className="text-gray-600 mt-2">See where issues are being reported around Singapore</p>
          </div>
          
          <div className="h-[400px] relative rounded-lg overflow-hidden shadow-lg">
            {typeof window !== 'undefined' && isMapVisible && (
              <MapContainer 
                center={{ lat: 1.3521, lng: 103.8198 }} 
                zoom={11}
              />
            )}
            
            {(!isMapVisible || typeof window === 'undefined') && (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading map...</p>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-4 right-4">
              <Link 
                href="/map" 
                className="px-4 py-2 bg-white text-primary hover:bg-gray-50 font-medium rounded-lg shadow-md transition-colors flex items-center space-x-1"
              >
                <span>View Full Map</span>
                <FiArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What Can You Report? Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">What Can You Report?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                <div className="relative h-48">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                  {/* Image would be loaded here in production */}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  <p className="text-gray-600">{story.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Based on Login Status */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {!isLoading && user ? (
              <>
                <h2 className="text-3xl font-bold mb-4">Continue Making an Impact</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Your community engagement matters. Keep reporting issues and track their progress.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/report"
                    className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    Submit New Report
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white text-primary border border-primary px-6 py-3 rounded-md hover:bg-primary/5 transition-colors font-medium"
                  >
                    View Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Create an account to report issues, track progress, and help improve Singapore.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium"
                  >
                    Register Now
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white text-primary border border-primary px-6 py-3 rounded-md hover:bg-primary/5 transition-colors font-medium"
                  >
                    Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
} 