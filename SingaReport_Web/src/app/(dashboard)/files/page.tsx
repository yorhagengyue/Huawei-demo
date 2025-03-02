'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, List, Info, FileText, Download, Trash2 } from 'lucide-react';
import FileUploader from '@/components/files/FileUploader';
import FileList from '@/components/files/FileList';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import DemoDataBadge from '@/components/ui/DemoDataBadge';

// Sample file details type
interface FileDetails {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  contentType: string;
  createdAt: string;
  updatedAt: string;
  scanStatus: string;
  downloadCount: number;
  status: string;
  tags: string[];
  reportId?: string;
  lastDownloadedAt?: string;
  downloadUrl: string;
  viewUrl: string;
  canEdit: boolean;
  canDelete: boolean;
  isDemo?: boolean;
  user: {
    id: string;
    username: string;
  };
}

export default function FilesPage() {
  // States
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Handle upload success
  const handleUploadSuccess = (fileId: string, fileData: any) => {
    console.log('File uploaded successfully:', fileId, fileData);
    // Switch to "All Files" tab after successful upload
    setActiveTab('all');
  };
  
  // Handle view file details
  const handleViewFileDetails = (file: FileDetails) => {
    setSelectedFile(file);
    setIsDetailOpen(true);
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">File Management</h1>
          <p className="text-muted-foreground">Upload, view and manage your files</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>My Files</CardTitle>
              <CardDescription>
                Manage all files you've uploaded. You can view, download, or delete these files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileList
                onFileSelect={handleViewFileDetails}
                showFilters={true}
                showPagination={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New File</CardTitle>
              <CardDescription>
                Upload files to the system. Supports various formats including images, documents, and videos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                onSuccess={handleUploadSuccess}
                maxSize={20 * 1024 * 1024} // 20MB
                allowedTypes={[
                  'image/jpeg',
                  'image/png',
                  'image/gif',
                  'image/webp',
                  'application/pdf',
                  'video/mp4',
                  'video/quicktime',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ]}
                isDevelopment={true}
              />
              
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">About File Uploads</h4>
                    <ul className="mt-2 text-sm text-blue-800 space-y-1">
                      <li>Maximum file size supported is 20MB</li>
                      <li>Supports images, PDFs, Word, Excel, and video files</li>
                      <li>All files will be scanned for security</li>
                      <li>Ensure you have rights to share the content you upload</li>
                      <li>Please read and agree to the data privacy terms before uploading</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>File Management Help</CardTitle>
              <CardDescription>
                Learn how to effectively manage and use your files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">How to Upload Files</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Switch to the "Upload Files" tab, select or drag and drop the files you want to upload. 
                    Confirm the privacy policy and click upload. After completion, you'll see a success message 
                    and the file will appear in the "All Files" list.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <List className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Managing File List</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    In the "All Files" tab, you can view, search, and filter your files. Use the sorting 
                    functions at the top of the table to sort by different criteria. Each file has an 
                    actions menu on the right providing options to view details, download, and delete.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">File Type Restrictions</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    The system supports multiple file formats, including common image formats (JPG, PNG, GIF, WEBP), 
                    documents (PDF, Word, Excel), and videos (MP4, MOV). Individual file size is limited to 20MB. 
                    Please contact the administrator if you need to upload larger files.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Privacy and Security</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    All uploaded files are security scanned to ensure they don't contain malicious content. 
                    Your files are protected under Singapore's Personal Data Protection Act (PDPA). 
                    Please ensure that files do not contain unauthorized personal data and comply with system usage policies.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Need More Help?</h3>
                <p className="text-sm text-gray-600">
                  If you encounter any issues while using the system or have other questions, please contact our support team:
                  <br />
                  Email: <a href="mailto:support@singareport.sg" className="text-primary">support@singareport.sg</a>
                  <br />
                  Phone: +65 6123 4567 (Weekdays 9:00-18:00)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* File Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
            <DialogDescription>
              View detailed information and properties of the file
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-7 space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium truncate">{selectedFile.fileName}</h3>
                      {(selectedFile?.isDemo ?? false) && <DemoDataBadge isDemo={true} size="sm" />}
                    </div>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.fileSize)} • {selectedFile.fileType}</p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">Upload Time</div>
                      <div>{formatDate(selectedFile.createdAt)}</div>
                      
                      <div className="text-gray-500">Last Modified</div>
                      <div>{formatDate(selectedFile.updatedAt)}</div>
                      
                      <div className="text-gray-500">Scan Status</div>
                      <div>{selectedFile.scanStatus}</div>
                      
                      <div className="text-gray-500">Downloads</div>
                      <div>{selectedFile.downloadCount}</div>
                      
                      <div className="text-gray-500">Status</div>
                      <div>{selectedFile.status}</div>
                      
                      <div className="text-gray-500">Uploader</div>
                      <div>{selectedFile.user.username}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(selectedFile.downloadUrl, '_blank')}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    
                    {selectedFile.canDelete && (
                      <Button 
                        variant="outline" 
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="col-span-12 md:col-span-5 border rounded-md overflow-hidden">
                  {selectedFile.fileType.startsWith('image/') ? (
                    <div className="aspect-square relative">
                      <Image
                        src={selectedFile.viewUrl}
                        alt={selectedFile.fileName}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : selectedFile.fileType === 'application/pdf' ? (
                    <div className="p-8 flex flex-col items-center justify-center h-full min-h-[200px] text-center bg-gray-50">
                      <FileText className="h-16 w-16 text-red-500 mb-2" />
                      <h4 className="font-medium mb-1">PDF Document</h4>
                      <Button size="sm" variant="outline" onClick={() => window.open(selectedFile.viewUrl, '_blank')}>
                        Open PDF
                      </Button>
                    </div>
                  ) : selectedFile.fileType.startsWith('video/') ? (
                    <div className="aspect-video bg-black">
                      <video
                        controls
                        src={selectedFile.viewUrl}
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="p-8 flex flex-col items-center justify-center h-full min-h-[200px] text-center bg-gray-50">
                      <FileText className="h-16 w-16 text-blue-500 mb-2" />
                      <h4 className="font-medium mb-1">File Preview Not Available</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        This file type cannot be previewed directly
                      </p>
                      <Button size="sm" variant="outline" onClick={() => window.open(selectedFile.downloadUrl, '_blank')}>
                        Download to View
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedFile.tags && selectedFile.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedFile.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedFile.reportId && (
                <div>
                  <h4 className="font-medium mb-2">Associated Report</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/reports/${selectedFile.reportId}`, '_blank')}
                  >
                    View Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 