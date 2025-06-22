import React, { useState, useMemo } from 'react';
import { Plus, AlertCircle, Loader, FileText, Search, Filter, Grid, List, Star, Clock, Users, ChevronDown, ArrowUpDown, Sparkles } from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { FilterOptions, UserStoryTemplate } from '../types';
import { createTemplate, updateTemplate, deleteTemplate } from '../services/userStories';
import { SearchFilters } from './SearchFilters';
import { TemplateCard } from './TemplateCard';
import { TemplateForm } from './TemplateForm';
import { ModuleDropdown } from './ModuleDropdown';

export const TemplatesView: React.FC = () => {
  const { templates, filteredTemplates, loading, error, refetch, filterTemplates } = useTemplates();
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    selectedModules: [],
    sortBy: 'date-newest'
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UserStoryTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const availableModules = useMemo(() => {
    const allModules = templates.map(template => template.module);
    return [...new Set(allModules)].filter(Boolean);
  }, [templates]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    filterTemplates(newFilters);
  };

  const handleModuleFilterChange = (module: string) => {
    const newFilters = {
      ...filters,
      selectedModules: module ? [module] : []
    };
    handleFiltersChange(newFilters);
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    const newFilters = { ...filters, sortBy };
    handleFiltersChange(newFilters);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };

  const handleEditTemplate = (template: UserStoryTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleCloneTemplate = (template: UserStoryTemplate) => {
    setEditingTemplate({ ...template, featureName: `${template.featureName} (Copy)` });
    setShowForm(true);
  };

  const handleSaveTemplate = async (templateData: Omit<UserStoryTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingTemplate?.id) {
        await updateTemplate(editingTemplate.id, templateData);
      } else {
        await createTemplate(templateData);
      }
      setShowForm(false);
      setEditingTemplate(null);
      refetch();
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        refetch();
      } catch (err) {
        console.error('Failed to delete template:', err);
      }
    }
  };

  const getSortLabel = (sortBy: FilterOptions['sortBy']) => {
    switch (sortBy) {
      case 'name-asc': return 'Name A-Z';
      case 'name-desc': return 'Name Z-A';
      case 'date-newest': return 'Newest First';
      case 'date-oldest': return 'Oldest First';
      default: return 'Sort By';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <Loader className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-lg">Loading templates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg">{error}</span>
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
                  Templates
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                  {templates.length} items • {availableModules.length} modules
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
                  onClick={handleCreateTemplate}
                  className="bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm shadow-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New</span>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={true}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white rounded-md hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm shadow-sm self-start sm:self-auto"
                >
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate with AI</span>
                  </>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFiltersChange({ ...filters, searchTerm: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Module Filter */}
              <div>
                <ModuleDropdown
                  value={filters.selectedModules[0] || ''}
                  onChange={handleModuleFilterChange}
                  placeholder="All Modules"
                  required={false}
                  showAddNew={false}
                />
              </div>

              {/* Sort By */}
              <div>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm appearance-none"
                  >
                    <option value="date-newest">Newest First</option>
                    <option value="date-oldest">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ArrowUpDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {(filters.searchTerm || filters.selectedModules.length > 0 || filters.sortBy !== 'date-newest') && (
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700 transition-colors duration-300 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-800 dark:text-blue-300 font-medium text-sm">
                    {filteredTemplates.length} of {templates.length} templates • Sorted by {getSortLabel(filters.sortBy)}
                  </span>
                </div>
                <button
                  onClick={() => handleFiltersChange({ searchTerm: '', selectedModules: [], sortBy: 'date-newest' })}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200 self-start sm:self-auto"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6">
          {filteredTemplates.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center transition-colors duration-300">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                {templates.length === 0 ? 'No templates yet' : 'No templates found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto transition-colors duration-300">
                {templates.length === 0 
                  ? 'Get started by creating your first user story template'
                  : 'Try adjusting your search filters'
                }
              </p>
              {templates.length === 0 && (
                <button
                  onClick={handleCreateTemplate}
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm"
                >
                  Create Template
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
              : "space-y-4"
            }>
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onClone={handleCloneTemplate}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        <TemplateForm
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => {
            setShowForm(false);
            setEditingTemplate(null);
          }}
          isVisible={showForm}
        />
      </div>
    </div>
  );
};