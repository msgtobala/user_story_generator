import React, { useRef, useState } from 'react';
import { Upload, X, File, Image, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
import { FileAttachment } from '../types';
import { formatFileSize, getFileIcon } from '../services/fileStorage';

interface FileUploadProps {
  attachments: FileAttachment[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  attachments,
  onFilesAdd,
  onFileRemove,
  maxFiles = 10,
  maxFileSize = 25,
  acceptedTypes = [
    'image/*',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.csv',
    '.ppt',
    '.pptx',
    '.txt',
    '.rtf',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf'
  ],
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const isValidFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Check by MIME type
    if (fileType) {
      if (fileType.startsWith('image/')) return true;
      if (fileType === 'application/pdf') return true;
      if (fileType === 'application/msword') return true;
      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true;
      if (fileType === 'application/vnd.ms-excel') return true;
      if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return true;
      if (fileType === 'text/csv') return true;
      if (fileType === 'application/vnd.ms-powerpoint') return true;
      if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return true;
      if (fileType === 'text/plain') return true;
      if (fileType === 'application/rtf') return true;
    }
    
    // Check by file extension as fallback
    if (fileName.endsWith('.pdf')) return true;
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return true;
    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return true;
    if (fileName.endsWith('.csv')) return true;
    if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return true;
    if (fileName.endsWith('.txt') || fileName.endsWith('.rtf')) return true;
    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) return true;
    
    return false;
  };

  const handleFiles = async (files: File[]) => {
    setUploadError(null);
    
    if (attachments.length + files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }
      
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max ${maxFileSize}MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      setUploading(true);
      try {
        await onFilesAdd(validFiles);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload files. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const getFileTypeIcon = (fileType: string, fileName: string) => {
    const lowerFileName = fileName.toLowerCase();
    const lowerFileType = fileType.toLowerCase();
    
    if (lowerFileType.startsWith('image/') || lowerFileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) {
      return <Image className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
    if (lowerFileType.includes('pdf') || lowerFileName.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />;
    }
    if (lowerFileType.includes('word') || lowerFileType.includes('document') || lowerFileName.match(/\.(doc|docx)$/)) {
      return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
    if (lowerFileType.includes('excel') || lowerFileType.includes('spreadsheet') || lowerFileName.match(/\.(xls|xlsx|csv)$/)) {
      return <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    if (lowerFileType.includes('powerpoint') || lowerFileType.includes('presentation') || lowerFileName.match(/\.(ppt|pptx)$/)) {
      return <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    }
    return <File className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
  };

  const canAddMore = attachments.length < maxFiles && !disabled && !uploading;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} bg-white dark:bg-gray-800 transition-colors duration-300`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          <div className="text-center">
            <Upload className={`mx-auto h-10 sm:h-12 w-10 sm:w-12 mb-4 ${uploading ? 'text-blue-500 dark:text-blue-400 animate-pulse' : 'text-gray-400 dark:text-gray-500'} transition-colors duration-300`} />
            <div className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {uploading ? 'Uploading files...' : 'Drop files here or click to upload'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
              Support for images, PDFs, Word docs, Excel files, PowerPoint, CSV, and text files
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Up to {maxFileSize}MB each • {attachments.length}/{maxFiles} files uploaded
            </div>
            
            {/* Supported file types */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['JPG', 'PNG', 'PDF', 'DOC', 'XLS', 'PPT', 'CSV', 'TXT'].map(type => (
                <span key={type} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full transition-colors duration-300">
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg transition-colors duration-300">
          <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 self-start sm:self-auto" />
          <span className="text-sm text-red-700 dark:text-red-300 flex-1 break-words">{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 self-start sm:self-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">
            Attached Files ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors space-y-3 sm:space-y-0"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileTypeIcon(file.type, file.name)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-300">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {formatFileSize(file.size)} • Uploaded {file.uploadedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.url, '_blank');
                    }}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                    title="View file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  {!disabled && !uploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileRemove(file.id);
                      }}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl transition-colors duration-300">
          <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">Uploading files...</span>
        </div>
      )}
    </div>
  );
};