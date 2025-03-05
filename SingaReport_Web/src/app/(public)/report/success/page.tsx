'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, MapPin, BarChart4, Map, AlertTriangle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import AnimatedTitle from '@/components/common/AnimatedTitle';
import AnimatedCard from '@/components/common/AnimatedCard';

export default function ReportSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'pending' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get report ID (if any)
  const reportId = searchParams.get('id');
  
  // Ensure user is logged in
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);
  
  // Verify if the report has been saved to the database
  useEffect(() => {
    async function verifyReportSubmission() {
      if (!isAuthenticated || !user) return;
      
      try {
        setIsVerifying(true);
        
        // Use the verification API
        const apiUrl = reportId 
          ? `/api/reports/verify?id=${reportId}` 
          : `/api/reports/verify?minutesAgo=5`;
          
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (response.ok && data.success) {
          if (data.verified) {
            setVerificationStatus('success');
          } else {
            setVerificationStatus('error');
            setErrorMessage(data.message || 'Could not verify if the report was saved.');
          }
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.error || 'An error occurred while verifying the report.');
        }
      } catch (error) {
        console.error('Error verifying report submission:', error);
        setVerificationStatus('error');
        setErrorMessage('An error occurred while verifying the report submission. Please check your dashboard.');
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyReportSubmission();
  }, [isAuthenticated, user, reportId]);
  
  // Auto redirect to dashboard after countdown
  useEffect(() => {
    if (verificationStatus === 'error') return; // Don't auto-redirect if verification failed
    
    if (countdown <= 0) {
      router.push('/dashboard');
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown, router, verificationStatus]);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          {verificationStatus === 'error' ? (
            <>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6"
              >
                <AlertTriangle className="w-10 h-10 text-yellow-600" />
              </motion.div>
              <AnimatedTitle 
                title="Report Submitted, But Verification Incomplete"
                subtitle={`Your report has been submitted, but we could not confirm if it was successfully saved to the database. ${errorMessage}`}
              />
            </>
          ) : (
            <>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </motion.div>
              <AnimatedTitle 
                title="Report Submitted Successfully!"
                subtitle="Thank you for your submission. Your report has been received and will be reviewed by our team. We'll keep you updated on the progress."
              />
            </>
          )}
        </div>
        
        {isVerifying ? (
          <div className="text-center py-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-10 w-10 border-t-2 border-b-2 border-primary rounded-full mx-auto mb-2"
            />
            <p className="text-gray-500">Verifying report submission status...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8"
            >
              <h2 className="font-medium text-green-800 mb-2">What happens next?</h2>
              <ol className="text-green-700 space-y-2 text-sm pl-5 list-decimal">
                <li>Our team will review your report within 24-48 hours</li>
                <li>You'll receive a notification when there's an update</li>
                <li>You can track the status of your report on your dashboard</li>
                <li>Community members may upvote or comment on your report</li>
              </ol>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link href="/dashboard">
                <AnimatedCard delay={0.3} className="p-4 text-center">
                  <BarChart4 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Dashboard</h3>
                  <p className="text-sm text-gray-600">Track your reports</p>
                </AnimatedCard>
              </Link>
              
              <Link href="/map">
                <AnimatedCard delay={0.4} className="p-4 text-center">
                  <Map className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Issues Map</h3>
                  <p className="text-sm text-gray-600">Explore reported issues</p>
                </AnimatedCard>
              </Link>
              
              <Link href="/report/new">
                <AnimatedCard delay={0.5} className="p-4 text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">New Report</h3>
                  <p className="text-sm text-gray-600">Submit another report</p>
                </AnimatedCard>
              </Link>
            </div>
            
            {verificationStatus !== 'error' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-gray-500 text-sm"
              >
                Redirecting to dashboard in {countdown} seconds...
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 