'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileIcon,
  Trash2,
  Download,
  Filter,
  Search,
  SortDesc,
  SortAsc,
  AlertTriangle,
  Eye,
  MoreVertical,
  Calendar,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Skeleton
} from '@/components/ui';

// 文件类型接口
interface FileItem {
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

// 分页数据接口
interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// 组件属性接口
interface FileListProps {
  reportId?: string;
  showFilters?: boolean;
  showPagination?: boolean;
  onFileSelect?: (file: FileItem) => void;
  onFileDelete?: (fileId: string) => void;
  className?: string;
  initialLimit?: number;
}

export default function FileList({
  reportId,
  showFilters = true,
  showPagination = true,
  onFileSelect,
  onFileDelete,
  className = '',
  initialLimit = 10
}: FileListProps) {
  // 状态管理
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // 筛选和排序状态
  const [filters, setFilters] = useState({
    search: '',
    fileType: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [sorting, setSorting] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // 分页状态
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: initialLimit,
    totalItems: 0,
    totalPages: 0
  });
  
  // 路由
  const router = useRouter();
  
  // 加载文件列表
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 构建查询参数
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder
      });
      
      // 添加筛选参数
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.fileType) queryParams.append('fileType', filters.fileType);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (reportId) queryParams.append('reportId', reportId);
      
      // 发送请求
      const response = await fetch(`/api/files/list?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include', // 包含cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取文件列表失败');
      }
      
      // 解析响应
      const data = await response.json();
      setFiles(data.files);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Failed to load files:', err);
      setError(err instanceof Error ? err.message : '获取文件列表时发生错误');
    } finally {
      setLoading(false);
    }
  }, [filters, sorting, pagination.page, pagination.limit, reportId]);
  
  // 首次加载和依赖变化时获取文件
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);
  
  // 处理搜索
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
    loadFiles();
  }, [loadFiles]);
  
  // 处理筛选变更
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
  }, []);
  
  // 处理排序变更
  const handleSortChange = useCallback((sortBy: string) => {
    setSorting(prev => ({
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  }, []);
  
  // 处理分页变更
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  }, [pagination.totalPages]);
  
  // 处理文件删除
  const handleDeleteFile = useCallback(async () => {
    if (!selectedFile) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/files/${selectedFile.id}/delete`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除文件失败');
      }
      
      // 删除成功
      setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
      
      // 调用回调
      if (onFileDelete) {
        onFileDelete(selectedFile.id);
      }
      
      // 重置状态
      setSelectedFile(null);
      setConfirmDeleteOpen(false);
      
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError(err instanceof Error ? err.message : '删除文件时发生错误');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, onFileDelete]);
  
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
  
  // 获取文件类型图标
  const getFileTypeIcon = (fileType: string) => {
    // 这里可以根据文件类型返回不同的图标
    return <FileIcon className="h-4 w-4" />;
  };
  
  // 获取扫描状态标签
  const getScanStatusBadge = (status: string) => {
    switch (status) {
      case 'clean':
        return <Badge variant="success">安全</Badge>;
      case 'infected':
        return <Badge variant="destructive">有风险</Badge>;
      case 'pending':
        return <Badge variant="outline">待扫描</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-wrap gap-4">
                {/* 搜索框 */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="搜索文件名或标签"
                      className="pl-9"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </div>
                
                {/* 文件类型筛选 */}
                <div className="w-[150px]">
                  <Select
                    value={filters.fileType}
                    onValueChange={(value) => handleFilterChange('fileType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="文件类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部类型</SelectItem>
                      <SelectItem value="image/jpeg">JPEG 图片</SelectItem>
                      <SelectItem value="image/png">PNG 图片</SelectItem>
                      <SelectItem value="image/gif">GIF 图片</SelectItem>
                      <SelectItem value="application/pdf">PDF 文档</SelectItem>
                      <SelectItem value="video/mp4">MP4 视频</SelectItem>
                      <SelectItem value="video/quicktime">MOV 视频</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 状态筛选 */}
                <div className="w-[150px]">
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="文件状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部状态</SelectItem>
                      <SelectItem value="ACTIVE">活跃</SelectItem>
                      <SelectItem value="DELETED">已删除</SelectItem>
                      <SelectItem value="ARCHIVED">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 搜索按钮 */}
                <Button type="submit">
                  应用筛选
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* 文件列表表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSortChange('fileName')}>
                <div className="flex items-center">
                  文件名
                  {sorting.sortBy === 'fileName' && (
                    sorting.sortOrder === 'desc' ? <SortDesc className="ml-1 h-4 w-4" /> : <SortAsc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSortChange('fileSize')}>
                <div className="flex items-center">
                  大小
                  {sorting.sortBy === 'fileSize' && (
                    sorting.sortOrder === 'desc' ? <SortDesc className="ml-1 h-4 w-4" /> : <SortAsc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSortChange('createdAt')}>
                <div className="flex items-center">
                  上传时间
                  {sorting.sortBy === 'createdAt' && (
                    sorting.sortOrder === 'desc' ? <SortDesc className="ml-1 h-4 w-4" /> : <SortAsc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              // 错误状态
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-red-500">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={loadFiles} className="mt-2">
                    重试
                  </Button>
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              // 空状态
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <FileIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>没有找到文件</p>
                  {filters.search && (
                    <p className="text-sm mt-1">尝试使用不同的搜索词或清除筛选条件</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              // 文件列表
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    {getFileTypeIcon(file.fileType)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[250px]">{file.fileName}</span>
                      <span className="text-xs text-gray-500 truncate max-w-[250px]">
                        {file.tags?.length > 0 && file.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="mr-1 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                  <TableCell>{getScanStatusBadge(file.scanStatus)}</TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>文件操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onFileSelect && onFileSelect(file)}>
                          <Eye className="mr-2 h-4 w-4" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(file.downloadUrl, '_blank')}>
                          <Download className="mr-2 h-4 w-4" />
                          下载
                        </DropdownMenuItem>
                        {file.canDelete && (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedFile(file);
                              setConfirmDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 分页控件 */}
      {showPagination && !loading && files.length > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-gray-500">
            显示 {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.totalItems)} 
            共 {pagination.totalItems} 个文件
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                // 计算要显示的页码范围
                let start = 1;
                if (pagination.totalPages > 5) {
                  if (pagination.page > 2) {
                    start = pagination.page - 2;
                  }
                  if (start + 4 > pagination.totalPages) {
                    start = pagination.totalPages - 4;
                  }
                }
                const pageNum = start + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* 删除确认对话框 */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除文件</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除文件 "{selectedFile?.fileName}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFile} 
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 