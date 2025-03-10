'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MapContainer from '@/components/maps/MapContainer';
import MapMarker from '@/components/maps/MapMarker';
import { MarkerClusterer } from '@react-google-maps/api';
import { Info, AlertCircle, Clock, CheckCircle, X, Loader2, Database } from 'lucide-react';

// Define report interface
interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

// Global reports indicator component
function GlobalReportsIndicator() {
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-indigo-700">
            <span className="font-medium">Global View:</span> You are viewing reports from all users.
            This is a public view that shows all submitted reports across the platform.
          </p>
        </div>
      </div>
    </div>
  );
}

// Demo data indicator component
function DemoDataIndicator({ isDemoData = false }) {
  if (!isDemoData) return null;
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <Database className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Demo Mode:</span> You are viewing sample data. 
            To view actual reports, ensure your database is properly configured.
          </p>
        </div>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch(status.toLowerCase()) {
      case 'open':
        return { color: 'bg-blue-100 text-blue-800', label: 'Open', icon: <AlertCircle className="mr-1 h-3 w-3" /> };
      case 'in_progress':
      case 'in progress':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: <Clock className="mr-1 h-3 w-3" /> };
      case 'resolved':
        return { color: 'bg-green-100 text-green-800', label: 'Resolved', icon: <CheckCircle className="mr-1 h-3 w-3" /> };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: <X className="mr-1 h-3 w-3" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status.charAt(0).toUpperCase() + status.slice(1), icon: <Info className="mr-1 h-3 w-3" /> };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// Category filter component
