'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RegisterSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Automatically redirect to dashboard after countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for joining SingaReport. Your account has been created successfully.
          </p>
          
          <div className="border border-green-100 bg-green-50 rounded-md py-3 px-4 mb-6">
            <p className="text-sm text-green-800">
              A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your account.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">
                You will be redirected to your dashboard in {countdown} seconds
              </p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${(countdown / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link
                href="/dashboard"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
              
              <Link
                href="/report/create"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Submit First Report
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              What's Next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Complete your profile by adding additional information</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Explore the map to see ongoing issues in your area</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Submit your first report to help improve your community</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 