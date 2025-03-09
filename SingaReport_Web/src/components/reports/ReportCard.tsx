import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Tag, ExternalLink, Image as ImageIcon } from 'lucide-react';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { color: string; text: string; bgColor: string }> = {
    'Open': { 
      color: 'text-blue-700', 
      bgColor: 'bg-blue-50 border-blue-200', 
      text: 'Open' 
    },
    'In Progress': { 
      color: 'text-amber-700', 
      bgColor: 'bg-amber-50 border-amber-200', 
      text: 'In Progress' 
    },
    'Resolved': { 
      color: 'text-green-700', 
      bgColor: 'bg-green-50 border-green-200', 
      text: 'Resolved' 
    },
    'pending': { 
      color: 'text-blue-700', 
      bgColor: 'bg-blue-50 border-blue-200', 
      text: 'Pending' 
    },
    'in_progress': { 
      color: 'text-amber-700', 
      bgColor: 'bg-amber-50 border-amber-200', 
      text: 'In Progress' 
    },
    'processing': { 
      color: 'text-amber-700', 
      bgColor: 'bg-amber-50 border-amber-200', 
      text: 'Processing' 
    },
    'resolved': { 
      color: 'text-green-700', 
      bgColor: 'bg-green-50 border-green-200', 
      text: 'Resolved' 
    },
    'closed': { 
      color: 'text-gray-700', 
      bgColor: 'bg-gray-50 border-gray-200', 
      text: 'Closed' 
    }
  };

  const { color, bgColor, text } = statusMap[status] || { 
    color: 'text-gray-700', 
    bgColor: 'bg-gray-50 border-gray-200', 
    text: status 
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} ${bgColor} border`}>
      {text}
    </span>
  );
};

// Format date to human-readable format
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

interface ReportCardProps {
  report: {
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
    isDemo?: boolean;
  };
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  // Use either submittedAt or createdAt depending on what's available
  const dateString = report.submittedAt || report.createdAt || '';
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100 h-full">
      {/* Card Header with Status */}
      <div className="relative p-3 border-b border-gray-100">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="text-base font-semibold text-gray-900 pr-6 line-clamp-1">
            <Link href={`/report/${report.id}`} className="hover:text-primary focus:outline-none">
              {report.title}
            </Link>
          </h3>
          <StatusBadge status={report.status} />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-gray-400" />
            <span>{report.category}</span>
          </div>
          
          {dateString && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span>{formatDate(dateString)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-3">
        <p className="text-gray-600 mb-3 text-sm line-clamp-2">
          {report.description}
        </p>
        
        {report.location && (
          <div className="flex items-start gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{report.location}</span>
          </div>
        )}
        
        {/* Image Preview */}
        {report.images && report.images.length > 0 && (
          <div className="mt-2 mb-3">
            <div className="flex overflow-x-auto pb-2 space-x-1.5">
              {report.images.slice(0, 3).map((imageUrl, index) => (
                <div key={index} className="flex-none w-16 h-16 relative rounded overflow-hidden bg-gray-100 border border-gray-200">
                  {/* Fallback icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  
                  {/* Actual image */}
                  <img
                    src={imageUrl}
                    alt={`Report image ${index + 1}`}
                    className="h-full w-full object-cover absolute inset-0 z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
              {report.images.length > 3 && (
                <div className="flex-none w-16 h-16 relative rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs font-medium">+{report.images.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-3">
          <Link
            href={`/report/${report.id}`}
            className="text-primary font-medium text-xs hover:text-primary/80 flex items-center group"
          >
            View Details
            <ExternalLink className="h-3 w-3 ml-0.5 transition-transform transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}; 