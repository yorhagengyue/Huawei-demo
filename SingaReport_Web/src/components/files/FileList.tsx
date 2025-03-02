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
  ArrowRight,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
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
import DemoDataBadge from '@/components/ui/DemoDataBadge';

// File type interface
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
  isDemo?: boolean;
  user: {
    id: string;
    username: string;
  };
}

// Pagination data interface
interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// Component properties interface
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
  // State management
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Filter and sorting state
  const [filters, setFilters] = useState({
    search: '',
    fileType: 'ALL_TYPES',
    status: 'ALL_STATUS',
    startDate: '',
    endDate: ''
  });
  const [sorting, setSorting] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: initialLimit,
    totalItems: 0,
    totalPages: 0
  });
  
  // Router
  const router = useRouter();
  
  // Load file list
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder
      });
      
      // Add filtering parameters
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.fileType && filters.fileType !== "ALL_TYPES") queryParams.append('fileType', filters.fileType);
      if (filters.status && filters.status !== "ALL_STATUS") queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (reportId) queryParams.append('reportId', reportId);
      
      // Send request
      const response = await fetch(`/api/files/list?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load file list');
      }
      
      // Parse response
      const data = await response.json();
      setFiles(data.files);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Failed to load files:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading file list');
    } finally {
      setLoading(false);
    }
  }, [filters, sorting, pagination.page, pagination.limit, reportId]);
  
  // Load files on first render and when dependencies change
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);
  
  // Handle search
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    loadFiles();
  }, [loadFiles]);
  
  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);
  
  // Handle sorting change
  const handleSortChange = useCallback((sortBy: string) => {
    setSorting(prev => ({
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  }, []);
  
  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  }, [pagination.totalPages]);
  
  // Handle file deletion
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
        throw new Error(errorData.error || 'Failed to delete file');
      }
      
      // Deletion successful
      setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
      
      // Call callback
      if (onFileDelete) {
        onFileDelete(selectedFile.id);
      }
      
      // Reset state
      setSelectedFile(null);
      setConfirmDeleteOpen(false);
      
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting file');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, onFileDelete]);
  
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
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Return different icons based on file type
  const getFileTypeIcon = (fileType: string) => {
    // Here you can return different icons based on the file type
    return <FileIcon className="h-4 w-4" />;
  };
  
  // Get scan status badge
  const getScanStatusBadge = (status: string) => {
    switch (status) {
      case 'clean':
        return <Badge variant="success">Safe</Badge>;
      case 'infected':
        return <Badge variant="destructive">Risk</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
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
                {/* Search box */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search file name or tags"
                      className="pl-9"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </div>
                
                {/* File type filter */}
                <div className="w-[150px]">
                  <Select
                    value={filters.fileType}
                    onValueChange={(value) => handleFilterChange('fileType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="File Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_TYPES">All Types</SelectItem>
                      <SelectItem value="image/jpeg">JPEG Image</SelectItem>
                      <SelectItem value="image/png">PNG Image</SelectItem>
                      <SelectItem value="image/gif">GIF Image</SelectItem>
                      <SelectItem value="application/pdf">PDF Document</SelectItem>
                      <SelectItem value="video/mp4">MP4 Video</SelectItem>
                      <SelectItem value="video/quicktime">MOV Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Status filter */}
                <div className="w-[150px]">
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="File Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_STATUS">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DELETED">Deleted</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Search button */}
                <Button type="submit">
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Files table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSortChange('fileName')}>
                <div className="flex items-center">
                  File Name
                  {sorting.sortBy === 'fileName' && (
                    sorting.sortOrder === 'desc' ? <SortDesc className="ml-1 h-4 w-4" /> : <SortAsc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSortChange('fileSize')}>
                <div className="flex items-center">
                  Size
                  {sorting.sortBy === 'fileSize' && (
                    sorting.sortOrder === 'desc' ? <SortDesc className="ml-1 h-4 w-4" /> : <SortAsc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSortChange('createdAt')}>
                <div className="flex items-center">
                  Upload Time
                  {sorting.sortBy === 'createdAt' && (
                    sorting.sortOrder === 'desc' ? <SortDesc className="ml-1 h-4 w-4" /> : <SortAsc className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
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
              // Error state
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-red-500">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={loadFiles} className="mt-2">
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <FileIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No files found</p>
                  {filters.search && (
                    <p className="text-sm mt-1">Try a different search term or clear filters</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              // File list
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    {getFileTypeIcon(file.fileType)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[250px]">{file.fileName}</span>
                        {(file?.isDemo ?? false) && <DemoDataBadge isDemo={true} size="sm" />}
                      </div>
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
                        <DropdownMenuLabel>File Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onFileSelect && onFileSelect(file)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(file.downloadUrl, '_blank')}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
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
                            Delete
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
      
      {/* Pagination controls */}
      {showPagination && !loading && files.length > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.totalItems)} 
            of {pagination.totalItems} files
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
                // Calculate page number range to display
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
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm File Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the file "{selectedFile?.fileName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFile} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 