import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/Navigation';
import { TemplatesView } from './components/TemplatesView';
import { ProjectsView } from './components/ProjectsView';

function App() {
  const [activeTab, setActiveTab] = useState<'templates' | 'projects'>('templates');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main>
          {activeTab === 'templates' ? <TemplatesView /> : <ProjectsView />}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;