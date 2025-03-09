/**
 * Demo Data Badge Component
 * 
 * This component is used to mark virtual data generated through seed scripts
 */

'use client';

import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface DemoDataBadgeProps {
  /** Whether it is demo data */
  isDemo?: boolean;
  /** Component size 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Optional style class */
  className?: string;
  /** Tooltip text */
  tooltipText?: string;
}

/**
 * Demo Data Badge Component
 * 
 * Used to mark virtual data in the interface, displaying a tooltip on hover
 */
export const DemoDataBadge: React.FC<DemoDataBadgeProps> = ({
  isDemo = false,
  size = 'md',
  className = '',
  tooltipText = 'This is system-generated demo data for demonstration purposes only'
}) => {
  // If not demo data, don't render anything
  if (!isDemo) {
    return null;
  }

  // Determine style based on size
  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`
            inline-flex items-center gap-1 bg-amber-100 text-amber-800 
            rounded-full font-medium border border-amber-300
            ${sizeClasses[size]} ${className}
          `}
        >
          <InfoIcon className="h-3.5 w-3.5" />
          <span>Demo Data</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs p-2">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};

export default DemoDataBadge; 