import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { TemplatesView } from './components/TemplatesView';
import { ProjectsView } from './components/ProjectsView';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const [activeTab, setActiveTab] = useState<'templates' | 'projects'>('templates');

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main>
            <ProtectedRoute>
              {activeTab === 'templates' ? <TemplatesView /> : <ProjectsView />}
            </ProtectedRoute>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;