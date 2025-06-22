import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FilterOptions } from '../types';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableModules: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  availableModules
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchTerm: e.target.value });
  };

  const toggleModule = (module: string) => {
    const newModules = filters.selectedModules.includes(module)
      ? filters.selectedModules.filter(m => m !== module)
      : [...filters.selectedModules, module];
    onFiltersChange({ ...filters, selectedModules: newModules });
  };

  const clearFilters = () => {
    onFiltersChange({ searchTerm: '', selectedModules: [] });
  };

  const hasActiveFilters = filters.searchTerm || filters.selectedModules.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Filter className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded-md hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            <span>Clear all filters</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates by name, description, or goal..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Modules</label>
        <div className="flex flex-wrap gap-2">
          {availableModules.map(module => (
            <button
              key={module}
              onClick={() => toggleModule(module)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                filters.selectedModules.includes(module)
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200 shadow-sm'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
              }`}
            >
              {module}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};