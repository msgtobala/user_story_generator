import React, { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Search, FolderPlus, AlertCircle, Loader, Eye, X, Filter, Rocket, BarChart3, Calendar, Users, Grid, List, ChevronDown } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTemplates } from '../hooks/useTemplates';
import { createProject } from '../services/userStories';
import { Project, UserStoryTemplate, ProjectStory } from '../types';
import { ProjectDetailsView } from './ProjectDetailsView';
import * as XLSX from 'xlsx';

export const ProjectsView: React.FC = () => {
  const { projects, loading: projectsLoading, error: projectsError, refetch } = useProjects();
  const { templates, loading: templatesLoading } = useTemplates();
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique modules from templates
  const availableModules = React.useMemo(() => {
    const modules = templates.map(template => template.module);
    return [...new Set(modules)].filter(Boolean).sort();
  }, [templates]);

  // Filter templates based on selected modules and search term
  const filteredTemplates = React.useMemo(() => {
    let filtered = templates;

    // Filter by selected modules
    if (selectedModules.length > 0) {
      filtered = filtered.filter(template =>
        selectedModules.includes(template.module)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.featureName.toLowerCase().includes(searchLower) ||
        template.module.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [templates, selectedModules, searchTerm]);

  // Auto-select templates when modules are selected
  useEffect(() => {
    if (selectedModules.length > 0) {
      const templatesInSelectedModules = templates
        .filter(template => selectedModules.includes(template.module))
        .map(template => template.id);
      
      setSelectedTemplates(prev => {
        const newSelection = [...new Set([...prev, ...templatesInSelectedModules])];
        return newSelection;
      });
    }
  }, [selectedModules, templates]);

  const handleCreateProject = async () => {
    if (!projectName.trim() || selectedTemplates.length === 0) return;

    const projectStories: ProjectStory[] = selectedTemplates.map(templateId => {
      const template = templates.find(t => t.id === templateId)!;
      return {
        id: `${templateId}-${Date.now()}`,
        templateId: template.id,
        featureName: template.featureName,
        description: template.description,
        role: template.role,
        goal: template.goal,
        benefit: template.benefit,
        acceptanceCriteria: [...template.acceptanceCriteria],
        tags: [],
        module: template.module,
        customizations: '',
        status: 'draft' as const
      };
    });

    try {
      await createProject({
        name: projectName,
        description: projectDescription,
        stories: projectStories
      });

      setShowNewProject(false);
      setProjectName('');
      setProjectDescription('');
      setSelectedTemplates([]);
      setSelectedModules([]);
      setSearchTerm('');
      refetch();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const exportProjectToExcel = (project: Project) => {
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

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const toggleModuleSelection = (module: string) => {
    const isCurrentlySelected = selectedModules.includes(module);
    
    if (isCurrentlySelected) {
      setSelectedModules(prev => prev.filter(m => m !== module));
      
      const templatesInModule = templates
        .filter(template => template.module === module)
        .map(template => template.id);
      
      setSelectedTemplates(prev => 
        prev.filter(templateId => !templatesInModule.includes(templateId))
      );
    } else {
      setSelectedModules(prev => [...prev, module]);
    }
  };

  const handleTemplateCardClick = (e: React.MouseEvent, templateId: string) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    toggleTemplateSelection(templateId);
  };

  const handleCheckboxChange = (templateId: string) => {
    toggleTemplateSelection(templateId);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    refetch();
  };

  const clearAllFilters = () => {
    setSelectedModules([]);
    setSelectedTemplates([]);
    setSearchTerm('');
  };

  if (selectedProject) {
    return (
      <ProjectDetailsView
        project={selectedProject}
        onBack={handleBackToProjects}
        onProjectUpdate={refetch}
      />
    );
  }

  if (projectsLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <Loader className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-lg">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg">{projectsError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  Projects
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                  {projects.length} items • {projects.reduce((acc, p) => acc + p.stories.length, 0)} stories
                </p>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-md p-1 transition-colors duration-300">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => setShowNewProject(true)}
                  className="bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6">
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center transition-colors duration-300">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <Rocket className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                No projects yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto transition-colors duration-300">
                Create your first project to transform templates into actionable user stories
              </p>
              <button
                onClick={() => setShowNewProject(true)}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
              : "space-y-4"
            }>
              {projects.map(project => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                  {viewMode === 'grid' ? (
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                              {project.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                              {project.name}
                            </h3>
                            {project.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Stories:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {project.stories.length}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {project.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="w-full bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
                        >
                          View Details
                        </button>
                        
                        <button
                          onClick={() => exportProjectToExcel(project)}
                          className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm border border-gray-300 dark:border-gray-600 flex items-center justify-center space-x-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>Export Excel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-xl">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{project.stories.length} stories</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Created {project.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => exportProjectToExcel(project)}
                          className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-sm border border-gray-300 dark:border-gray-600 flex items-center space-x-2"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span className="hidden sm:inline">Export</span>
                        </button>
                        
                        <button
                          onClick={() => handleViewProject(project)}
                          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Project Modal */}
        {showNewProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Project
                </h2>
                <button
                  onClick={() => {
                    setShowNewProject(false);
                    setSelectedTemplates([]);
                    setSelectedModules([]);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Project Details Section */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Project Details
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter project name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Project description (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Module Selection */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Select Modules
                    </h3>
                    {(selectedModules.length > 0 || selectedTemplates.length > 0) && (
                      <button
                        onClick={clearAllFilters}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm self-start sm:self-auto"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableModules.map(module => (
                      <button
                        key={module}
                        onClick={() => toggleModuleSelection(module)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border text-center ${
                          selectedModules.includes(module)
                            ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <span className="truncate">{module}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Selection */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Select Templates
                    </h3>
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Search templates..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedTemplates.includes(template.id)
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                        }`}
                        onClick={(e) => handleTemplateCardClick(e, template.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedTemplates.includes(template.id)}
                            onChange={() => handleCheckboxChange(template.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {template.featureName}
                              </h4>
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 mt-1 sm:mt-0 self-start">
                                {template.module}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTemplates.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <p className="text-green-800 dark:text-green-300 font-medium text-sm">
                        {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowNewProject(false);
                      setSelectedTemplates([]);
                      setSelectedModules([]);
                      setSearchTerm('');
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!projectName.trim() || selectedTemplates.length === 0}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors font-medium text-sm"
                  >
                    Create Project ({selectedTemplates.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};