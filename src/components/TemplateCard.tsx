import React, { useState } from 'react';
import { Edit, Trash2, Copy, Calendar, Paperclip, MoreVertical, ChevronDown, ChevronUp, Star, Clock } from 'lucide-react';
import { UserStoryTemplate } from '../types';

interface TemplateCardProps {
  template: UserStoryTemplate;
  onEdit: (template: UserStoryTemplate) => void;
  onDelete: (id: string) => void;
  onClone: (template: UserStoryTemplate) => void;
  viewMode?: 'grid' | 'list';
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onClone,
  viewMode = 'grid'
}) => {
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    {template.featureName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {template.featureName}
                    </h3>
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">
                      {template.module}
                    </span>
                    {template.attachments && template.attachments.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <Paperclip className="h-3 w-3" />
                        <span>{template.attachments.length}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  "As a <span className="font-medium text-blue-600 dark:text-blue-400">{template.role}</span>, 
                  I want to <span className="font-medium text-blue-600 dark:text-blue-400">{template.goal}</span>, 
                  so that <span className="font-medium text-blue-600 dark:text-blue-400">{template.benefit}</span>."
                </p>
              </div>

              {expanded && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Acceptance Criteria
                    </h4>
                    <ul className="space-y-1">
                      {template.acceptanceCriteria.map((criteria, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {template.attachments && template.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Attachments
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {template.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={() => window.open(attachment.url, '_blank')}
                            className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            title={attachment.name}
                          >
                            {attachment.name.length > 20 
                              ? `${attachment.name.substring(0, 20)}...` 
                              : attachment.name
                            }
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.updatedAt.toLocaleDateString()}</span>
                  </div>
                  <span>•</span>
                  <span>{template.acceptanceCriteria.length} criteria</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all duration-200"
                  >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => onClone(template)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all duration-200"
                    title="Clone template"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(template)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all duration-200"
                    title="Edit template"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(template.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-200"
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                  {template.featureName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  {template.featureName}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full">
                    {template.module}
                  </span>
                  {template.attachments && template.attachments.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                      <Paperclip className="h-3 w-3" />
                      <span>{template.attachments.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {template.description}
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                "As a <span className="font-medium text-blue-600 dark:text-blue-400">{template.role}</span>, 
                I want to <span className="font-medium text-blue-600 dark:text-blue-400">{template.goal}</span>, 
                so that <span className="font-medium text-blue-600 dark:text-blue-400">{template.benefit}</span>."
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[140px]">
                <button
                  onClick={() => {
                    onEdit(template);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onClone(template);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                >
                  <Copy className="h-4 w-4" />
                  <span>Clone</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(template.id);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Acceptance Criteria
            </h4>
            <ul className="space-y-1">
              {template.acceptanceCriteria.slice(0, 2).map((criteria, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {criteria}
                </li>
              ))}
              {template.acceptanceCriteria.length > 2 && (
                <li className="text-xs text-gray-500 dark:text-gray-400 italic ml-4">
                  +{template.acceptanceCriteria.length - 2} more criteria
                </li>
              )}
            </ul>
          </div>

          {template.attachments && template.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Attachments
              </h4>
              <div className="flex flex-wrap gap-2">
                {template.attachments.slice(0, 3).map((attachment) => (
                  <button
                    key={attachment.id}
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    title={attachment.name}
                  >
                    {attachment.name.length > 15 
                      ? `${attachment.name.substring(0, 15)}...` 
                      : attachment.name
                    }
                  </button>
                ))}
                {template.attachments.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    +{template.attachments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{template.updatedAt.toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onClone(template)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all duration-200"
                title="Clone template"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(template)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all duration-200"
                title="Edit template"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-200"
                title="Delete template"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};