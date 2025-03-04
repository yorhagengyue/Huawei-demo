'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import DemoDataBadge from '@/components/ui/DemoDataBadge';

// 定义报告接口
interface Report {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  status: string;
  location?: string;
  createdAt: string; // API返回的是ISO格式的日期
  updatedAt: string;
  images?: string[];
  description: string;
  upvotes?: number;
  comments?: number;
  isDemo?: boolean; // 是否为示例数据
  media?: {
    id: string;
    type: string;
    url: string;
  }[];
}

// 状态徽章组件
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [activeSorting, setActiveSorting] = useState('newest');
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 确保用户已认证
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // 认证状态改变时处理重定向
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // 从API获取报告数据
  useEffect(() => {
    async function fetchReports() {
      setIsLoadingReports(true);
      setError(null);
      
      try {
        const response = await fetch('/api/reports');
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        if (data.success && data.data?.reports) {
          // 将API数据转换为组件需要的格式
          const formattedReports = data.data.reports.map((report: any) => ({
            id: report.id,
            title: report.title,
            category: report.category,
            status: report.status,
            location: report.location,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
            description: report.description,
            isDemo: report.isDemo || false,
            media: report.media || [],
            // 如果API不返回以下字段，使用默认值
            upvotes: report.upvotes || 0,
            comments: report.comments || 0
          }));
          
          setReports(formattedReports);
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again later.');
        setReports([]);
      } finally {
        setIsLoadingReports(false);
      }
    }
    
    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated]);
  
  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  // 基于活动标签筛选报告
  const filteredReports = reports.filter(report => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending' && report.status === 'pending') return true;
    if (activeTab === 'in_progress' && 
        (report.status === 'under_review' || report.status === 'in_progress')) return true;
    if (activeTab === 'resolved' && report.status === 'resolved') return true;
    return false;
  });

  // 基于活动排序对报告进行排序
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (activeSorting === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (activeSorting === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (activeSorting === 'most_upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0);
    }
    if (activeSorting === 'recently_updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return 0;
  });

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取分类/子分类名称
  const getCategoryName = (categoryId: string) => {
    const categories = {
      'roads': 'Road Issues',
      'cleanliness': 'Cleanliness',
      'environment': 'Environment',
      'facilities': 'Public Facilities',
      'safety': 'Safety Concerns',
      'noise': 'Noise Issues',
      'construction': 'Construction',
      'others': 'Others'
    };
    return categories[categoryId as keyof typeof categories] || categoryId;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-2">Track and manage all your submitted reports</p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm text-gray-500 mb-1">Total Reports</div>
              <div className="text-2xl font-bold">{reports.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm text-gray-500 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-purple-600">
                {reports.filter(r => 
                  r.status === 'under_review' || r.status === 'in_progress'
                ).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm text-gray-500 mb-1">Resolved</div>
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'resolved').length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-sm text-gray-500 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'pending').length}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
            <Link 
              href="/report/new" 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Report New Issue
            </Link>
            <div className="flex items-center space-x-2">
              <label htmlFor="sortBy" className="text-sm text-gray-500">Sort by:</label>
              <select 
                id="sortBy" 
                className="bg-white border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={activeSorting}
                onChange={(e) => setActiveSorting(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_upvotes">Most Upvotes</option>
                <option value="recently_updated">Recently Updated</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6">
              <button
                className={`pb-4 px-1 ${
                  activeTab === 'all'
                    ? 'border-b-2 border-primary font-medium text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All Reports
              </button>
              <button
                className={`pb-4 px-1 ${
                  activeTab === 'pending'
                    ? 'border-b-2 border-primary font-medium text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button
                className={`pb-4 px-1 ${
                  activeTab === 'in_progress'
                    ? 'border-b-2 border-primary font-medium text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('in_progress')}
              >
                In Progress
              </button>
              <button
                className={`pb-4 px-1 ${
                  activeTab === 'resolved'
                    ? 'border-b-2 border-primary font-medium text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('resolved')}
              >
                Resolved
              </button>
            </nav>
          </div>

          {/* Loading State */}
          {isLoadingReports && (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
              <p className="text-gray-500">Loading reports...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-red-200">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          )}

          {/* Reports List */}
          {!isLoadingReports && !error && sortedReports.length > 0 ? (
            <div className="space-y-4">
              {sortedReports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          <Link href={`/report/${report.id}`} className="hover:text-primary">
                            {report.title}
                          </Link>
                        </h3>
                        {report.isDemo && <DemoDataBadge isDemo={true} size="sm" />}
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">{report.id}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{getCategoryName(report.category)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{formatDate(report.createdAt)}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Location:</span> {report.location || 'Not specified'}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span className="text-sm text-gray-500">{report.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-500">{report.comments || 0}</span>
                        </div>
                        <Link
                          href={`/report/${report.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoadingReports && !error ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'all' 
                  ? "You haven't submitted any reports yet." 
                  : `You don't have any ${activeTab.replace('_', ' ')} reports.`}
              </p>
              <Link
                href="/report/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
              >
                Submit a New Report
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 