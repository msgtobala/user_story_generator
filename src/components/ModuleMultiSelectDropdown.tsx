import React, { useState } from 'react';
import { ChevronDown, Plus, Check, X, Loader } from 'lucide-react';
import { useModules } from '../hooks/useModules';
import { addModule } from '../services/modules';

interface ModuleMultiSelectDropdownProps {
  selectedModules: string[];
  onChange: (modules: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ModuleMultiSelectDropdown: React.FC<ModuleMultiSelectDropdownProps> = ({
  selectedModules,
  onChange,
  placeholder = "Select modules",
  disabled = false
}) => {
  const { modules, loading, refetch } = useModules();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddNewForm, setShowAddNewForm] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = modules.filter(module =>
    module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleModule = (module: string) => {
    const isSelected = selectedModules.includes(module);
    if (isSelected) {
      onChange(selectedModules.filter(m => m !== module));
    } else {
      onChange([...selectedModules, module]);
    }
  };

  const handleAddNewModule = async () => {
    if (!newModuleName.trim()) return;

    setAdding(true);
    try {
      await addModule(newModuleName.trim());
      await refetch();
      onChange([...selectedModules, newModuleName.trim()]);
      setNewModuleName('');
      setShowAddNewForm(false);
    } catch (error) {
      console.error('Failed to add module:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setNewModuleName('');
    setShowAddNewForm(false);
  };

  const getDisplayText = () => {
    if (selectedModules.length === 0) return placeholder;
    if (selectedModules.length === 1) return selectedModules[0];
    return `${selectedModules.length} modules selected`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <span className={selectedModules.length > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-600">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search modules..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Module List */}
          <div className="max-h-40 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading modules...</span>
              </div>
            ) : filteredModules.length > 0 ? (
              filteredModules.map((module) => (
                <button
                  key={module}
                  type="button"
                  onClick={() => handleToggleModule(module)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                    selectedModules.includes(module)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <span>{module}</span>
                  {selectedModules.includes(module) && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))
            ) : searchTerm ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No modules found for "{searchTerm}"
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No modules available
              </div>
            )}
          </div>

          {/* Add New Module Section */}
          <div className="border-t border-gray-200 dark:border-gray-600">
            {showAddNewForm ? (
              <div className="p-2 space-y-2">
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="Enter new module name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewModule();
                    } else if (e.key === 'Escape') {
                      handleCancelAdd();
                    }
                  }}
                  autoFocus
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddNewModule}
                    disabled={!newModuleName.trim() || adding}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 dark:bg-green-500 text-white text-sm rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {adding ? (
                      <Loader className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    <span>{adding ? 'Adding...' : 'Add'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    disabled={adding}
                    className="flex items-center space-x-1 px-3 py-1 text-gray-600 dark:text-gray-400 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddNewForm(true)}
                className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add new module</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setShowAddNewForm(false);
            setNewModuleName('');
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
};