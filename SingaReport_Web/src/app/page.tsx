'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WelcomePrompt from '@/components/welcome/WelcomePrompt';
import { useAuth } from '@/contexts/AuthContext';
import { FiMapPin, FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowRight, FiBarChart2, FiBell, FiSearch } from 'react-icons/fi';
import { Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import HuiButton from '@/components/common/HuiButton';
import DataVizSphere from '@/components/common/DataVizSphere';
import ReportDataSphere from '@/components/analytics/ReportDataSphere';

// 动态导入WebGL背景组件
const TechBackground = dynamic(() => import('@/components/common/TechBackground'), {
  ssr: false
});

// Dynamically import map components to ensure they only load client-side
const MapContainer = dynamic(() => import('@/components/maps/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const { user, isLoading } = useAuth();
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'data'
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  
  // 滚动动画转换值
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  // 监听滚动位置
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure map only renders on client-side
  useEffect(() => {
    setIsMapVisible(true);
  }, []);

  // Categories for the feature section
  const categories = [
    {
      icon: <FiAlertTriangle className="h-6 w-6 text-orange-500" />,
      title: 'Infrastructure Issues',
      description: 'Report potholes, damaged sidewalks, or street light outages'
    },
    {
      icon: <FiMapPin className="h-6 w-6 text-blue-500" />,
      title: 'Public Facilities',
      description: 'Report issues with parks, public toilets, or communal areas'
    },
    {
      icon: <FiCheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Environmental Concerns',
      description: 'Report littering, pollution, or other environmental issues'
    },
    {
      icon: <FiInfo className="h-6 w-6 text-purple-500" />,
      title: 'Public Transport',
      description: 'Report issues with bus stops, train stations, or service'
    }
  ];

  // Success stories for the testimonial section
  const successStories = [
    {
      title: 'Pothole Repair on Orchard Road',
      description: 'A dangerous pothole was fixed within 3 days of reporting',
      image: '/success-story-1.jpg'
    },
    {
      title: 'Street Light Replacement',
      description: 'Dark street corner now properly lit after community reports',
      image: '/success-story-2.jpg'
    },
    {
      title: 'Park Cleanup Initiative',
      description: 'Local park restored after multiple littering reports',
      image: '/success-story-3.jpg'
    }
  ];

  // 添加liveStats状态
  const [liveStats, setLiveStats] = useState({
    activeReports: 48, // 默认值
    resolvedToday: 13,
    usersOnline: 17
  });
  
  // 获取实时统计数据
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        // 使用forceDatabase=true参数强制从数据库获取真实数据，而不是演示数据
        const response = await fetch('/api/reports?forceDatabase=true&allUsers=true');
        
        if (!response.ok) {
          throw new Error(`Error fetching reports: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.reports) {
          // 使用真实数据计算统计
          const reports = data.reports;
          const activeReports = reports.filter((r: any) => r.status === 'open' || r.status === 'in-progress').length;
          const resolvedToday = reports.filter((r: any) => {
            if (r.status !== 'resolved') return false;
            const updatedAt = new Date(r.updatedAt);
            const today = new Date();
            return updatedAt.getDate() === today.getDate() &&
                   updatedAt.getMonth() === today.getMonth() &&
                   updatedAt.getFullYear() === today.getFullYear();
          }).length;
          
          // 更新状态
          setLiveStats({
            activeReports,
            resolvedToday,
            // 使用随机值模拟在线用户数量
            usersOnline: Math.floor(Math.random() * 10) + 10
          });
        }
      } catch (error) {
        console.error("Error fetching report statistics:", error);
        // 如果出错，保留默认值，无需操作
      }
    };
    
    fetchLiveStats();
    
    // 每3分钟刷新一次数据
    const intervalId = setInterval(fetchLiveStats, 3 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // 主题切换 (演示用，实际无效)
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <main className={`flex min-h-screen flex-col relative ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 主题切换按钮 */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          className="p-2 rounded-full bg-white shadow-lg text-gray-800 hover:bg-gray-100 transition-colors"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {/* 移动端底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-around items-center px-4 h-16">
          <a href="/" className="flex flex-col items-center justify-center space-y-1">
            <div className="w-6 h-6 flex items-center justify-center text-blue-500">
              <FiMapPin />
            </div>
            <span className="text-xs">Map</span>
          </a>
          <a href="/report/create" className="flex flex-col items-center justify-center space-y-1 relative">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white -mt-5 shadow-lg">
              <FiAlertTriangle />
            </div>
            <span className="text-xs">Report</span>
            {/* 添加脉动圆环加强视觉效果 */}
            <div className="absolute w-12 h-12 rounded-full border-2 border-blue-300 animate-pulse -mt-5"></div>
          </a>
          <a href="/dashboard" className="flex flex-col items-center justify-center space-y-1">
            <div className="w-6 h-6 flex items-center justify-center text-gray-500">
              <FiBarChart2 />
            </div>
            <span className="text-xs">Dashboard</span>
          </a>
        </div>
      </div>
      
      {/* First-time visitor prompt */}
      <WelcomePrompt />
      
      {/* Hero section with science fiction style */}
      <section 
        ref={heroRef} 
        className="relative pt-20 pb-32 md:pb-20 overflow-hidden bg-gradient-to-b from-blue-50 via-sky-50 to-white water-ripple-bg"
        style={{ marginBottom: '1px' }} // Fix for subpixel rendering gap
      >
        {/* WebGL 动态背景 - 增强波纹效果 */}
        <TechBackground opacity={0.4} colorMode="cyan" intensity={1.2} />
        
        {/* 添加额外的动态波纹效果 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 多层动态波纹 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-blue-400"
                style={{ scale: 0.2 + i * 0.15 }}
                animate={{
                  scale: [0.2 + i * 0.15, 1 + i * 0.15],
                  opacity: [0.7, 0],
                  borderWidth: ['1px', '0.5px']
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>
        
        {/* 科技感装饰线 - 使用浅色 */}
        <div className="tech-line absolute top-28 left-0 right-0 mx-auto w-1/2 opacity-70" style={{ background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.7), transparent)' }}></div>
        <div className="tech-line absolute top-32 left-0 right-0 mx-auto w-1/3 opacity-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent)' }}></div>
        <div className="tech-line absolute top-36 left-0 right-0 mx-auto w-2/3 opacity-40" style={{ background: 'linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), transparent)' }}></div>
        
        {/* 添加波点矩阵背景以增强视觉效果 */}
        <div className="absolute inset-0 matrix-bg opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                style={{ opacity, scale, y }}
              >
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Make Singapore Better <motion.span 
                    className="text-blue-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    Together
                  </motion.span>
                </motion.h1>
                <motion.p 
                  className="text-lg text-gray-600 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Report urban issues, track their resolution, and help improve our city. Your feedback creates a better Singapore for everyone.
                </motion.p>
                
                {/* 实时统计数据 - 更明亮的配色 */}
                <motion.div 
                  className="flex flex-wrap gap-3 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <motion.div 
                    className="rounded-full px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium flex items-center"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(219, 234, 254, 1)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                    <span>{liveStats.activeReports} Active Reports</span>
                  </motion.div>
                  <motion.div 
                    className="rounded-full px-4 py-2 bg-green-100 text-green-800 text-sm font-medium flex items-center"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(220, 252, 231, 1)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    <span>{liveStats.resolvedToday} Resolved Today</span>
                  </motion.div>
                  <motion.div 
                    className="rounded-full px-4 py-2 bg-purple-100 text-purple-800 text-sm font-medium flex items-center" 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(237, 233, 254, 1)' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
                    <span>{liveStats.usersOnline} Users Online</span>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <HuiButton 
                    variant="primary"
                    size="lg"
                    href="/report/create"
                    icon={<FiAlertTriangle />}
                    rounded
                    className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                  >
                    Report an Issue
                  </HuiButton>
                  <HuiButton 
                    variant="outline"
                    size="lg"
                    href="/map"
                    icon={<FiMapPin />}
                    rounded
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                  >
                    View Issue Map
                  </HuiButton>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="md:w-1/2 flex justify-center relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.7, 
                delay: 0.3,
                type: "spring",
                stiffness: 100
              }}
            >
              {/* 添加背景光晕效果 */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full bg-blue-400/10 blur-xl"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="relative w-full max-w-md">
                <div className="card-3d">
                  <div className="card-3d-inner w-full">
                    <img
                      src="/singapore-skyline.svg"
                      alt="Singapore Urban Landscape"
                      className="w-full h-auto rounded-lg shadow-lg relative z-10"
                    />
                  </div>
                </div>
                
                {/* 波纹效果标记 */}
                {['red', 'blue', 'green'].map((color, index) => {
                  const positions = [
                    { top: '25%', right: '25%', delay: 0 },
                    { bottom: '33%', left: '25%', delay: 0.7 },
                    { top: '50%', left: '33%', delay: 1.4 }
                  ];
                  const colors = {
                    red: {
                      bg: 'bg-red-400',
                      shadow: 'shadow-red-300/50',
                      ripple: 'rgba(248, 113, 113, 0.7)',
                      rippleEnd: 'rgba(248, 113, 113, 0)'
                    },
                    blue: {
                      bg: 'bg-blue-400',
                      shadow: 'shadow-blue-300/50',
                      ripple: 'rgba(96, 165, 250, 0.7)',
                      rippleEnd: 'rgba(96, 165, 250, 0)'
                    },
                    green: {
                      bg: 'bg-green-400',
                      shadow: 'shadow-green-300/50',
                      ripple: 'rgba(74, 222, 128, 0.7)',
                      rippleEnd: 'rgba(74, 222, 128, 0)'
                    }
                  };
                  
                  const colorObj = colors[color as keyof typeof colors];
                  const position = positions[index];
                  
                  return (
                    <div key={color} className="relative" style={position as any}>
                      {/* 扩散波纹 */}
                      <motion.div
                        className={`absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 border-2 border-${color}-300`}
                        style={{ left: '50%', top: '50%' }}
                        animate={{
                          scale: [0, 3],
                          opacity: [0.8, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: position.delay
                        }}
                      />
                      
                      <motion.div
                        className={`absolute w-10 h-10 rounded-full ${colorObj.bg} flex items-center justify-center text-white shadow-lg ${colorObj.shadow} z-20`}
                        animate={{
                          scale: [1, 1.3, 1],
                          boxShadow: [
                            `0 0 0 0 ${colorObj.ripple}`,
                            `0 0 0 15px ${colorObj.rippleEnd}`,
                            `0 0 0 0 ${colorObj.ripple}`
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: 'loop',
                          delay: position.delay
                        }}
                      >
                        {index === 0 ? (
                          <FiAlertTriangle size={18} />
                        ) : index === 1 ? (
                          <FiMapPin size={18} />
                        ) : (
                          <FiCheckCircle size={18} />
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Data Section - 集成3D数据可视化 */}
      <section className="py-12 bg-gray-900 relative overflow-hidden">
        {/* 添加背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-1 neon-text">Smart City Analytics</h2>
            <p className="text-gray-300">Real-time monitoring of urban issues</p>
            
            {/* 选项卡切换 - 增强视觉反馈 */}
            <div className="flex justify-center mt-6 space-x-2 relative">
              <button 
                onClick={() => setActiveTab('map')}
                className={`px-5 py-2 rounded-full text-sm font-medium touch-ripple transition-all duration-300 ${
                  activeTab === 'map' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Map View
              </button>
              <button 
                onClick={() => setActiveTab('data')}
                className={`px-5 py-2 rounded-full text-sm font-medium touch-ripple transition-all duration-300 ${
                  activeTab === 'data' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                3D Data View
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            className="h-[400px] md:h-[500px] relative rounded-lg overflow-hidden shadow-lg shadow-cyan-900/20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {activeTab === 'map' ? (
              // Map View
              <>
                {typeof window !== 'undefined' && isMapVisible && (
                  <MapContainer 
                    center={{ lat: 1.3521, lng: 103.8198 }} 
                    zoom={11}
                  />
                )}
                
                {(!isMapVisible || typeof window === 'undefined') && (
                  <div className="h-full w-full flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-gray-300">Loading map...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // 3D Data View
              <div className="h-full w-full relative bg-gray-900 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full z-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-cyan-500 opacity-30">
                    <svg className="w-24 h-24 mx-auto mb-4 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-lg font-medium">Loading city data...</p>
                  </div>
                </div>
                <ReportDataSphere height="100%" />
              </div>
            )}
            
            <motion.div 
              className="absolute bottom-4 right-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <Link 
                href="/analytics" 
                className="px-3 py-2 bg-gray-900/40 hover:bg-gray-900/60 text-white rounded-lg text-sm shadow-lg backdrop-blur-sm transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                View Full Analysis
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What Can You Report? Section */}
      <section className="py-12 bg-white tech-bg">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-10 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            What Can You Report?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all card-3d overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  backgroundColor: index === 0 ? 'rgba(249, 168, 212, 0.15)' : 
                                index === 1 ? 'rgba(147, 197, 253, 0.15)' : 
                                index === 2 ? 'rgba(134, 239, 172, 0.15)' : 
                                'rgba(196, 181, 253, 0.15)',
                  y: -5 
                }}
              >
                <div className="card-3d-inner">
                  <motion.div 
                    className="mb-4 text-2xl"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    style={{ 
                      color: index === 0 ? '#F472B6' :  // 粉色
                            index === 1 ? '#60A5FA' :   // 蓝色
                            index === 2 ? '#4ADE80' :   // 绿色
                            '#A78BFA'                  // 紫色
                    }}
                  >
                    {category.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section - 使用SVG图片 */}
      <section className="py-12 bg-sky-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-10 text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            Success Stories
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Pothole Repair on Orchard Road',
                description: 'A dangerous pothole was fixed within 3 days of reporting',
                image: '/success-story-1.svg'
              },
              {
                title: 'Street Light Replacement',
                description: 'Dark street corner now properly lit after community reports',
                image: '/success-story-2.svg'
              },
              {
                title: 'Park Cleanup Initiative',
                description: 'Local park restored after multiple littering reports',
                image: '/success-story-3.svg'
              }
            ].map((story, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-lg overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100 
                }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                <div className="relative h-48 overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="w-full h-48 object-cover" 
                    />
                  </motion.div>
                </div>
                <motion.div 
                  className="p-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.15 }}
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{story.title}</h3>
                  <p className="text-gray-600">{story.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - 更明亮的配色 */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-400">
        {/* 明亮的装饰背景元素 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-white rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl"></div>
        </div>
        
        {/* 点阵背景 */}
        <div className="matrix-bg absolute inset-0 opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            {!isLoading && user ? (
              <>
                <motion.h2 
                  className="text-3xl font-bold mb-4 text-white"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Continue Making an Impact
                </motion.h2>
                <motion.p 
                  className="text-lg text-white mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Your community engagement matters. Keep reporting issues and track their progress.
                </motion.p>
                <motion.div 
                  className="flex flex-wrap justify-center gap-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <HuiButton
                    variant="primary"
                    size="lg"
                    href="/report/create"
                    rounded
                    className="bg-white text-blue-500 hover:bg-gray-100 shadow-lg"
                  >
                    Submit New Report
                  </HuiButton>
                  <HuiButton
                    variant="outline"
                    size="lg"
                    href="/dashboard"
                    className="text-white border-white hover:bg-white/10"
                    rounded
                  >
                    View Dashboard
                  </HuiButton>
                </motion.div>
              </>
            ) : (
              <>
                <motion.h2 
                  className="text-3xl font-bold mb-4 text-white"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Join Our Community
                </motion.h2>
                <motion.p 
                  className="text-lg text-white mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Create an account to report issues, track progress, and help improve Singapore.
                </motion.p>
                <motion.div 
                  className="flex flex-wrap justify-center gap-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <HuiButton
                    variant="primary"
                    size="lg"
                    href="/register"
                    rounded
                    className="bg-white text-blue-500 hover:bg-gray-100 shadow-lg"
                  >
                    Register Now
                  </HuiButton>
                  <HuiButton
                    variant="outline"
                    size="lg"
                    href="/login"
                    className="text-white border-white hover:bg-white/10"
                    rounded
                  >
                    Login
                  </HuiButton>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* 悬浮按钮 - 返回顶部 - 使用浅色调 */}
      <motion.div
        className="fixed bottom-20 right-4 z-30 flex flex-col items-center md:bottom-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollY > 300 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <HuiButton
          variant="primary"
          size="icon"
          rounded
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          icon={<FiArrowRight className="rotate-270 transform -rotate-90" />}
          className="bg-blue-500 hover:bg-blue-600 shadow-lg"
        >
          <span className="sr-only">Back to top</span>
        </HuiButton>
      </motion.div>
    </main>
  );
} 