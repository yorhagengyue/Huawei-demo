'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiLogIn, FiEye } from 'react-icons/fi';
import AnimatedButton from '@/components/common/AnimatedButton';

export default function WelcomePrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, isLoading } = useAuth();
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if the user has visited the site before
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    setHasVisitedBefore(!!hasVisited);

    // Show the prompt if user is not logged in and it's their first visit
    if (!isLoading && !user && !hasVisited) {
      // Slight delay for better UX - shows after content loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  // Handle prompt dismissal with storage update
  const dismissPrompt = () => {
    setIsVisible(false);
    localStorage.setItem('hasVisitedBefore', 'true');
  };

  if (!isMounted || isLoading || user) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay with improved animation */}
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-40 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissPrompt}
            transition={{ duration: 0.3 }}
          />
          
          {/* Welcome Prompt Card with enhanced animations */}
          <motion.div 
            className="fixed bottom-10 left-0 right-0 mx-auto max-w-2xl bg-white shadow-xl border border-gray-200 rounded-lg z-40 p-6 overflow-hidden"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ 
              type: "spring",
              duration: 0.5,
              bounce: 0.2
            }}
          >
            <motion.div 
              className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="flex flex-col relative z-10">
              <motion.div 
                className="text-center mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-primary mb-2">Welcome to SingaReport!</h3>
                <p className="text-gray-600">
                  Join our community platform for reporting and tracking urban issues in Singapore.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <motion.div 
                  className="bg-gray-50 p-4 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <h4 className="font-semibold text-lg mb-2">Why Register?</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {['Submit and track your own reports', 'Receive status updates and notifications', 'Participate in community discussions'].map((item, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                        className="flex items-start"
                      >
                        <motion.span 
                          className="text-green-500 mr-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            delay: 0.5 + (index * 0.2),
                            duration: 0.5,
                            repeat: 1
                          }}
                        >
                          ✓
                        </motion.span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
                
                <motion.div 
                  className="bg-primary/5 p-4 rounded-lg"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <h4 className="font-semibold text-lg mb-2">Getting Started</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {[
                      {step: '1', text: 'Create a free account'},
                      {step: '2', text: 'Verify your email address'},
                      {step: '3', text: 'Start reporting issues in your area'}
                    ].map((item, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                        className="flex items-start"
                      >
                        <motion.span 
                          className="text-primary mr-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            delay: 0.5 + (index * 0.2),
                            duration: 0.5,
                            repeat: 1
                          }}
                        >
                          {item.step}.
                        </motion.span>
                        {item.text}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <AnimatedButton
                  variant="primary"
                  onClick={() => window.location.href = '/register'}
                  icon={<FiUserPlus className="mr-1" />}
                >
                  Register Now
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  onClick={() => window.location.href = '/login'}
                  icon={<FiLogIn className="mr-1" />}
                >
                  Login
                </AnimatedButton>
                <AnimatedButton
                  variant="secondary"
                  onClick={dismissPrompt}
                  icon={<FiEye className="mr-1" />}
                >
                  Explore First
                </AnimatedButton>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 