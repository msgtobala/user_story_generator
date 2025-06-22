export interface UserStoryTemplate {
  id: string;
  featureName: string;
  description: string;
  role: string;
  goal: string;
  benefit: string;
  acceptanceCriteria: string[];
  module: string;
  attachments?: FileAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stories: ProjectStory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStory {
  id: string;
  templateId: string;
  featureName: string;
  description: string;
  role: string;
  goal: string;
  benefit: string;
  acceptanceCriteria: string[];
  tags: string[];
  module: string;
  customizations: string;
  status: 'draft' | 'review' | 'approved';
  attachments?: FileAttachment[];
}

export interface FilterOptions {
  searchTerm: string;
  selectedModules: string[];
  sortBy: 'name-asc' | 'name-desc' | 'date-newest' | 'date-oldest';
}