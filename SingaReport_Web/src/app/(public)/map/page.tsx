'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Sample data for development
const SAMPLE_REPORTS = [
  {
    id: 'REP-001',
    title: 'Pothole on Orchard Road',
    category: 'roads',
    status: 'under_review',
    location: {
      address: 'Orchard Road, near ION Orchard',
      latitude: 1.3038, 
      longitude: 103.8321
    },
    submitted: '2023-12-15T08:30:00Z',
    upvotes: 12
  },
  {
    id: 'REP-002',
    title: 'Fallen Tree Branch',
    category: 'environment',
    status: 'in_progress',
    location: {
      address: 'East Coast Park, Area C',
      latitude: 1.3014, 
      longitude: 103.9089
    },
    submitted: '2023-12-10T14:22:00Z',
    upvotes: 8
  },
  {
    id: 'REP-003',
    title: 'Faulty Traffic Light',
    category: 'roads',
    status: 'resolved',
    location: {
      address: 'Junction of Bukit Timah Road and Dunearn Road',
      latitude: 1.3258, 
      longitude: 103.8174
    },
    submitted: '2023-12-05T11:15:00Z',
    upvotes: 32
  },
  {
    id: 'REP-004',
    title: 'Illegal Dumping',
    category: 'cleanliness',
    status: 'pending',
    location: {
      address: 'Behind Block 123, Clementi Ave 6',
      latitude: 1.3114, 
      longitude: 103.7644
    },
    submitted: '2023-12-13T17:05:00Z',
    upvotes: 3
  },
  {
    id: 'REP-005',
    title: 'Broken Playground Equipment',
    category: 'facilities',
    status: 'in_progress',
    location: {
      address: 'Bishan Park Playground',
      latitude: 1.3583, 
      longitude: 103.8350
    },
    submitted: '2023-12-08T09:45:00Z',
    upvotes: 15
  },
  {
    id: 'REP-006',
    title: 'Flooding after Rain',
    category: 'others',
    status: 'pending',
    location: {
      address: 'Underpass at Braddell Road',
      latitude: 1.3406, 
      longitude: 103.8471
    },
    submitted: '2023-12-14T16:20:00Z',
    upvotes: 23
  },
  {
    id: 'REP-007',
    title: 'Street Light Not Working',
    category: 'facilities',
    status: 'pending',
    location: {
      address: 'Tampines Street 45',
      latitude: 1.3496, 
      longitude: 103.9568
    },
    submitted: '2023-12-12T19:10:00Z',
    upvotes: 7
  },
];

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    under_review: { color: 'bg-blue-100 text-blue-800', label: 'Under Review' },
    in_progress: { color: 'bg-purple-100 text-purple-800', label: 'In Progress' },
    resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  
  // Categories for filtering
  const categories = [
    { id: 'roads', name: 'Roads', icon: '🛣️' },
    { id: 'cleanliness', name: 'Cleanliness', icon: '🧹' },
    { id: 'facilities', name: 'Facilities', icon: '🏛️' },
    { id: 'safety', name: 'Safety', icon: '⚠️' },
    { id: 'environment', name: 'Environment', icon: '🌳' },
    { id: 'noise', name: 'Noise', icon: '🔊' },
    { id: 'construction', name: 'Construction', icon: '🏗️' },
    { id: 'others', name: 'Others', icon: '📋' },
  ];

  // Filter reports based on selected filters
  const filteredReports = SAMPLE_REPORTS.filter(report => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(report.category)) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && report.status !== statusFilter) {
      return false;
    }
    
    // Time range filter
    if (timeRange !== 'all') {
      const reportDate = new Date(report.submitted);
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
        report.location.address.toLowerCase().includes(query) ||
        report.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Simulate map loading
  useEffect(() => {
    // In a real implementation, this would be where you initialize the map library
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Issue Map</h1>
          <p className="text-gray-600 mt-2">Explore reported issues across Singapore</p>
        </div>
        
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
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
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
                href="/report/new" 
                className="px-3 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
              >
                + New Report
              </Link>
            </div>
          </div>
        </div>
        
        {/* Map and List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-[600px] relative">
              {!mapLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gray-200">
                  {/* This would be replaced with an actual map component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 mb-3">Interactive Map Placeholder</p>
                      <p className="text-xs text-gray-400">
                        In a real implementation, this would use a mapping library like Google Maps, 
                        Mapbox, or Leaflet to display the reports on an interactive map of Singapore.
                      </p>
                      <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
                        {filteredReports.map((report) => (
                          <div 
                            key={report.id} 
                            className="bg-white p-2 rounded-lg shadow-md text-center"
                            style={{
                              position: 'absolute',
                              left: `${(report.location.longitude - 103.75) * 500}px`,
                              top: `${(1.36 - report.location.latitude) * 500}px`,
                            }}
                          >
                            <div 
                              className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white"
                              style={{
                                backgroundColor: report.status === 'resolved' ? '#16a34a' : 
                                                report.status === 'in_progress' ? '#9333ea' : 
                                                report.status === 'under_review' ? '#2563eb' : '#eab308'
                              }}
                            >
                              {getCategoryIcon(report.category)}
                            </div>
                            <div className="text-xs mt-1 font-medium">{report.id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
                                backgroundColor: report.status === 'resolved' ? '#16a34a' : 
                                                report.status === 'in_progress' ? '#9333ea' : 
                                                report.status === 'under_review' ? '#2563eb' : '#eab308'
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
                        <p className="text-sm text-gray-600 mb-2">{report.location.address}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{formatDate(report.submitted)}</span>
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            {report.upvotes}
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
          </div>
        </div>
      </div>
    </div>
  );
} 