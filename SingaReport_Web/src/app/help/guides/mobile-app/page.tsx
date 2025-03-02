'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Card,
  CardHeader, 
  CardTitle, 
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  Separator,
  Badge
} from '@/components/ui';
import Link from 'next/link';
import { ArrowLeftIcon, SmartphoneIcon, CheckCircleIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react';

export default function MobileAppGuidePage() {
  // For detecting elements in viewport
  const observerRefs = useRef<(HTMLElement | null)[]>([]);
  
  useEffect(() => {
    // Create animation styles
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideRight {
        from { 
          opacity: 0;
          transform: translateX(-20px);
        }
        to { 
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in-out;
      }
      
      .animate-slide-right {
        animation: slideRight 0.4s ease-out;
      }
      
      .animate-slide-up {
        animation: slideUp 0.4s ease-out;
      }
      
      .scroll-animate {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      
      .scroll-animate.active {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
    
    // Observe elements entering viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });
    
    // Get all elements with the scroll-animate class and observe them
    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach(element => {
      observer.observe(element);
      observerRefs.current.push(element as HTMLElement);
    });
    
    // Cleanup when component unmounts
    return () => {
      observerRefs.current.forEach(element => {
        if (element) observer.unobserve(element);
      });
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Mobile App User Guide</h1>
      </div>
      
      <p className="mb-8 text-lg text-gray-700 animate-slide-up">
        Learn how to use the SingaReport mobile app to report municipal issues anytime, anywhere.
      </p>
      
      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.1s' }}>
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <SmartphoneIcon className="h-6 w-6 mr-2 text-blue-600" />
              App Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The SingaReport mobile app provides a convenient way to report urban issues anytime, anywhere. Using your smartphone, you can quickly take photos, 
              mark precise locations, and submit detailed reports about road damage, streetlight failures, garbage accumulation, and more.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="border rounded-lg p-4 bg-blue-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-blue-100 transform hover:-translate-y-1">
                <h3 className="font-semibold mb-2 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Report Anywhere
                </h3>
                <p className="text-sm">Submit reports from anywhere, as long as you have a network connection.</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-blue-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-blue-100 transform hover:-translate-y-1">
                <h3 className="font-semibold mb-2 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                  GPS Location
                </h3>
                <p className="text-sm">The app automatically detects your location for more precise issue reporting.</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-blue-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-blue-100 transform hover:-translate-y-1">
                <h3 className="font-semibold mb-2 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Report Status Tracking
                </h3>
                <p className="text-sm">View the status and resolution progress of your submitted reports in real-time.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.2s' }}>
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-100">
                <h3 className="font-semibold mb-3">1. Download and Install the App</h3>
                <div className="space-y-2">
                  <p>You can download the SingaReport mobile app from the following app stores:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">iOS devices: Download from the App Store</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Android devices: Download from Google Play Store</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Huawei devices: Download from AppGallery</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">Make sure your device is running the latest operating system version for the best experience.</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-100">
                <h3 className="font-semibold mb-3">2. Create an Account or Login</h3>
                <div className="space-y-2">
                  <p>When using the app for the first time, you'll need to create an account:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Open the app and click the "Sign Up" button</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Enter your email, name, and password</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Verify your email address</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Complete your profile setup</li>
                  </ol>
                  <p className="text-sm text-gray-600 mt-2">If you already have an account, simply click "Login" and enter your credentials.</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-gray-100">
                <h3 className="font-semibold mb-3">3. Permission Settings</h3>
                <div className="space-y-2">
                  <p>The app requires the following permissions to function properly:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Camera: Take photos of issues</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Location: Determine report location</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Storage: Save photos and report drafts</li>
                    <li className="transition-all duration-300 ease-in-out hover:translate-x-1">Notifications: Receive status updates</li>
                  </ul>
                  <Alert className="mt-3 bg-amber-50 border-amber-200 transition-all duration-300 ease-in-out hover:bg-amber-100">
                    <AlertTriangleIcon className="h-5 w-5 text-amber-600" />
                    <AlertTitle>Important Note</AlertTitle>
                    <AlertDescription>
                      If you deny certain permissions, some app features may not work properly. You can modify these permissions at any time in your device settings.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.3s' }}>
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Submitting Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <p>
                Submitting reports through the mobile app is more convenient than on the website, especially when you discover issues while out and about. Here's the complete report submission process:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Badge className="mr-2 bg-green-600">Step 1</Badge>
                      Create New Report
                    </h3>
                    <p className="text-sm">
                      Tap the "+" button or "New Report" button at the bottom of the app's home screen to start creating a new report.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Badge className="mr-2 bg-green-600">Step 2</Badge>
                      Select Issue Category
                    </h3>
                    <p className="text-sm">
                      Choose the category that best describes the issue you've found from the available list, such as road maintenance, public facilities, environmental sanitation, etc.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Badge className="mr-2 bg-green-600">Step 3</Badge>
                      Add Photos
                    </h3>
                    <p className="text-sm">
                      Take photos directly within the app or upload existing photos from your gallery. Clear photos help authorities better understand and address the issue.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Badge className="mr-2 bg-green-600">Step 4</Badge>
                      Confirm Location
                    </h3>
                    <p className="text-sm">
                      The app automatically detects your current location, but you can adjust it by dragging the map marker if needed for greater accuracy.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Badge className="mr-2 bg-green-600">Step 5</Badge>
                      Add Description
                    </h3>
                    <p className="text-sm">
                      Write a clear description of the issue. Include relevant details such as how long the issue has existed, the potential impact, and any safety concerns.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Badge className="mr-2 bg-green-600">Step 6</Badge>
                      Review and Submit
                    </h3>
                    <p className="text-sm">
                      Review all the information for accuracy. You can edit any section before final submission by tapping the edit icon next to each section.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Badge className="mr-2 bg-green-600">Step 7</Badge>
                      Receive Confirmation
                    </h3>
                    <p className="text-sm">
                      After submission, you'll receive a confirmation with a unique report ID. This ID can be used to track the progress of your report.
                    </p>
                  </div>
                </div>
              </div>
              
              <Alert className="mt-4 bg-blue-50 border-blue-200 transition-all duration-300 ease-in-out hover:bg-blue-100">
                <InfoIcon className="h-5 w-5 text-blue-600" />
                <AlertTitle>Offline Reporting</AlertTitle>
                <AlertDescription>
                  If you're in an area with poor network coverage, the app can save your report draft locally. It will automatically upload when your connection is restored.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.4s' }}>
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Additional Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-50">
                <h3 className="font-semibold mb-3 text-purple-700">Report History</h3>
                <p className="text-sm mb-3">
                  View all your past reports in one place. You can:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>See the status of each report</li>
                  <li>Sort by date, category, or status</li>
                  <li>Filter to find specific reports</li>
                  <li>Re-open closed reports if issues persist</li>
                </ul>
                <p className="text-sm mt-3 text-gray-600">
                  Access your report history by tapping on "My Reports" in the main menu.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-50">
                <h3 className="font-semibold mb-3 text-purple-700">Report Updates</h3>
                <p className="text-sm mb-3">
                  Receive real-time updates on your reports:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Push notifications when status changes</li>
                  <li>Updates when authorities respond</li>
                  <li>Notifications when the issue is resolved</li>
                  <li>Follow-up requests if more information is needed</li>
                </ul>
                <p className="text-sm mt-3 text-gray-600">
                  Configure notification preferences in the app settings.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-50">
                <h3 className="font-semibold mb-3 text-purple-700">Community Map</h3>
                <p className="text-sm mb-3">
                  Explore issues reported in your area:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>View reports on an interactive map</li>
                  <li>Filter by issue type or status</li>
                  <li>See recently resolved issues</li>
                  <li>Support others' reports with upvotes</li>
                </ul>
                <p className="text-sm mt-3 text-gray-600">
                  The community map is accessible from the "Explore" tab in the app.
                </p>
              </div>
              
              <div className="border rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-md hover:bg-purple-50">
                <h3 className="font-semibold mb-3 text-purple-700">Profile Management</h3>
                <p className="text-sm mb-3">
                  Manage your account directly in the app:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Update personal information</li>
                  <li>Change password or email</li>
                  <li>Set preferred contact methods</li>
                  <li>Customize notification preferences</li>
                </ul>
                <p className="text-sm mt-3 text-gray-600">
                  Access your profile settings by tapping the profile icon in the top corner.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.5s' }}>
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md border-blue-200">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle className="text-xl">Tips for Effective Reporting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Be specific</strong> - Include detailed descriptions that help authorities understand the exact issue and its severity.</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Take clear photos</strong> - Capture the issue from multiple angles in good lighting to provide a complete picture.</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Verify location accuracy</strong> - Double-check that the pin on the map correctly marks the issue location.</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Choose the right category</strong> - Selecting the correct category ensures your report is routed to the appropriate department.</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Report promptly</strong> - Submit issues as soon as you discover them for faster resolution.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
      
      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.6s' }}>
        <div className="flex justify-center space-x-4">
          <Button asChild className="transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
            <Link href="/help">
              Return to Help Center
            </Link>
          </Button>
          <Button variant="outline" asChild className="transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
            <Link href="/help/guides/report-tracking">
              Explore Report Tracking Guide
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
} 