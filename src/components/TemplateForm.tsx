import React, { useState, useEffect } from 'react';
import { X, Paperclip, AlertCircle, Sparkles, Loader } from 'lucide-react';
import { UserStoryTemplate, FileAttachment } from '../types';
import { FileUpload } from './FileUpload';
import { ModuleDropdown } from './ModuleDropdown';
import { uploadFile, deleteFile } from '../services/fileStorage';
import { generateAcceptanceCriteria } from '../services/aiService';

interface TemplateFormProps {
  template?: UserStoryTemplate;
  onSave: (template: Omit<UserStoryTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSave,
  onCancel,
  isVisible
}) => {
  const [formData, setFormData] = useState({
    featureName: '',
    description: '',
    role: '',
    goal: '',
    benefit: '',
    acceptanceCriteria: '',
    module: ''
  });
  
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        featureName: template.featureName,
        description: template.description,
        role: template.role,
        goal: template.goal,
        benefit: template.benefit,
        acceptanceCriteria: Array.isArray(template.acceptanceCriteria) 
          ? template.acceptanceCriteria.join('\n') 
          : template.acceptanceCriteria || '',
        module: template.module
      });
      setAttachments(template.attachments || []);
    } else {
      setFormData({
        featureName: '',
        description: '',
        role: '',
        goal: '',
        benefit: '',
        acceptanceCriteria: '',
        module: ''
      });
      setAttachments([]);
    }
    setError(null);
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.featureName.trim()) {
      setError('Feature name is required');
      return;
    }
    
    if (!formData.module.trim()) {
      setError('Module is required');
      return;
    }
    
    if (!formData.role.trim() || !formData.goal.trim() || !formData.benefit.trim()) {
      setError('Role, Goal, and Benefit are required for the user story');
      return;
    }

    try {
      onSave({
        ...formData,
        acceptanceCriteria: formData.acceptanceCriteria
          .split('\n')
          .map(criteria => criteria.trim())
          .filter(criteria => criteria !== ''),
        attachments
      });
    } catch (err) {
      setError('Failed to save template. Please try again.');
      console.error('Save error:', err);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.description.trim()) {
      setError('Please enter a description before generating acceptance criteria with AI');
      return;
    }

    setGeneratingAI(true);
    setError(null);

    try {
      const criteria = await generateAcceptanceCriteria({
        description: formData.description,
        featureName: formData.featureName,
        role: formData.role,
        goal: formData.goal,
        benefit: formData.benefit
      });

      setFormData(prev => ({
        ...prev,
        acceptanceCriteria: criteria.join('\n')
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate acceptance criteria');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleFilesAdd = async (files: File[]) => {
    setUploading(true);
    setError(null);
    
    try {
      const tempId = template?.id || `temp_${Date.now()}`;
      const uploadPromises = files.map(async (file) => {
        try {
          return await uploadFile(file, tempId);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          throw error;
        }
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload some files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = async (fileId: string) => {
    try {
      const tempId = template?.id || `temp_${Date.now()}`;
      await deleteFile(tempId, fileId);
      setAttachments(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      setAttachments(prev => prev.filter(file => file.id !== fileId));
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Feature Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.featureName}
                  onChange={(e) => setFormData(prev => ({ ...prev, featureName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., User Login, Dashboard Analytics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Module *
                </label>
                <ModuleDropdown
                  value={formData.module}
                  onChange={(value) => setFormData(prev => ({ ...prev, module: value }))}
                  placeholder="Select or add a module"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brief description of the feature or functionality"
              />
            </div>
          </div>

          {/* User Story Components Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              User Story Components
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., user, admin, customer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal *
                </label>
                <input
                  type="text"
                  required
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., log into my account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Benefit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.benefit}
                  onChange={(e) => setFormData(prev => ({ ...prev, benefit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., I can access my personal dashboard"
                />
              </div>
            </div>
          </div>

          {/* Acceptance Criteria Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Acceptance Criteria
              </label>
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={generatingAI || !formData.description.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white rounded-md hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm self-start sm:self-auto"
              >
                {generatingAI ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              value={formData.acceptanceCriteria}
              onChange={(e) => setFormData(prev => ({ ...prev, acceptanceCriteria: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter acceptance criteria, one per line:

Given the user is on the login page
When they enter valid credentials
Then they should be redirected to the dashboard

Given the user enters invalid credentials
When they click submit
Then an error message should be displayed"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-1 sm:space-y-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter each acceptance criteria on a new line. They will be automatically formatted when saved.
              </p>
              {formData.description.trim() && (
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  💡 Try the AI generator to auto-create criteria based on your description
                </p>
              )}
            </div>
          </div>

          {/* File Attachments Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Paperclip className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                File Attachments
              </h3>
            </div>
            
            <FileUpload
              attachments={attachments}
              onFilesAdd={handleFilesAdd}
              onFileRemove={handleFileRemove}
              disabled={uploading}
              maxFiles={10}
              maxFileSize={25}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || generatingAI}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors font-medium text-sm"
            >
              {uploading ? 'Uploading...' : generatingAI ? 'Generating...' : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};