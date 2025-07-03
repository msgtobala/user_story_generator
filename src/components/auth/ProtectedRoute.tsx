import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthScreen } from './AuthScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthScreen initialMode="login" />;
  }

  return <>{children}</>;
};