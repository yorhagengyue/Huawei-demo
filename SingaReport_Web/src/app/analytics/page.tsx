'use client';

import React from 'react';
import ReportDataSphere from '@/components/analytics/ReportDataSphere';

export default function AnalyticsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Data Analysis Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Singapore Urban Issues Distribution</h2>
          <p className="text-gray-600 mb-6">This 3D visualization map is based on real data from the database, showing the geographic distribution of all reported issues, with colors representing different categories.</p>
          
          {/* Use the new component instead of the example data component */}
          <div className="h-[500px] rounded-lg overflow-hidden">
            <ReportDataSphere height={500} />
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>* Data is retrieved in real-time from the database, automatically refreshed every 5 minutes</p>
            <p>* You can drag, zoom, and rotate the map to view from different angles</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Legend</h2>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Issue Categories</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-4 h-4 bg-[#FF9F9F] rounded-full mr-2"></span>
                <span>Infrastructure</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-[#90DEFF] rounded-full mr-2"></span>
                <span>Cleanliness</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-[#A5F0C5] rounded-full mr-2"></span>
                <span>Public Facilities</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-[#FFEBB0] rounded-full mr-2"></span>
                <span>Safety Issues</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-[#D0BDFF] rounded-full mr-2"></span>
                <span>Environmental Issues</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-[#FFD4F0] rounded-full mr-2"></span>
                <span>Noise Concerns</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-[#FFD0A0] rounded-full mr-2"></span>
                <span>Construction</span>
              </li>
            </ul>
            
            <h3 className="font-medium text-gray-700 mt-6">Severity Levels</h3>
            <p className="text-sm text-gray-600">Point size indicates the severity of the issue</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-6 h-6 bg-blue-500 rounded-full mr-2 opacity-70"></span>
                <span>High Priority</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-500 rounded-full mr-2 opacity-70"></span>
                <span>Medium Priority</span>
              </li>
              <li className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2 opacity-70"></span>
                <span>Low Priority</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 