function CategoryFilter({ categories, selectedCategories, onChange }: { 
  categories: { id: string, name: string, icon: string }[],
  selectedCategories: string[],
  onChange: (categories: string[]) => void
}) {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
            selectedCategories.includes(category.id)
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => toggleCategory(category.id)}
        >
          <span className="mr-1.5">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  
  // Categories for filtering
  const categories = [
    { id: 'infrastructure', name: 'Infrastructure', icon: '🛣️' },
    { id: 'cleanliness', name: 'Cleanliness', icon: '🧹' },
    { id: 'facilities', name: 'Facilities', icon: '🏛️' },
    { id: 'safety', name: 'Safety', icon: '⚠️' },
    { id: 'environment', name: 'Environment', icon: '🌳' },
    { id: 'noise', name: 'Noise', icon: '🔊' },
    { id: 'construction', name: 'Construction', icon: '🏗️' },
    { id: 'other', name: 'Other', icon: '📋' },
  ];

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // Load all reports
  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching all real reports from ALL USERS...');
        
        // Only fetch real reports from database, not demo data
        // Make API request without userId parameter to get all reports from all users
        const url = new URL('/api/reports', window.location.origin);
        
        // Force database mode by adding a parameter and explicitly request all users' reports
        url.searchParams.append('forceDatabase', 'true');
        url.searchParams.append('allUsers', 'true'); // Additional hint
        
        console.log(`Making request to: ${url.toString()}`);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.reports?.length || 0} real reports from ALL USERS`);
        
        if (data.reports?.length > 0) {
          console.log('Sample report:', data.reports[0]);
        } else {
          console.log('No real reports found in the database for ANY USER');
          console.log('Please ensure some reports have been submitted first');
        }
        
        // Set the reports and mark them as real data
        setReports(data.reports || []);
        setIsDemoData(false);
        setMapLoaded(true);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllReports();
  }, []);
  
  // Filter reports based on selected filters
  const filteredReports = reports.filter(report => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(report.category)) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && report.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    
    // Time range filter
    if (timeRange !== 'all') {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (timeRange === 'today' && daysDiff > 0) return false;
      if (timeRange === 'week' && daysDiff > 7) return false;
      if (timeRange === 'month' && daysDiff > 30) return false;
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query) ||
        (report.location && report.location.toLowerCase().includes(query)) ||
        report.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id.toLowerCase() === categoryId.toLowerCase());
    return category ? category.name : categoryId;
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id.toLowerCase() === categoryId.toLowerCase());
    return category ? category.icon : '📋';
  };

  // Get severity level
  const getSeverityLabel = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return severity;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Reports Map</h1>
          <p className="text-gray-600 mt-2">Explore all reported issues from all users across Singapore</p>
        </div>
        
        {/* Global Reports Indicator */}
        <GlobalReportsIndicator />
        
        {/* Demo Data Indicator */}
        <DemoDataIndicator isDemoData={isDemoData} />
        
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title, location, or ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                Time Range
              </label>
              <select
                id="timeRange"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <CategoryFilter 
              categories={categories}
              selectedCategories={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{filteredReports.length}</span> reports found
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setSelectedCategories([]);
                  setStatusFilter('all');
                  setTimeRange('all');
                  setSearchQuery('');
                }}
              >
                Clear All Filters
              </button>
              
              <Link 
                href="/report/create" 
                className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
              >
                + New Report
              </Link>
            </div>
          </div>
        </div>
        
        {/* Map and List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {!loading && !error && reports.length === 0 && (
            <div className="lg:col-span-3 bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-blue-800">No reports found</h3>
                  <div className="mt-2 text-blue-700 space-y-2">
                    <p>There are no reports available to display. This could be due to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>No reports have been submitted yet</li>
                      <li>Demo mode is disabled and database connection is not configured</li>
                      <li>The API is experiencing issues</li>
                    </ul>
                    <p className="font-medium mt-4">To see sample data for demonstration purposes:</p>
                    <div className="bg-white p-3 rounded text-sm font-mono text-gray-800 mt-2">
                      1. Open <span className="font-semibold">SingaReport_Web/.env.local</span><br />
                      2. Set <span className="font-semibold">NEXT_PUBLIC_DEMO_MODE=&quot;true&quot;</span><br />
                      3. Restart the development server
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Map View */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-[600px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-gray-500">Loading reports...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center max-w-md px-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Map</h3>
                    <p className="text-gray-600">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0">
                  {typeof window !== 'undefined' && mapLoaded && (
                    <MapContainer zoom={12}>
                      <MarkerClusterer
                        options={{
                          gridSize: 50,
                          minimumClusterSize: 3,
                          zoomOnClick: true,
                          maxZoom: 15,
                          averageCenter: true
                        }}
                      >
                        {(clusterer) => 
                          filteredReports.map((report) => (
                            report.latitude && report.longitude ? (
                              <MapMarker
                                key={report.id}
                                position={{
                                  lat: report.latitude,
                                  lng: report.longitude
                                }}
                                reportInfo={{
                                  id: report.id,
                                  title: report.title,
                                  description: report.description,
                                  status: report.status,
                                  category: report.category,
                                  severity: report.severity,
                                  location: report.location,
                                  createdAt: report.createdAt
                                }}
                                showTooltip={true}
                                onClick={() => {
                                  // Navigate to report details page
                                  window.location.href = `/report/${report.id}`;
                                }}
                                clusterer={clusterer}
                                zIndex={
                                  report.severity?.toLowerCase() === 'high' ? 3 :
                                  report.severity?.toLowerCase() === 'medium' ? 2 : 1
                                }
                              />
                            ) : null
                          ))
                        }
                      </MarkerClusterer>
                    </MapContainer>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* List View */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">List View</h2>
              <p className="text-sm text-gray-500">Click on a report to view details</p>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="max-h-[560px] overflow-y-auto">
                {filteredReports.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <Link key={report.id} href={`/report/${report.id}`}>
                        <div className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white"
                                style={{
                                  backgroundColor: 
                                    report.status.toLowerCase() === 'resolved' ? '#16a34a' : 
                                    report.status.toLowerCase() === 'in_progress' ? '#ca8a04' : 
                                    report.status.toLowerCase() === 'open' ? '#2563eb' : '#6b7280'
                                }}
                              >
                                {getCategoryIcon(report.category)}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{report.title}</h3>
                                <p className="text-xs text-gray-500">{report.id}</p>
                              </div>
                            </div>
                            <StatusBadge status={report.status} />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.location || 'No location specified'}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{formatDate(report.createdAt)}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100">
                              {getSeverityLabel(report.severity)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-500 mb-6">
                      Try adjusting your filters or search criteria
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setStatusFilter('all');
                        setTimeRange('all');
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 