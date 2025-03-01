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
  reportId?: string;
  onSuccess?: (fileId: string, fileData: any) => void;
  onError?: (error: Error) => void;
  maxSize?: number; // 默认10MB
  allowedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

export default function FileUploader({
  reportId,
  onSuccess,
  onError,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  multiple = false,
  className = ''
}: FileUploaderProps) {
  // 状态管理
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [dataConsent, setDataConsent] = useState<boolean>(false);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState<boolean>(false);
  
  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // 清除选中文件
  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  // 文件选择处理
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles: File[] = [];
    let hasError = false;
    let errorMsg = '';
    
    // 验证所选文件
    Array.from(selectedFiles).forEach(file => {
      // 检查文件大小
      if (file.size > maxSize) {
        hasError = true;
        errorMsg = `文件 ${file.name} 太大。最大允许大小为 ${maxSize / (1024 * 1024)}MB。`;
        return;
      }
      
      // 检查文件类型
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        hasError = true;
        errorMsg = `文件 ${file.name} 类型不支持。允许的类型: ${allowedTypes.join(', ')}`;
        return;
      }
      
      newFiles.push(file);
    });
    
    if (hasError) {
      setError(errorMsg);
      return;
    }
    
    // 更新文件列表
    if (multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
    
    setError(null);
    setUploadStatus('idle');
  }, [allowedTypes, maxSize, multiple]);
  
  // 文件选择器点击
  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // 文件输入变化
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);
  
  // 拖放事件处理
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
  
  // 文件上传处理
  const uploadFile = useCallback(async () => {
    if (files.length === 0) {
      setError('请选择要上传的文件。');
      return;
    }
    
    if (!dataConsent) {
      setIsPrivacyDialogOpen(true);
      return;
    }
    
    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // 准备表单数据
      const formData = new FormData();
      formData.append('file', files[0]);
      
      if (reportId) {
        formData.append('reportId', reportId);
      }
      
      formData.append('dataConsent', dataConsent.toString());
      
      // 发送上传请求
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // 包含cookies用于身份验证
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }
      
      // 上传成功
      setUploadProgress(100);
      setUploadStatus('success');
      
      const responseData = await response.json();
      setUploadResponse(responseData);
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess(responseData.fileId, responseData);
      }
      
      // 3秒后刷新状态
      setTimeout(() => {
        if (uploadStatus === 'success') { // 检查是否仍处于成功状态
          clearFiles();
        }
      }, 3000);
      
    } catch (err) {
      setUploadStatus('error');
      const errorMessage = err instanceof Error ? err.message : '上传过程中发生错误';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
  }, [files, dataConsent, reportId, onSuccess, onError, clearFiles, uploadStatus]);
  
  // 文件大小格式化
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={allowedTypes.join(',')}
        multiple={multiple}
        onChange={handleFileInputChange}
      />
      
      {/* 拖放区域 */}
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
              <span className="text-primary">点击上传</span> 或拖放文件
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {allowedTypes.map(type => type.replace('image/', '').replace('application/', '')).join(', ')} (最大 {maxSize / (1024 * 1024)}MB)
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
      
      {/* 数据隐私同意 */}
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
            我确认此文件符合新加坡《个人数据保护法》(PDPA)要求，且不包含未经授权的个人身份信息
          </Label>
        </div>
      </div>
      
      {/* 上传按钮和进度 */}
      <div className="mt-4 space-y-4">
        {uploadStatus === 'idle' && (
          <Button
            onClick={uploadFile}
            disabled={files.length === 0 || !dataConsent}
            className="w-full"
          >
            上传文件
          </Button>
        )}
        
        {uploadStatus === 'uploading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">上传中...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        
        {uploadStatus === 'success' && (
          <Alert variant="success">
            <Check className="h-4 w-4" />
            <AlertTitle>上传成功</AlertTitle>
            <AlertDescription>
              您的文件已成功上传。
            </AlertDescription>
          </Alert>
        )}
        
        {uploadStatus === 'error' && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>上传失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* 数据隐私对话框 */}
      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>数据隐私确认</DialogTitle>
            <DialogDescription>
              根据新加坡《个人数据保护法》(PDPA)，在上传前请确认：
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">上传前请确认：</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>您拥有上传此文件的合法权利</li>
                <li>文件不包含未经授权的个人身份信息</li>
                <li>如包含个人数据，您已获得相关方同意</li>
                <li>您了解此文件将被存储并可能被扫描</li>
              </ul>
            </div>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>重要提示</AlertTitle>
              <AlertDescription>
                上传敏感信息可能违反新加坡法律。请确保您的文件符合当地法规要求。
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">取消</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setDataConsent(true);
                setIsPrivacyDialogOpen(false);
                // 确认后继续上传
                setTimeout(uploadFile, 100);
              }}
            >
              我确认并继续
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 