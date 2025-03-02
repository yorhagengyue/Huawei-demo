'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, AlertCircle, FileText, X, Check, FileIcon } from 'lucide-react';
import { 
  Card,
  CardContent,
  Button,
  Progress,
  Alert,
  AlertTitle,
  AlertDescription,
  Input,
  Label,
  Checkbox,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui';

type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUploaderProps {
  onError?: (error: string) => void;
  reportId?: string;
  className?: string;
  multiple?: boolean;
  maxSize?: number; // Default 10MB
  allowedTypes?: string[];
  onSuccess?: (fileId: string, fileData: any) => void;
  isDevelopment?: boolean; // 添加开发模式参数，用于显示Demo数据选项
}

export default function FileUploader({
  reportId,
  onSuccess,
  onError,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  multiple = false,
  className = '',
  isDevelopment = process.env.NODE_ENV === 'development' // 默认在开发模式下允许设置演示数据
}: FileUploaderProps) {
  // State management
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dataConsent, setDataConsent] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(false); // 添加是否为演示数据的状态
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState<boolean>(false);
  
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Clear selected files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  // File selection handling
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles: File[] = [];
    let hasError = false;
    let errorMsg = '';
    
    // Validate selected files
    Array.from(selectedFiles).forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        hasError = true;
        errorMsg = `File ${file.name} is too large. Maximum allowed size is ${maxSize / (1024 * 1024)}MB.`;
        return;
      }
      
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        hasError = true;
        errorMsg = `File ${file.name} type not supported. Allowed types: ${allowedTypes.join(', ')}`;
        return;
      }
      
      newFiles.push(file);
    });
    
    if (hasError) {
      setError(errorMsg);
      return;
    }
    
    // Update file list
    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
    
    setError(null);
    setUploadStatus('idle');
  }, [allowedTypes, maxSize, multiple]);
  
  // File input click handler
  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // File input change handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);
  
  // Drag and drop event handling
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('bg-primary/10', 'border-primary');
    }
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('bg-primary/10', 'border-primary');
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('bg-primary/10', 'border-primary');
    }
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);
  
  // File upload handling
  const uploadFile = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select files to upload.');
      return;
    }
    
    if (!dataConsent) {
      setIsPrivacyDialogOpen(true);
      return;
    }
    
    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', files[0]);
      
      if (reportId) {
        formData.append('reportId', reportId);
      }
      
      formData.append('dataConsent', dataConsent.toString());
      formData.append('isDemo', isDemo.toString()); // 添加是否为演示数据的字段
      
      // Send upload request
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for identity verification
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      // Upload successful
      setUploadProgress(100);
      setUploadStatus('success');
      
      const responseData = await response.json();
      setUploadResponse(responseData);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(responseData.fileId, responseData);
      }
      
      // Refresh status after 3 seconds
      setTimeout(() => {
        if (uploadStatus === 'success') { // Check if still in success state
          clearFiles();
        }
      }, 3000);
      
    } catch (err) {
      setUploadStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(errorMessage);
      }
    }
  }, [files, dataConsent, reportId, onSuccess, onError, clearFiles, uploadStatus, isDemo]);
  
  // File size formatting
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={allowedTypes.join(',')}
        multiple={multiple}
        onChange={handleFileInputChange}
      />
      
      {/* Drag and drop area */}
      <div
        ref={dropZoneRef}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors duration-200 ease-in-out cursor-pointer"
        onClick={handleFileInputClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {files.length === 0 ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              <span className="text-primary">Click to upload</span> or drag and drop files
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {allowedTypes.map(type => type.replace('image/', '').replace('application/', '')).join(', ')} (Maximum {maxSize / (1024 * 1024)}MB)
            </p>
          </>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {uploadStatus === 'idle' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFiles();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Data privacy consent */}
      <div className="mt-4 flex items-center space-x-2">
        <Checkbox
          id="dataConsent"
          checked={dataConsent}
          onCheckedChange={(checked) => setDataConsent(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="dataConsent"
            className="text-sm text-gray-700 cursor-pointer"
          >
            I confirm that this file complies with the Singapore Personal Data Protection Act (PDPA) and does not contain unauthorized personal information
          </Label>
        </div>
      </div>
      
      {/* Demo data option - only visible in development mode */}
      {isDevelopment && (
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="isDemo" 
            checked={isDemo}
            onCheckedChange={(checked) => setIsDemo(checked === true)}
          />
          <label 
            htmlFor="isDemo" 
            className="text-sm text-amber-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mark as demo data (for development purposes only)
          </label>
        </div>
      )}
      
      {/* Upload button and progress */}
      <div className="mt-4 space-y-4">
        {uploadStatus === 'idle' && (
          <Button
            onClick={uploadFile}
            disabled={files.length === 0 || !dataConsent}
            className="w-full"
          >
            Upload file
          </Button>
        )}
        
        {uploadStatus === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Uploading...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        {uploadStatus === 'success' && (
          <Alert variant="success">
            <Check className="h-4 w-4" />
            <AlertTitle>Upload successful</AlertTitle>
            <AlertDescription>
              Your file has been successfully uploaded.
            </AlertDescription>
          </Alert>
        )}
        
        {uploadStatus === 'error' && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upload failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Data privacy dialog */}
      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data Privacy Confirmation</DialogTitle>
            <DialogDescription>
              Please confirm before uploading:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Please confirm:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>You have the legal right to upload this file</li>
                <li>The file does not contain unauthorized personal information</li>
                <li>If it contains personal data, you have obtained consent from the relevant party</li>
                <li>You understand that this file will be stored and may be scanned</li>
              </ul>
            </div>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Important Note</AlertTitle>
              <AlertDescription>
                Uploading sensitive information may violate Singapore law. Please ensure your file complies with local regulations.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setDataConsent(true);
                setIsPrivacyDialogOpen(false);
                // Continue upload after confirmation
                setTimeout(uploadFile, 100);
              }}
            >
              I confirm and continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 