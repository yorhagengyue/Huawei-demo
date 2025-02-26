'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">SingaReport</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/map" className="text-gray-600 hover:text-primary">
              Issue Map
            </Link>
            <Link href="/report/new" className="text-gray-600 hover:text-primary">
              Report Issue
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-primary">
              My Reports
            </Link>
            <Link href="/help" className="text-gray-600 hover:text-primary">
              Help
            </Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                className="flex items-center text-gray-600 hover:text-primary"
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              >
                <span className="mr-1">EN</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      English
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      中文 (Chinese)
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Bahasa Melayu
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Login/Register Buttons */}
            <Link 
              href="/login" 
              className="text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/5 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <nav className="flex flex-col space-y-3 pb-3">
              <Link href="/map" className="text-gray-600 hover:text-primary">
                Issue Map
              </Link>
              <Link href="/report/new" className="text-gray-600 hover:text-primary">
                Report Issue
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-primary">
                My Reports
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-primary">
                Help
              </Link>
            </nav>
            <div className="pt-3 border-t border-gray-100 flex flex-col space-y-3">
              <div className="flex space-x-2">
                <button className="text-sm text-gray-600 hover:text-primary">English</button>
                <button className="text-sm text-gray-600 hover:text-primary">中文</button>
                <button className="text-sm text-gray-600 hover:text-primary">Bahasa</button>
                <button className="text-sm text-gray-600 hover:text-primary">தமிழ்</button>
              </div>
              <div className="flex space-x-2">
                <Link 
                  href="/login" 
                  className="text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary/5 text-sm transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 text-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 