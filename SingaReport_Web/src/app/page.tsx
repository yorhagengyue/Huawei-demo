'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WelcomePrompt from '@/components/welcome/WelcomePrompt';
import { useAuth } from '@/contexts/AuthContext';
import { FiMapPin, FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
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
    <main className="min-h-screen">
      {/* First-time visitor prompt */}
      <WelcomePrompt />
      
      {/* Hero Section - Personalized for logged in users */}
      <section className="bg-gradient-to-b from-primary/5 to-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {!isLoading && user ? 
                `Welcome back, ${user.name || user.username}!` : 
                'Singapore Urban Issues Reporting Platform'}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {!isLoading && user ? 
                'Continue making an impact in your community by reporting and tracking urban issues.' : 
                'Report urban issues, track progress, and improve your community'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/report"
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center"
              >
                Report an Issue <FiArrowRight className="ml-2" />
              </Link>
              
              {!isLoading && user ? (
                <Link
                  href="/dashboard"
                  className="bg-white text-primary border border-primary px-6 py-3 rounded-md hover:bg-primary/5 transition-colors font-medium"
                >
                  View My Reports
                </Link>
              ) : (
                <Link
                  href="/map"
                  className="bg-white text-primary border border-primary px-6 py-3 rounded-md hover:bg-primary/5 transition-colors font-medium"
                >
                  View Active Reports
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Real-time map preview */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Real-time Hotspot Map</h2>
            <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-md">
              {isMapLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Image
                  src="/images/map-preview.jpg"
                  alt="Singapore issue map preview"
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute bottom-4 right-4">
                <Link
                  href="/map"
                  className="bg-white text-primary px-4 py-2 rounded-md shadow-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
                >
                  Open Full Map <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
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