import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';
import { FileAttachment } from '../types';

export const uploadFile = async (file: File, templateId: string): Promise<FileAttachment> => {
  const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, `templates/${templateId}/${fileId}`);
  
  try {
    console.log('Starting upload for:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Upload with metadata
    const metadata = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };
    
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('Upload successful:', snapshot);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return {
      id: fileId,
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      url: downloadURL,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const deleteFile = async (templateId: string, fileId: string): Promise<void> => {
  const storageRef = ref(storage, `templates/${templateId}/${fileId}`);
  
  try {
    await deleteObject(storageRef);
    console.log('File deleted successfully:', fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error for delete operations - file might already be deleted
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string, fileName?: string): string => {
  const lowerType = fileType.toLowerCase();
  const lowerName = fileName?.toLowerCase() || '';
  
  if (lowerType.startsWith('image/') || lowerName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) return '🖼️';
  if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) return '📄';
  if (lowerType.includes('word') || lowerType.includes('document') || lowerName.match(/\.(doc|docx)$/)) return '📝';
  if (lowerType.includes('excel') || lowerType.includes('spreadsheet') || lowerName.match(/\.(xls|xlsx)$/)) return '📊';
  if (lowerType.includes('csv') || lowerName.endsWith('.csv')) return '📈';
  if (lowerType.includes('powerpoint') || lowerType.includes('presentation') || lowerName.match(/\.(ppt|pptx)$/)) return '📋';
  if (lowerType.includes('text') || lowerName.match(/\.(txt|rtf)$/)) return '📄';
  return '📎';
};