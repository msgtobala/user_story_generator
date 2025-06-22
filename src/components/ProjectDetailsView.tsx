import React, { useState } from 'react';
import { ArrowLeft, Edit, Save, X, Plus, Minus, FileSpreadsheet, Calendar, Tag, Check } from 'lucide-react';
import { Project, ProjectStory } from '../types';
import { updateProject } from '../services/userStories';
import * as XLSX from 'xlsx';

interface ProjectDetailsViewProps {
  project: Project;
  onBack: () => void;
  onProjectUpdate: () => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
  project,
  onBack,
  onProjectUpdate
}) => {
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editedStory, setEditedStory] = useState<ProjectStory | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Project name editing state
  const [editingProjectName, setEditingProjectName] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(project.name);
  const [editedProjectDescription, setEditedProjectDescription] = useState(project.description || '');
  const [savingProject, setSavingProject] = useState(false);

  const handleEditStory = (story: ProjectStory) => {
    setEditingStory(story.id);
    setEditedStory({ ...story });
  };

  const handleCancelEdit = () => {
    setEditingStory(null);
    setEditedStory(null);
  };

  const handleSaveStory = async () => {
    if (!editedStory) return;

    setSaving(true);
    try {
      const updatedStories = project.stories.map(story =>
        story.id === editedStory.id ? editedStory : story
      );

      await updateProject(project.id, {
        stories: updatedStories
      });

      setEditingStory(null);
      setEditedStory(null);
      onProjectUpdate();
    } catch (error) {
      console.error('Failed to update story:', error);
    } finally {
      setSaving(false);
    }
  };

  // Project name editing functions
  const handleEditProjectName = () => {
    setEditingProjectName(true);
    setEditedProjectName(project.name);
    setEditedProjectDescription(project.description || '');
  };

  const handleCancelProjectEdit = () => {
    setEditingProjectName(false);
    setEditedProjectName(project.name);
    setEditedProjectDescription(project.description || '');
  };

  const handleSaveProjectName = async () => {
    if (!editedProjectName.trim()) return;

    setSavingProject(true);
    try {
      await updateProject(project.id, {
        name: editedProjectName.trim(),
        description: editedProjectDescription.trim()
      });

      setEditingProjectName(false);
      onProjectUpdate();
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setSavingProject(false);
    }
  };

  const updateEditedStory = (field: keyof ProjectStory, value: any) => {
    if (!editedStory) return;
    setEditedStory({ ...editedStory, [field]: value });
  };

  const addAcceptanceCriteria = () => {
    if (!editedStory) return;
    updateEditedStory('acceptanceCriteria', [...editedStory.acceptanceCriteria, '']);
  };

  const removeAcceptanceCriteria = (index: number) => {
    if (!editedStory) return;
    const newCriteria = editedStory.acceptanceCriteria.filter((_, i) => i !== index);
    updateEditedStory('acceptanceCriteria', newCriteria);
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    if (!editedStory) return;
    const newCriteria = editedStory.acceptanceCriteria.map((criteria, i) =>
      i === index ? value : criteria
    );
    updateEditedStory('acceptanceCriteria', newCriteria);
  };

  const addTag = () => {
    if (!editedStory) return;
    updateEditedStory('tags', [...editedStory.tags, '']);
  };

  const removeTag = (index: number) => {
    if (!editedStory) return;
    const newTags = editedStory.tags.filter((_, i) => i !== index);
    updateEditedStory('tags', newTags);
  };

  const updateTag = (index: number, value: string) => {
    if (!editedStory) return;
    const newTags = editedStory.tags.map((tag, i) => i === index ? value : tag);
    updateEditedStory('tags', newTags);
  };

  const exportProjectToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Project Overview Sheet
    const projectOverview = [
      ['Project Name', project.name],
      ['Description', project.description || ''],
      ['Created Date', project.createdAt.toLocaleDateString()],
      ['Updated Date', project.updatedAt.toLocaleDateString()],
      ['Total Stories', project.stories.length],
      [''],
      ['Story Summary by Status'],
      ['Draft', project.stories.filter(s => s.status === 'draft').length],
      ['In Review', project.stories.filter(s => s.status === 'review').length],
      ['Approved', project.stories.filter(s => s.status === 'approved').length],
    ];
    
    const overviewWS = XLSX.utils.aoa_to_sheet(projectOverview);
    XLSX.utils.book_append_sheet(wb, overviewWS, 'Project Overview');

    // User Stories Sheet
    const storiesData = [
      [
        'Story #',
        'Feature Name',
        'Module',
        'Description',
        'Role',
        'Goal',
        'Benefit',
        'User Story',
        'Acceptance Criteria',
        'Status',
        'Customizations',
        'Tags'
      ]
    ];

    project.stories.forEach((story, index) => {
      const userStory = `As a ${story.role}, I want to ${story.goal}, so that ${story.benefit}.`;
      const acceptanceCriteria = story.acceptanceCriteria.join('\n• ');
      const tags = story.tags.join(', ');
      
      storiesData.push([
        (index + 1).toString(),
        story.featureName,
        story.module,
        story.description,
        story.role,
        story.goal,
        story.benefit,
        userStory,
        acceptanceCriteria,
        story.status.charAt(0).toUpperCase() + story.status.slice(1),
        story.customizations || '',
        tags
      ]);
    });

    const storiesWS = XLSX.utils.aoa_to_sheet(storiesData);
    
    // Set column widths
    const colWidths = [
      { wch: 8 },   // Story #
      { wch: 25 },  // Feature Name
      { wch: 15 },  // Module
      { wch: 30 },  // Description
      { wch: 15 },  // Role
      { wch: 30 },  // Goal
      { wch: 30 },  // Benefit
      { wch: 50 },  // User Story
      { wch: 40 },  // Acceptance Criteria
      { wch: 12 },  // Status
      { wch: 30 },  // Customizations
      { wch: 20 }   // Tags
    ];
    storiesWS['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, storiesWS, 'User Stories');

    // Acceptance Criteria Detail Sheet
    const criteriaData = [['Story #', 'Feature Name', 'Criteria #', 'Acceptance Criteria']];
    
    project.stories.forEach((story, storyIndex) => {
      story.acceptanceCriteria.forEach((criteria, criteriaIndex) => {
        criteriaData.push([
          (storyIndex + 1).toString(),
          story.featureName,
          (criteriaIndex + 1).toString(),
          criteria
        ]);
      });
    });

    const criteriaWS = XLSX.utils.aoa_to_sheet(criteriaData);
    criteriaWS['!cols'] = [
      { wch: 8 },   // Story #
      { wch: 25 },  // Feature Name
      { wch: 10 },  // Criteria #
      { wch: 60 }   // Acceptance Criteria
    ];
    XLSX.utils.book_append_sheet(wb, criteriaWS, 'Acceptance Criteria');

    // Save the file
    XLSX.writeFile(wb, `${project.name}_user_stories.xlsx`);
  };

  const getStatusColor = (status: ProjectStory['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'review': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 min-w-0 flex-1">
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors self-start"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Projects</span>
                </button>
                <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex-1 min-w-0">
                  {editingProjectName ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                        <input
                          type="text"
                          value={editedProjectName}
                          onChange={(e) => setEditedProjectName(e.target.value)}
                          className="text-xl sm:text-2xl font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 flex-1"
                          placeholder="Project name"
                          autoFocus
                        />
                        <div className="flex items-center space-x-2 self-start sm:self-auto">
                          <button
                            onClick={handleSaveProjectName}
                            disabled={savingProject || !editedProjectName.trim()}
                            className="p-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Save changes"
                          >
                            {savingProject ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelProjectEdit}
                            disabled={savingProject}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editedProjectDescription}
                        onChange={(e) => setEditedProjectDescription(e.target.value)}
                        className="w-full text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200"
                        placeholder="Project description (optional)"
                      />
                    </div>
                  ) : (
                    <div className="group">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300 truncate">
                          {project.name}
                        </h1>
                        <button
                          onClick={handleEditProjectName}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 self-start sm:self-auto"
                          title="Edit project name"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                      {project.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                          {project.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={exportProjectToExcel}
                className="flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm font-medium text-sm self-start sm:self-auto"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Export Excel</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Stories:</span>
                <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{project.stories.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Created:</span>
                <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{project.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Updated:</span>
                <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{project.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stories */}
        <div className="p-4 sm:p-6 space-y-6">
          {project.stories.map((story, index) => (
            <div key={story.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              {editingStory === story.id && editedStory ? (
                // Edit Mode
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      Edit Story #{index + 1}
                    </h3>
                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveStory}
                        disabled={saving}
                        className="flex items-center space-x-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium text-sm"
                      >
                        <Save className="h-4 w-4" />
                        <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors duration-300">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Basic Information</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                            Feature Name *
                          </label>
                          <input
                            type="text"
                            value={editedStory.featureName}
                            onChange={(e) => updateEditedStory('featureName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                            Module *
                          </label>
                          <input
                            type="text"
                            value={editedStory.module}
                            onChange={(e) => updateEditedStory('module', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                          Description
                        </label>
                        <textarea
                          value={editedStory.description}
                          onChange={(e) => updateEditedStory('description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* User Story Components */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors duration-300">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">User Story Components</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Role *</label>
                          <input
                            type="text"
                            value={editedStory.role}
                            onChange={(e) => updateEditedStory('role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Goal *</label>
                          <input
                            type="text"
                            value={editedStory.goal}
                            onChange={(e) => updateEditedStory('goal', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Benefit *</label>
                          <input
                            type="text"
                            value={editedStory.benefit}
                            onChange={(e) => updateEditedStory('benefit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Acceptance Criteria */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          Acceptance Criteria
                        </label>
                        <button
                          type="button"
                          onClick={addAcceptanceCriteria}
                          className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 self-start sm:self-auto"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Criteria</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editedStory.acceptanceCriteria.map((criteria, criteriaIndex) => (
                          <div key={criteriaIndex} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <input
                              type="text"
                              value={criteria}
                              onChange={(e) => updateAcceptanceCriteria(criteriaIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder={`Acceptance criteria ${criteriaIndex + 1}`}
                            />
                            {editedStory.acceptanceCriteria.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAcceptanceCriteria(criteriaIndex)}
                                className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded self-start sm:self-auto"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Tags</label>
                        <button
                          type="button"
                          onClick={addTag}
                          className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 self-start sm:self-auto"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Tag</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {editedStory.tags.map((tag, tagIndex) => (
                          <div key={tagIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tag}
                              onChange={(e) => updateTag(tagIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder={`Tag ${tagIndex + 1}`}
                            />
                            {editedStory.tags.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTag(tagIndex)}
                                className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project Customizations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        Project-Specific Customizations
                      </label>
                      <textarea
                        value={editedStory.customizations}
                        onChange={(e) => updateEditedStory('customizations', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Add any project-specific notes, modifications, or additional requirements..."
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Status</label>
                      <select
                        value={editedStory.status}
                        onChange={(e) => updateEditedStory('status', e.target.value as ProjectStory['status'])}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300 truncate">
                          {index + 1}. {story.featureName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(story.status)} transition-colors duration-300 self-start sm:self-auto`}>
                          {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                        </span>
                      </div>
                      {story.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 transition-colors duration-300">{story.description}</p>
                      )}
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-4 rounded-lg mb-4 transition-colors duration-300">
                        <p className="text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300">
                          "As a <span className="font-medium text-blue-600 dark:text-blue-400">{story.role}</span>, 
                          I want to <span className="font-medium text-blue-600 dark:text-blue-400">{story.goal}</span>, 
                          so that <span className="font-medium text-blue-600 dark:text-blue-400">{story.benefit}</span>."
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleEditStory(story)}
                      className="flex items-center space-x-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-md transition-all duration-200 self-start sm:self-auto"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Acceptance Criteria */}
                    {story.acceptanceCriteria.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Acceptance Criteria</h4>
                        <ul className="space-y-1">
                          {story.acceptanceCriteria.map((criteria, criteriaIndex) => (
                            <li key={criteriaIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start transition-colors duration-300">
                              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              <span className="break-words">{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Project Customizations */}
                    {story.customizations && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">Project Customizations</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700 transition-colors duration-300 break-words">
                          {story.customizations}
                        </p>
                      </div>
                    )}

                    {/* Tags and Module */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <div className="flex flex-wrap gap-1">
                            {story.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs rounded-full transition-colors duration-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {story.tags.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">+{story.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full transition-colors duration-300 self-start sm:self-auto">
                        {story.module}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};