import React, { useState } from 'react';
import { FileText, Layers, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavigationProps {
  activeTab: 'templates' | 'projects';
  onTabChange: (tab: 'templates' | 'projects') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300 pt-5 pb-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-md flex items-center justify-center shadow-sm">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  Symphony Narrate
                </h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  USG
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Desktop */}
      <div className="hidden sm:block mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-0">
          <button
            onClick={() => onTabChange('templates')}
            className={`relative px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === 'templates'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Templates</span>
            </div>
          </button>
          
          <button
            onClick={() => onTabChange('projects')}
            className={`relative px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === 'projects'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Projects</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => {
                onTabChange('templates');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'templates'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Templates</span>
            </button>
            
            <button
              onClick={() => {
                onTabChange('projects');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'projects'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Layers className="h-5 w-5" />
              <span>Projects</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};