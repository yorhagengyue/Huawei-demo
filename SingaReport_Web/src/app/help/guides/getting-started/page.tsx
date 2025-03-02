'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { 
  Card,
  CardHeader, 
  CardTitle, 
  CardContent,
  Alert,
  AlertTitle,
  AlertDescription,
  Button
} from '@/components/ui';
import Link from 'next/link';
import { ChevronRightIcon, InfoIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import Image from 'next/image';

export default function GettingStartedGuidePage() {
  // Animation for elements when they enter the viewport
  const [titleRef, titleInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section1Ref, section1InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section2Ref, section2InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section3Ref, section3InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section4Ref, section4InView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div 
        ref={titleRef}
        className={`transition-all duration-700 ${
          titleInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-3xl font-bold mb-8">Getting Started with SingaReport</h1>
      </div>
      
      <section 
        ref={section1Ref}
        className={`mb-10 transition-all duration-700 ${
          section1InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: '0.1s' }}
      >
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="h-6 w-6 text-blue-500" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to SingaReport, the comprehensive platform for submitting, managing, and tracking reports in Singapore. 
              This guide will walk you through the basic steps to get started with our platform.
            </p>
            
            <Alert className="transition-all duration-300 ease-in-out hover:bg-blue-50">
              <AlertTitle>Important Note</AlertTitle>
              <AlertDescription>
                To make the most of SingaReport, we recommend completing your profile information and familiarizing yourself with the reporting categories before submitting your first report.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      <section 
        ref={section2Ref}
        className={`mb-10 transition-all duration-700 ${
          section2InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: '0.2s' }}
      >
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              Step 1: Creating Your Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Registration Process</h3>
                <ol className="list-decimal ml-6 space-y-2">
                  <li className="transition-all duration-300 hover:translate-x-1">Visit the <Link href="/register" className="text-blue-500 hover:underline">registration page</Link></li>
                  <li className="transition-all duration-300 hover:translate-x-1">Enter your username, email address, and a strong password</li>
                  <li className="transition-all duration-300 hover:translate-x-1">Complete the verification process by clicking the link sent to your email</li>
                  <li className="transition-all duration-300 hover:translate-x-1">Log in with your new credentials</li>
                </ol>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Password Requirements</h3>
                  <ul className="list-disc ml-6 space-y-1">
                    <li className="transition-all duration-200 hover:translate-x-1">At least 8 characters long</li>
                    <li className="transition-all duration-200 hover:translate-x-1">Contains at least one uppercase letter</li>
                    <li className="transition-all duration-200 hover:translate-x-1">Contains at least one lowercase letter</li>
                    <li className="transition-all duration-200 hover:translate-x-1">Contains at least one number</li>
                    <li className="transition-all duration-200 hover:translate-x-1">Contains at least one special character</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg flex flex-col justify-center items-center transition-all duration-300 ease-in-out hover:shadow-md">
                <p className="text-center mb-4 text-sm text-gray-600">Example Registration Page</p>
                <div className="border shadow-sm rounded-md w-full h-48 bg-white flex items-center justify-center transition-all duration-300 hover:shadow-lg">
                  <p className="text-gray-400">Registration Form UI Preview</p>
                </div>
              </div>
            </div>
            
            <Alert className="mt-6 bg-amber-50 text-amber-800 border-amber-200 transition-all duration-300 ease-in-out hover:bg-amber-100">
              <AlertCircleIcon className="h-5 w-5" />
              <AlertTitle>Tip</AlertTitle>
              <AlertDescription>
                After registration, complete your profile information in the Account Settings section to personalize your experience.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      <section 
        ref={section3Ref}
        className={`mb-10 transition-all duration-700 ${
          section3InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: '0.3s' }}
      >
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              Step 2: Navigating the Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Once logged in, you'll be directed to your Dashboard. Here's a quick overview of the main sections:
            </p>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
              <div className="border rounded-md p-4 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/50 transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold mb-2">Dashboard Overview</h3>
                <p className="text-sm text-gray-600 mb-3">View your recent reports and overall status</p>
                <ul className="list-disc ml-6 text-sm space-y-1">
                  <li>Summary statistics of your reports</li>
                  <li>Recent activity feed</li>
                  <li>Quick access to create new reports</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/50 transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold mb-2">Reports Section</h3>
                <p className="text-sm text-gray-600 mb-3">Manage all your submitted reports</p>
                <ul className="list-disc ml-6 text-sm space-y-1">
                  <li>View all reports you've submitted</li>
                  <li>Filter by status, category, or date</li>
                  <li>Track response and resolution progress</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/50 transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold mb-2">Files Section</h3>
                <p className="text-sm text-gray-600 mb-3">Access all your uploaded documents</p>
                <ul className="list-disc ml-6 text-sm space-y-1">
                  <li>View all uploaded files</li>
                  <li>Download or share documents</li>
                  <li>Manage file tags and metadata</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-4 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary/50 transform hover:-translate-y-1">
                <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
                <p className="text-sm text-gray-600 mb-3">Personalize your account preferences</p>
                <ul className="list-disc ml-6 text-sm space-y-1">
                  <li>Update your profile information</li>
                  <li>Change password and security settings</li>
                  <li>Configure notification preferences</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section 
        ref={section4Ref}
        className={`mb-10 transition-all duration-700 ${
          section4InView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: '0.4s' }}
      >
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              Step 3: Submitting Your First Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p>
                  Creating and submitting a new report is simple. Follow these steps:
                </p>
                
                <ol className="list-decimal ml-6 space-y-3">
                  <li className="transition-all duration-300 hover:translate-x-1">
                    <strong>Start a New Report</strong>
                    <p className="text-sm text-gray-600 mt-1">Click the "Create New Report" button on your dashboard.</p>
                  </li>
                  
                  <li className="transition-all duration-300 hover:translate-x-1">
                    <strong>Fill the Report Details</strong>
                    <p className="text-sm text-gray-600 mt-1">Enter all required information, including title, description, and category.</p>
                  </li>
                  
                  <li className="transition-all duration-300 hover:translate-x-1">
                    <strong>Add Location</strong>
                    <p className="text-sm text-gray-600 mt-1">Specify the location using the map interface or by entering the address manually.</p>
                  </li>
                  
                  <li className="transition-all duration-300 hover:translate-x-1">
                    <strong>Attach Media Evidence</strong>
                    <p className="text-sm text-gray-600 mt-1">Upload photos or videos that provide evidence or context for your report.</p>
                  </li>
                  
                  <li className="transition-all duration-300 hover:translate-x-1">
                    <strong>Review and Submit</strong>
                    <p className="text-sm text-gray-600 mt-1">Review all information for accuracy and submit your report.</p>
                  </li>
                </ol>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg flex flex-col justify-center">
                <p className="text-center mb-4 text-sm text-gray-600">Report Submission Flow</p>
                <div className="space-y-2">
                  <div className="border bg-white p-2 rounded-md flex items-center transition-all duration-200 ease-in-out hover:shadow-md hover:bg-blue-50 transform hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 transition-all duration-300 group-hover:bg-blue-200">1</div>
                    <span>Enter basic report information</span>
                  </div>
                  <div className="border bg-white p-2 rounded-md flex items-center transition-all duration-200 ease-in-out hover:shadow-md hover:bg-blue-50 transform hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 transition-all duration-300 group-hover:bg-blue-200">2</div>
                    <span>Select category and subcategory</span>
                  </div>
                  <div className="border bg-white p-2 rounded-md flex items-center transition-all duration-200 ease-in-out hover:shadow-md hover:bg-blue-50 transform hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 transition-all duration-300 group-hover:bg-blue-200">3</div>
                    <span>Specify location details</span>
                  </div>
                  <div className="border bg-white p-2 rounded-md flex items-center transition-all duration-200 ease-in-out hover:shadow-md hover:bg-blue-50 transform hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 transition-all duration-300 group-hover:bg-blue-200">4</div>
                    <span>Upload supporting documents</span>
                  </div>
                  <div className="border bg-white p-2 rounded-md flex items-center transition-all duration-200 ease-in-out hover:shadow-md hover:bg-blue-50 transform hover:-translate-y-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 transition-all duration-300 group-hover:bg-blue-200">5</div>
                    <span>Submit and receive confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.5s' }}>
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              Step 4: Managing Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Files section allows you to upload, organize, and share documents within the SingaReport platform.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Uploading Files</h3>
                <ol className="list-decimal ml-6 space-y-2">
                  <li className="transition-all duration-200 hover:translate-x-1">Navigate to the Files section from the main menu</li>
                  <li className="transition-all duration-200 hover:translate-x-1">Click the "Upload File" button</li>
                  <li className="transition-all duration-200 hover:translate-x-1">Select files from your device (supported formats: JPG, PNG, PDF, DOC)</li>
                  <li className="transition-all duration-200 hover:translate-x-1">Add relevant tags and descriptions</li>
                  <li className="transition-all duration-200 hover:translate-x-1">Confirm upload and wait for processing</li>
                </ol>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">File Management Features</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li className="transition-all duration-200 hover:translate-x-1">
                    <strong>File Organization:</strong> 
                    <span className="text-sm text-gray-600"> Use tags to categorize and find your files quickly</span>
                  </li>
                  <li className="transition-all duration-200 hover:translate-x-1">
                    <strong>Access Control:</strong> 
                    <span className="text-sm text-gray-600"> Set permissions for who can view or download your files</span>
                  </li>
                  <li className="transition-all duration-200 hover:translate-x-1">
                    <strong>Version Control:</strong> 
                    <span className="text-sm text-gray-600"> Upload new versions of existing files while maintaining history</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="border p-4 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-blue-200 hover:bg-blue-50">
                  <h4 className="font-medium text-blue-600 mb-2">File Upload Limits</h4>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Maximum file size: 10MB per file</li>
                    <li>Batch upload: Up to 5 files simultaneously</li>
                    <li>Storage quota: 100MB per standard account</li>
                  </ul>
                </div>
                
                <div className="border p-4 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-blue-200 hover:bg-blue-50">
                  <h4 className="font-medium text-blue-600 mb-2">Security Measures</h4>
                  <ul className="list-disc ml-6 space-y-1 text-sm">
                    <li>Automatic virus and malware scanning</li>
                    <li>Encrypted storage of sensitive documents</li>
                    <li>Automatic file expiration for temporary shares</li>
                  </ul>
                </div>
                
                <Alert className="bg-green-50 text-green-800 border-green-200 transition-all duration-300 ease-in-out hover:bg-green-100">
                  <CheckCircleIcon className="h-5 w-5" />
                  <AlertTitle>Pro Tip</AlertTitle>
                  <AlertDescription>
                    For better organization, always add descriptive tags to your uploaded files. This makes them easier to find and categorize later.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10 scroll-animate" style={{ transitionDelay: '0.6s' }}>
        <Card className="transition-all duration-300 ease-in-out shadow-sm hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="h-6 w-6 text-blue-500" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Now that you're familiar with the basics of SingaReport, here are some advanced features to explore:
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <Link href="/help/guides/report-tracking" className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:border-blue-300">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">Report Tracking</h3>
                <p className="text-sm text-gray-600">Learn how to monitor and get updates on your submitted reports</p>
                <div className="flex justify-end mt-2">
                  <ChevronRightIcon className="h-5 w-5 text-blue-500 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </div>
              </Link>
              
              <Link href="/help/guides/advanced-search" className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:border-blue-300">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">Advanced Search</h3>
                <p className="text-sm text-gray-600">Discover how to use filters and search operators effectively</p>
                <div className="flex justify-end mt-2">
                  <ChevronRightIcon className="h-5 w-5 text-blue-500 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </div>
              </Link>
              
              <Link href="/help/guides/notifications" className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:border-blue-300">
                <h3 className="text-lg font-semibold mb-2 text-blue-600">Notifications</h3>
                <p className="text-sm text-gray-600">Set up custom alerts and notification preferences</p>
                <div className="flex justify-end mt-2">
                  <ChevronRightIcon className="h-5 w-5 text-blue-500 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                asChild
                className="transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
              >
                <Link href="/help">Return to Help Center</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 