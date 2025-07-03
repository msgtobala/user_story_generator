import { useState, useEffect } from 'react';
import { UserStoryTemplate, FilterOptions } from '../types';
import { getTemplates } from '../services/userStories';

export const useTemplates = () => {
  const [templates, setTemplates] = useState<UserStoryTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<UserStoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const sortTemplates = (templates: UserStoryTemplate[], sortBy: FilterOptions['sortBy']): UserStoryTemplate[] => {
    const sorted = [...templates];
    
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.featureName.localeCompare(b.featureName));
      case 'name-desc':
        return sorted.sort((a, b) => b.featureName.localeCompare(a.featureName));
      case 'date-newest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'date-oldest':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      default:
        return sorted;
    }
  };

  const filterTemplates = (filters: FilterOptions) => {
    let filtered = templates;

    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(template => 
        template.featureName.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.goal.toLowerCase().includes(searchLower)
      );
    }

    // Apply module filter
    if (filters.selectedModules.length > 0) {
      filtered = filtered.filter(template =>
        filters.selectedModules.includes(template.module)
      );
    }

    // Apply sorting
    filtered = sortTemplates(filtered, filters.sortBy);

    setFilteredTemplates(filtered);
  };

  return {
    templates,
    filteredTemplates,
    loading,
    error,
    refetch: loadTemplates,
    filterTemplates
  };
};