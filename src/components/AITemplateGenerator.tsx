import React, { useState } from 'react';
import { X, Sparkles, Loader, AlertCircle, Upload, FileText, Check, ChevronRight, Eye, Save, Plus, Minus } from 'lucide-react';
import { UserStoryTemplate } from '../types';
import { ModuleDropdown } from './ModuleDropdown';
import { FileUpload } from './FileUpload';
import { generateAcceptanceCriteria } from '../services/aiService';

interface GeneratedUserStory {
  id: string;
  featureName: string;
  description: string;
  role: string;
  goal: string;
  benefit: string;
  acceptanceCriteria: string[];
  module: string;
  selected: boolean;
}

interface AITemplateGeneratorProps {
  onSave: (templates: Omit<UserStoryTemplate, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({
  onSave,
  onCancel,
  isVisible
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [generatedStories, setGeneratedStories] = useState<GeneratedUserStory[]>([]);
  const [selectedStories, setSelectedStories] = useState<GeneratedUserStory[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { number: 1, title: 'Upload Document', description: 'Upload a document for AI analysis' },
    { number: 2, title: 'Select Stories', description: 'Choose user stories to convert' },
    { number: 3, title: 'Preview & Save', description: 'Review and save selected templates' }
  ];

  const handleFilesAdd = async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      uploadedAt: new Date()
    }))]);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleGenerateFromDocument = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Simulate AI processing of document
      // In a real implementation, you would send the document to your AI service
      const mockStories: GeneratedUserStory[] = [
        {
          id: '1',
          featureName: 'User Authentication System',
          description: 'Implement secure user login and registration functionality',
          role: 'user',
          goal: 'securely access my account',
          benefit: 'I can protect my personal information and access personalized features',
          acceptanceCriteria: [
            'User can register with email and password',
            'User can login with valid credentials',
            'User receives error message for invalid credentials',
            'User can reset password via email',
            'User session expires after inactivity'
          ],
          module: 'Authentication',
          selected: false
        },
        {
          id: '2',
          featureName: 'Dashboard Analytics',
          description: 'Display key metrics and analytics on user dashboard',
          role: 'user',
          goal: 'view my account analytics and metrics',
          benefit: 'I can make informed decisions based on my data',
          acceptanceCriteria: [
            'Dashboard displays key performance metrics',
            'Charts and graphs are interactive',
            'Data can be filtered by date range',
            'Export functionality is available',
            'Real-time updates are shown'
          ],
          module: 'Analytics',
          selected: false
        },
        {
          id: '3',
          featureName: 'Document Management',
          description: 'Upload, organize, and manage documents within the system',
          role: 'user',
          goal: 'upload and organize my documents',
          benefit: 'I can keep all my important files in one secure location',
          acceptanceCriteria: [
            'User can upload multiple file types',
            'Documents can be organized in folders',
            'Search functionality is available',
            'Version control is maintained',
            'Documents can be shared with other users'
          ],
          module: 'Document Management',
          selected: false
        }
      ];

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedStories(mockStories);
      setCurrentStep(2);
    } catch (err) {
      setError('Failed to generate user stories from document');
    } finally {
      setGenerating(false);
    }
  };

  const handleStoryToggle = (storyId: string) => {
    setGeneratedStories(prev => 
      prev.map(story => 
        story.id === storyId 
          ? { ...story, selected: !story.selected }
          : story
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = generatedStories.every(story => story.selected);
    setGeneratedStories(prev => 
      prev.map(story => ({ ...story, selected: !allSelected }))
    );
  };

  const handleProceedToPreview = () => {
    const selected = generatedStories.filter(story => story.selected);
    if (selected.length === 0) {
      setError('Please select at least one user story');
      return;
    }
    setSelectedStories(selected);
    setCurrentStep(3);
    setError(null);
  };

  const handleUpdateStory = (storyId: string, field: keyof GeneratedUserStory, value: any) => {
    setSelectedStories(prev =>
      prev.map(story =>
        story.id === storyId ? { ...story, [field]: value } : story
      )
    );
  };

  const handleAddAcceptanceCriteria = (storyId: string) => {
    setSelectedStories(prev =>
      prev.map(story =>
        story.id === storyId 
          ? { ...story, acceptanceCriteria: [...story.acceptanceCriteria, ''] }
          : story
      )
    );
  };

  const handleRemoveAcceptanceCriteria = (storyId: string, index: number) => {
    setSelectedStories(prev =>
      prev.map(story =>
        story.id === storyId 
          ? { ...story, acceptanceCriteria: story.acceptanceCriteria.filter((_, i) => i !== index) }
          : story
      )
    );
  };

  const handleUpdateAcceptanceCriteria = (storyId: string, index: number, value: string) => {
    setSelectedStories(prev =>
      prev.map(story =>
        story.id === storyId 
          ? { 
              ...story, 
              acceptanceCriteria: story.acceptanceCriteria.map((criteria, i) => 
                i === index ? value : criteria
              )
            }
          : story
      )
    );
  };

  const handleSaveTemplates = () => {
    const templates = selectedStories.map(story => ({
      featureName: story.featureName,
      description: story.description,
      role: story.role,
      goal: story.goal,
      benefit: story.benefit,
      acceptanceCriteria: story.acceptanceCriteria.filter(criteria => criteria.trim() !== ''),
      module: story.module,
      attachments: []
    }));

    onSave(templates);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setUploadedFiles([]);
    setGeneratedStories([]);
    setSelectedStories([]);
    setError(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              AI Template Generator
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    currentStep > step.number
                      ? 'bg-green-600 dark:bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-medium transition-colors duration-200 ${
                      currentStep >= step.number 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
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

          {/* Step 1: Document Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Upload Document for AI Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Upload documents such as requirements specifications, feature descriptions, or project briefs. 
                      Our AI will analyze the content and generate relevant user stories with acceptance criteria.
                    </p>
                  </div>
                </div>
              </div>

              <FileUpload
                attachments={uploadedFiles}
                onFilesAdd={handleFilesAdd}
                onFileRemove={handleFileRemove}
                maxFiles={5}
                maxFileSize={25}
                acceptedTypes={[
                  '.pdf',
                  '.doc',
                  '.docx',
                  '.txt',
                  '.rtf',
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'text/plain',
                  'application/rtf'
                ]}
              />

              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleGenerateFromDocument}
                  disabled={generating || uploadedFiles.length === 0}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all duration-200 font-medium shadow-sm"
                >
                  {generating ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Analyzing Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate User Stories</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Stories */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Generated User Stories
                    </h3>
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      Select the user stories you want to convert into templates. You can edit them in the next step.
                    </p>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                  >
                    {generatedStories.every(story => story.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {generatedStories.map((story) => (
                  <div
                    key={story.id}
                    className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                      story.selected
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                    }`}
                    onClick={() => handleStoryToggle(story.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={story.selected}
                        onChange={() => handleStoryToggle(story.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {story.featureName}
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            {story.module}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {story.description}
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-600/50 border border-gray-200 dark:border-gray-600 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            "As a <span className="font-medium text-blue-600 dark:text-blue-400">{story.role}</span>, 
                            I want to <span className="font-medium text-blue-600 dark:text-blue-400">{story.goal}</span>, 
                            so that <span className="font-medium text-blue-600 dark:text-blue-400">{story.benefit}</span>."
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Acceptance Criteria ({story.acceptanceCriteria.length})
                          </h5>
                          <ul className="space-y-1">
                            {story.acceptanceCriteria.slice(0, 3).map((criteria, index) => (
                              <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {criteria}
                              </li>
                            ))}
                            {story.acceptanceCriteria.length > 3 && (
                              <li className="text-xs text-gray-500 dark:text-gray-400 italic ml-4">
                                +{story.acceptanceCriteria.length - 3} more criteria
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors font-medium text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToPreview}
                  disabled={!generatedStories.some(story => story.selected)}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors font-medium text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview Selected ({generatedStories.filter(s => s.selected).length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Save */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Preview & Edit Templates
                </h3>
                <p className="text-green-800 dark:text-green-300 text-sm">
                  Review and edit your selected user story templates before saving. All fields can be modified.
                </p>
              </div>

              <div className="space-y-6">
                {selectedStories.map((story, storyIndex) => (
                  <div key={story.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Template {storyIndex + 1}
                    </h4>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Feature Name *
                        </label>
                        <input
                          type="text"
                          value={story.featureName}
                          onChange={(e) => handleUpdateStory(story.id, 'featureName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Module *
                        </label>
                        <ModuleDropdown
                          value={story.module}
                          onChange={(value) => handleUpdateStory(story.id, 'module', value)}
                          placeholder="Select or add a module"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={story.description}
                        onChange={(e) => handleUpdateStory(story.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* User Story Components */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Role *
                        </label>
                        <input
                          type="text"
                          value={story.role}
                          onChange={(e) => handleUpdateStory(story.id, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Goal *
                        </label>
                        <input
                          type="text"
                          value={story.goal}
                          onChange={(e) => handleUpdateStory(story.id, 'goal', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Benefit *
                        </label>
                        <input
                          type="text"
                          value={story.benefit}
                          onChange={(e) => handleUpdateStory(story.id, 'benefit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Acceptance Criteria */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Acceptance Criteria
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddAcceptanceCriteria(story.id)}
                          className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Criteria</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {story.acceptanceCriteria.map((criteria, criteriaIndex) => (
                          <div key={criteriaIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={criteria}
                              onChange={(e) => handleUpdateAcceptanceCriteria(story.id, criteriaIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder={`Acceptance criteria ${criteriaIndex + 1}`}
                            />
                            {story.acceptanceCriteria.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAcceptanceCriteria(story.id, criteriaIndex)}
                                className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors font-medium text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors font-medium text-sm"
                  >
                    Start Over
                  </button>
                </div>
                <button
                  onClick={handleSaveTemplates}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600 rounded-md transition-colors font-medium text-sm shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Templates ({selectedStories.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};