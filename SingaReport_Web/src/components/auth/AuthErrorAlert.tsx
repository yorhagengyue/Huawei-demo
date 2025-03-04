'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AuthErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export default function AuthErrorAlert({ message, onClose }: AuthErrorAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
    }
  }, [message]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!message || !visible) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-grow">
          <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
          <div className="mt-1 text-sm text-red-700">
            {message}
          </div>
        </div>
        <button
          type="button"
          className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600 focus:outline-none"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 