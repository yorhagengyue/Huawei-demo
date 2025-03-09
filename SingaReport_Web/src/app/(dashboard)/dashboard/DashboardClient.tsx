'use client';

import { useState, useEffect } from 'react';
import { ReportCard } from '@/components/reports/ReportCard';
import { parseJwt } from '@/lib/auth/jwt-utils';
import { 
  Loader2, 
  FileBarChart, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Filter, 
  Info, 
  RefreshCw, 
  PlusCircle, 
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import MapContainer from '@/components/maps/MapContainer';
import MapMarker from '@/components/maps/MapMarker';

// Flag to attempt direct API calls in development mode
const useDirect = process.env.NODE_ENV === 'development';

// Data source types
const DATA_SOURCE = {
  DATABASE: 'database',
  DEMO: 'demo',
  ERROR: 'error'
};

// Define the Report interface
interface Report {
  id: number | string;
  title: string;
  description: string;
  status: string;
  category: string;
  location?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
}

// Style for primary button
const btnPrimaryClass = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm";

// Data source indicator component
const DataSourceIndicator = ({ dataSource }: { dataSource: string }) => {
  if (!dataSource) return null;
  
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let label = 'Unknown Source';
  
  if (dataSource === DATA_SOURCE.DATABASE) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    label = 'Database';
  } else if (dataSource === DATA_SOURCE.DEMO) {
    bgColor = 'bg-amber-100';
    textColor = 'text-amber-800';
    label = 'Demo Mode';
  }
  
  return (
    <div className={`flex items-center ${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}>
      <Info className="h-3 w-3 mr-1" />
      {label}
    </div>
  );
};

// 添加地图标记颜色配置
const markerColors = {
  open: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  pending: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  "in-progress": "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png", 
  "in progress": "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  processing: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  resolved: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
};

// 获取报告状态对应的标记颜色
const getMarkerIcon = (status: string) => {
  const normalizedStatus = status.toLowerCase().replace("_", "-");
  return markerColors[normalizedStatus as keyof typeof markerColors] || "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
};

export default function DashboardClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    total: 0
  });
  const [dataSource, setDataSource] = useState<'database' | 'demo' | 'unknown'>('unknown');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Demo reports for fallback
  const demoReports: Report[] = [
    {
      id: 1,
      title: 'Broken Street Light',
      description: 'Street light not working on Main Street',
      status: 'Open',
      category: 'Infrastructure',
      location: '1.3521, 103.8198',
      submittedBy: 'user123',
      submittedAt: '2023-06-15T08:30:00Z',
      images: ['https://example.com/img1.jpg']
    },
    {
      id: 2,
      title: 'Pothole on Orchard Road',
      description: 'Large pothole causing traffic issues',
      status: 'In Progress',
      category: 'Road Damage',
      location: '1.3042, 103.8318',
      submittedBy: 'citizen456',
      submittedAt: '2023-06-16T10:15:00Z',
      images: ['https://example.com/img2.jpg']
    },
    {
      id: 3,
      title: 'Fallen Tree',
      description: 'Tree fallen across pedestrian walkway',
      status: 'Resolved',
      category: 'Environment',
      location: '1.3234, 103.8901',
      submittedBy: 'resident789',
      submittedAt: '2023-06-12T14:45:00Z',
      images: ['https://example.com/img4.jpg']
    }
  ];

  // Apply filter when reports or active filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredReports(reports);
      return;
    }
    
    const filtered = reports.filter(report => {
      const status = report.status.toLowerCase();
      
      if (activeFilter === 'open') {
        return status === 'open' || status === 'pending';
      }
      
      if (activeFilter === 'in-progress') {
        return status === 'in progress' || status === 'processing';
      }
      
      if (activeFilter === 'resolved') {
        return status === 'resolved';
      }
      
      return true;
    });
    
    setFilteredReports(filtered);
  }, [reports, activeFilter]);

  const fetchReports = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // Set refreshing state when forcing refresh
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      // Build request parameters
      const params = new URLSearchParams();
      if (activeFilter !== 'all') {
        params.append('status', activeFilter);
      }
      
      // Fetch reports from API
      const requestUrl = `/api/reports?${params.toString()}`;
      console.log(`Fetching reports from: ${requestUrl}`, { forceRefresh });
      
      const res = await fetch(requestUrl, {
        headers: {
          // Clear cache to ensure fresh data
          ...(forceRefresh ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {})
        }
      });
      
      if (!res.ok) {
        throw new Error(`Error fetching reports: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Reports API response:', data);
      
      // Update data source status if available
      if (data.source) {
        setDataSource(data.source);
      }
      
      setLastUpdated(new Date());
      
      // Get the reports array - handle multiple possible formats for robustness
      const reportsArray = data.reports || data.data || [];
      
      // Process temporary reports from local storage
      try {
        // Get temporary reports
        const tempReportsJson = localStorage.getItem('tempNewReports') || '[]';
        const tempReports = JSON.parse(tempReportsJson);
        
        // Filter out expired temporary reports
        const validTempReports = tempReports.filter(
          (report: any) => report.tempExpiry > Date.now()
        );
        
        // Update storage if some reports expired
        if (validTempReports.length !== tempReports.length) {
          localStorage.setItem('tempNewReports', JSON.stringify(validTempReports));
        }
        
        // If there are valid temporary reports, merge them
        if (validTempReports.length > 0) {
          // Create ID mapping to avoid duplicates
          const reportIds = new Set(reportsArray.map((r: Report) => r.id));
          
          // Only add temporary reports not in API response
          const tempReportsToAdd = validTempReports.filter(
            (temp: any) => !reportIds.has(temp.id)
          );
          
          if (tempReportsToAdd.length > 0) {
            console.log(`Adding ${tempReportsToAdd.length} temporary reports to results`);
            const mergedReports = [...tempReportsToAdd, ...reportsArray];
            setReports(mergedReports);
            updateStatistics(mergedReports);
            return;
          }
        }
      } catch (err) {
        console.error('Error processing temporary reports:', err);
      }
      
      // If no temporary reports to add, just set the reports from API
      setReports(reportsArray);
      updateStatistics(reportsArray);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reports');
      // Keep current data on error
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Manual refresh
  const handleRefresh = () => {
    fetchReports(true);
  };
  
  // Initial load and periodic refresh
  useEffect(() => {
    fetchReports();
    
    // Set periodic refresh (every 30 seconds check for updates)
    const intervalId = setInterval(() => {
      fetchReports();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 监听报告提交后的刷新事件
  useEffect(() => {
    // 尝试从本地存储获取临时报告
    const getTempReports = () => {
      try {
        const tempReportsJson = localStorage.getItem('tempNewReports') || '[]';
        const tempReports = JSON.parse(tempReportsJson);
        
        // 过滤掉过期的临时报告
        const validTempReports = tempReports.filter(
          (report: any) => report.tempExpiry > Date.now()
        );
        
        // 保存过滤后的临时报告
        if (validTempReports.length !== tempReports.length) {
          localStorage.setItem('tempNewReports', JSON.stringify(validTempReports));
        }
        
        return validTempReports;
      } catch (err) {
        console.error('Error getting temp reports:', err);
        return [];
      }
    };
    
    // 合并临时报告和 API 返回的报告
    const mergeWithTempReports = (apiReports: Report[]) => {
      const tempReports = getTempReports();
      if (tempReports.length === 0) return apiReports;
      
      // 创建 ID 映射以避免重复
      const reportIds = new Set(apiReports.map(r => r.id));
      
      // 只添加不在 API 报告中的临时报告
      const tempReportsToAdd = tempReports.filter(
        (temp: any) => !reportIds.has(temp.id) && !temp.id.startsWith('temp-')
      );
      
      return [...tempReportsToAdd, ...apiReports];
    };
    
    // 处理仪表板刷新事件
    const handleDashboardRefresh = (event: Event) => {
      console.log('Dashboard refresh event received', (event as CustomEvent).detail);
      // 立即刷新数据
      fetchReports(true);
    };
    
    // 监听刷新事件
    window.addEventListener('dashboard:refresh', handleDashboardRefresh);
    
    // 在初始加载时合并临时报告
    if (reports.length > 0) {
      const mergedReports = mergeWithTempReports(reports);
      if (mergedReports.length > reports.length) {
        console.log('Merged in temporary reports', { 
          before: reports.length, 
          after: mergedReports.length 
        });
        setReports(mergedReports);
      }
    }
    
    // 清理函数
    return () => {
      window.removeEventListener('dashboard:refresh', handleDashboardRefresh);
    };
  }, [reports]);

  const updateStatistics = (reportsData: Report[]) => {
    const totalReports = reportsData.length;
    const openReports = reportsData.filter((report: Report) => 
      report.status.toLowerCase() === 'open' || 
      report.status.toLowerCase() === 'pending'
    ).length;
    
    const inProgressReports = reportsData.filter((report: Report) => 
      report.status.toLowerCase() === 'in-progress' || 
      report.status.toLowerCase() === 'processing'
    ).length;
    
    const resolvedReports = reportsData.filter((report: Report) => 
      report.status.toLowerCase() === 'resolved'
    ).length;
    
    setStats({
      total: totalReports,
      open: openReports,
      inProgress: inProgressReports,
      resolved: resolvedReports
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <DataSourceIndicator dataSource={dataSource} />
          {lastUpdated && (
            <span className="text-xs text-gray-500 ml-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <button 
            onClick={handleRefresh} 
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          
          <Link href="/report/create" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm">
            <PlusCircle className="h-4 w-4" />
            Report New Issue
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-1">
                <button 
                  onClick={handleRefresh}
                  className="underline"
                >
                  Try refreshing
                </button> or check your connection and try again.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Reports Status Section */}
      <div className="flex justify-between space-x-5 mb-6">
        {/* Total Reports */}
        <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1">Total</div>
          <div className="flex items-center">
            <FileBarChart className="h-6 w-6 text-gray-500 mr-2" />
            <span className="text-4xl font-bold">{stats.total}</span>
          </div>
        </div>
        
        {/* Open Reports */}
        <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1">Open</div>
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-blue-500 mr-2" />
            <span className="text-4xl font-bold">{stats.open}</span>
          </div>
        </div>
        
        {/* In Progress Reports */}
        <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1">In Progress</div>
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-amber-500 mr-2" />
            <span className="text-4xl font-bold">{stats.inProgress}</span>
          </div>
        </div>
        
        {/* Resolved Reports */}
        <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-sm border border-gray-100">
          <div className="text-gray-500 mb-1">Resolved</div>
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <span className="text-4xl font-bold">{stats.resolved}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Layout: Side-by-side Map and Reports List on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map takes 2/3 of the space on larger screens */}
        {reports.length > 0 && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Report Locations</h2>
                  <Link href="/map" className="text-sm text-primary hover:underline flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    View Full Map
                  </Link>
                </div>
              </div>
              <div className="relative" style={{ height: '550px' }}>
                {typeof window !== 'undefined' && (
                  <MapContainer 
                    center={(() => {
                      // Find the most recent report with valid coordinates
                      const sortedReports = [...reports].sort((a, b) => {
                        const dateA = new Date(a.createdAt || a.submittedAt || 0);
                        const dateB = new Date(b.createdAt || b.submittedAt || 0);
                        return dateB.getTime() - dateA.getTime(); // Most recent first
                      });
                      
                      // Find the first report with valid coordinates
                      const latestWithCoords = sortedReports.find(r => {
                        // Ensure both latitude and longitude are defined and valid numbers
                        if (r.latitude === undefined || r.longitude === undefined) return false;
                        if (r.latitude === null || r.longitude === null) return false;
                        return true;
                      });
                      
                      // If found, return its coordinates as valid LatLngLiteral
                      if (latestWithCoords && latestWithCoords.latitude !== undefined && latestWithCoords.longitude !== undefined) {
                        const lat = typeof latestWithCoords.latitude === 'string' 
                          ? parseFloat(latestWithCoords.latitude) 
                          : latestWithCoords.latitude;
                          
                        const lng = typeof latestWithCoords.longitude === 'string' 
                          ? parseFloat(latestWithCoords.longitude) 
                          : latestWithCoords.longitude;
                        
                        console.log('Centering map on latest report:', { lat, lng });
                        return { lat, lng };
                      }
                      
                      // Default to undefined (will use default center from MapContainer)
                      return undefined;
                    })()}
                    zoom={13} // Increased zoom level for better visibility
                  >
                    {reports.map((report) => {
                      // Ensure report has valid coordinates
                      if (report.latitude && report.longitude) {
                        // Convert to proper number format if needed
                        const lat = typeof report.latitude === 'string' 
                          ? parseFloat(report.latitude) 
                          : report.latitude;
                        
                        const lng = typeof report.longitude === 'string' 
                          ? parseFloat(report.longitude) 
                          : report.longitude;
                        
                        console.log(`Adding marker for report ${report.id} at position:`, { lat, lng });
                        
                        return (
                          <MapMarker
                            key={report.id}
                            position={{ lat, lng }}
                            icon={getMarkerIcon(report.status)} 
                            onClick={() => {
                              // Navigate to report details page
                              window.location.href = `/report/${report.id}`;
                            }}
                          />
                        );
                      }
                      return null;
                    })}
                  </MapContainer>
                )}
                
                {/* Map legend */}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md z-10 text-sm border border-gray-100">
                  <div className="font-semibold mb-2">Report Status:</div>
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span>Open</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span>Resolved</span>
                  </div>
                </div>
                
                {/* Map controls */}
                <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md z-10">
                  <button 
                    onClick={() => window.location.href = '/map'}
                    className="text-gray-700 hover:text-primary focus:outline-none"
                    title="View Full Map"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Reports Section - 1/3 of the space on larger screens */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Reports</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleRefresh} 
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    disabled={isRefreshing}
                    title="Refresh reports"
                  >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
              
            <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center p-4">
                  <FileText className="h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-500 mb-5">There are no reports in the system yet.</p>
                  <Link 
                    href="/report/create" 
                    className={btnPrimaryClass}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Submit a New Report
                  </Link>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <Filter className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching reports</h3>
                  <p className="text-gray-500 mb-4">There are no reports matching the current filter.</p>
                  <button 
                    onClick={() => setActiveFilter('all')}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Clear filter
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-gray-50">
                      <ReportCard report={report} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 