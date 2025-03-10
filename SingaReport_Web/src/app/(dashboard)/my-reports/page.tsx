'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertCircle, Clock, CheckCircle, 
  FileText, Filter, Search, MapPin
} from 'lucide-react';
import Link from 'next/link';
import PageTransition from '@/components/common/PageTransition';
import MapContainer from '@/components/maps/MapContainer';
import MapMarker from '@/components/maps/MapMarker';
import { getUserIdFromToken } from '@/lib/utils/jwt-parser';
import { MarkerClusterer } from '@react-google-maps/api';

// 报告类型定义
interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  severity: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isDemo?: boolean;
}

export default function MyReportsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch user reports
  useEffect(() => {
    const fetchUserReports = async () => {
      if (!user?.id) {
        console.log('No user ID available, skipping report fetch');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure we have a valid user ID
        const userId = user.id.trim();
        if (!userId) {
          throw new Error('Invalid user ID');
        }
        
        console.log(`Fetching reports for user ID: "${userId}"`);
        
        // Build URL with URLSearchParams to ensure proper encoding
        const url = new URL('/api/reports', window.location.origin);
        url.searchParams.append('userId', userId);
        
        console.log(`Making request to: ${url.toString()}`);
        
        // Get auth token from cookie
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];
        
        // Double-check user ID from token matches context
        if (authToken) {
          const tokenUserId = getUserIdFromToken(authToken);
          if (tokenUserId && tokenUserId !== userId) {
            console.warn(`User ID mismatch: context=${userId}, token=${tokenUserId}`);
          } else if (tokenUserId) {
            console.log(`User ID verified: context and token both have ${userId}`);
          }
        }
        
        // Prepare headers with auth token if available
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        };
        
        if (authToken) {
          console.log('Adding Authorization header with token');
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        // Make API request with explicit userId parameter and auth header
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.reports?.length || 0} reports for user ID: "${userId}"`);
        
        if (data.reports?.length === 0) {
          console.log('No reports found for this user');
        } else {
          console.log('First report:', data.reports[0]);
          
          // Verify user ID matches for each report
          const mismatchedReports = data.reports.filter((report: Report) => report.userId !== userId);
          if (mismatchedReports.length > 0) {
            console.warn(`Found ${mismatchedReports.length} reports with mismatched user IDs`);
            console.warn('Example mismatched report:', mismatchedReports[0]);
          }
        }
        
        // Set reports state
        setReports(data.reports || []);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load your reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchUserReports();
    }
  }, [user?.id]);
  
  // 检查用户是否已登录
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/my-reports');
    }
  }, [authLoading, isAuthenticated, router]);
  
  // 按状态过滤报告
  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === statusFilter);
  
  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><AlertCircle className="mr-1 h-3 w-3" />Open</span>;
      case 'in_progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />In Progress</span>;
      case 'resolved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Resolved</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
    // Set map loaded when switching to map view
    if (viewMode === 'list') {
      setMapLoaded(true);
    }
  };
  
  // 计算有效报告的地图中心点
  const getMapCenter = () => {
    const reportsWithCoords = filteredReports.filter(report => 
      report.latitude && report.longitude
    );
    
    if (reportsWithCoords.length === 0) {
      // 默认新加坡中心坐标
      return { lat: 1.3521, lng: 103.8198 };
    }
    
    // 使用最新报告的坐标作为中心点
    const sortedReports = [...reportsWithCoords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return {
      lat: sortedReports[0].latitude!,
      lng: sortedReports[0].longitude!
    };
  };

  return (
    <PageTransition>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Reports</h1>
          <Link
            href="/report/create"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Submit New Report
          </Link>
        </div>
        
        {/* View Toggle and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:w-auto">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                className="w-full md:w-48 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleViewModeToggle}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Switch to list view"
              >
                <FileText className="h-4 w-4 mr-2" />
                List View
              </button>
              <button
                onClick={handleViewModeToggle}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ml-2 ${
                  viewMode === 'map' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Switch to map view"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading your reports...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* No Reports */}
        {!isLoading && !error && filteredReports.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <FileText className="h-14 w-14 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-6">
              {statusFilter === 'all' 
                ? "You haven't submitted any reports yet." 
                : `You don't have any reports with the status "${statusFilter}".`}
            </p>
            <Link
              href="/report/create"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Submit a new report
            </Link>
          </div>
        )}
        
        {/* Map View */}
        {!isLoading && !error && filteredReports.length > 0 && viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold">Map View</h2>
              <p className="text-sm text-gray-500">Hover over a marker to see report details, or click for full details</p>
            </div>
            <div className="h-[500px] relative">
              {typeof window !== 'undefined' && (
                <MapContainer 
                  center={getMapCenter()}
                  zoom={13}
                >
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
                            // 添加到聚类器
                            clusterer={clusterer}
                            // 根据严重程度设置z-index，使更严重的问题显示在上面
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
          </div>
        )}
        
        {/* List View */}
        {!isLoading && !error && filteredReports.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{report.title}</h3>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    <span>Reported on {formatDate(report.createdAt)}</span>
                    {report.location && (
                      <span className="ml-4">Location: {report.location}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 line-clamp-2 mb-4">{report.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {report.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Severity: {report.severity}
                    </span>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link 
                      href={`/report/${report.id}`} 
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
} 