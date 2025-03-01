'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, List, Info, FileText, Download, Trash2 } from 'lucide-react';
import FileUploader from '@/components/files/FileUploader';
import FileList from '@/components/files/FileList';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// 示例文件详情类型
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
  user: {
    id: string;
    username: string;
  };
}

export default function FilesPage() {
  // 状态
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // 处理上传成功
  const handleUploadSuccess = (fileId: string, fileData: any) => {
    console.log('File uploaded successfully:', fileId, fileData);
    // 上传成功后可以切换到"全部文件"选项卡
    setActiveTab('all');
  };
  
  // 处理查看文件详情
  const handleViewFileDetails = (file: FileDetails) => {
    setSelectedFile(file);
    setIsDetailOpen(true);
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
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
          <h1 className="text-3xl font-bold">文件管理</h1>
          <p className="text-muted-foreground">上传、查看和管理您的文件</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">全部文件</TabsTrigger>
          <TabsTrigger value="upload">上传文件</TabsTrigger>
          <TabsTrigger value="help">使用帮助</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>我的文件</CardTitle>
              <CardDescription>
                管理您上传的所有文件，您可以查看、下载或删除这些文件。
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
              <CardTitle>上传新文件</CardTitle>
              <CardDescription>
                上传文件到系统中。支持图片、文档和视频等多种格式。
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
              />
              
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">关于文件上传</h4>
                    <ul className="mt-2 text-sm text-blue-800 space-y-1">
                      <li>文件上传最大支持20MB</li>
                      <li>支持图片、PDF、Word、Excel及视频文件</li>
                      <li>所有文件将进行安全扫描以确保系统安全</li>
                      <li>请确保您有权分享您上传的内容</li>
                      <li>上传前请阅读并同意数据隐私条款</li>
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
              <CardTitle>文件管理使用帮助</CardTitle>
              <CardDescription>
                了解如何有效管理和使用您的文件
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">如何上传文件</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    切换到"上传文件"选项卡，选择或拖放您想上传的文件。确认隐私政策后点击上传。
                    上传完成后您将看到成功提示，文件将显示在"全部文件"列表中。
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <List className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">管理文件列表</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    在"全部文件"选项卡，您可以查看、搜索和筛选您的文件。使用表格顶部的排序功能按不同条件排序。
                    每个文件右侧的操作菜单提供查看详情、下载和删除选项。
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">文件类型限制</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    系统支持多种文件格式，包括常见图片格式(JPG、PNG、GIF、WEBP)、文档(PDF、Word、Excel)和视频(MP4、MOV)。
                    单个文件大小限制为20MB。如需上传更大文件，请联系管理员。
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">隐私与安全</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    所有上传的文件将进行安全扫描，以确保不含恶意内容。您的文件受新加坡《个人数据保护法》(PDPA)保护。
                    上传前请确保文件不包含未经授权的个人数据，并遵守系统使用政策。
                  </p>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">需要更多帮助？</h3>
                <p className="text-sm text-gray-600">
                  如果您在使用过程中遇到任何问题，或有其他疑问，请联系技术支持团队：
                  <br />
                  电子邮件: <a href="mailto:support@singareport.sg" className="text-primary">support@singareport.sg</a>
                  <br />
                  电话: +65 6123 4567 (工作日 9:00-18:00)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 文件详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>文件详情</DialogTitle>
            <DialogDescription>
              查看文件的详细信息和属性
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium truncate">{selectedFile.fileName}</h3>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.fileSize)} • {selectedFile.fileType}</p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-500">上传时间</div>
                      <div>{formatDate(selectedFile.createdAt)}</div>
                      
                      <div className="text-gray-500">上传者</div>
                      <div>{selectedFile.user.username}</div>
                      
                      <div className="text-gray-500">扫描状态</div>
                      <div>{selectedFile.scanStatus === 'clean' ? '安全' : 
                          selectedFile.scanStatus === 'infected' ? '有风险' : '待扫描'}</div>
                      
                      <div className="text-gray-500">下载次数</div>
                      <div>{selectedFile.downloadCount}</div>
                      
                      {selectedFile.lastDownloadedAt && (
                        <>
                          <div className="text-gray-500">最后下载</div>
                          <div>{formatDate(selectedFile.lastDownloadedAt)}</div>
                        </>
                      )}
                      
                      {selectedFile.reportId && (
                        <>
                          <div className="text-gray-500">关联报告</div>
                          <div>#{selectedFile.reportId}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">文件标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.tags && selectedFile.tags.length > 0 ? (
                        selectedFile.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">无标签</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-12 md:col-span-5 border rounded-md p-4 flex flex-col justify-between">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">文件操作</h4>
                    <div className="space-y-2">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => window.open(selectedFile.downloadUrl, '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载文件
                      </Button>
                      
                      {selectedFile.canDelete && (
                        <Button
                          className="w-full justify-start text-red-600"
                          variant="outline"
                          onClick={() => {
                            setIsDetailOpen(false);
                            // 这里应该触发一个删除确认对话框
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除文件
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-500 mt-auto">
                    <p className="mb-1">文件ID: {selectedFile.id}</p>
                    <p>上次修改: {formatDate(selectedFile.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 