import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { restoreSession } from '../store/slices/authSlice';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { AdminNavigator } from './AdminNavigator';
import { TeacherNavigator } from './TeacherNavigator';
import { StudentNavigator } from './StudentNavigator';
import { ParentNavigator } from './ParentNavigator';

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isInitializing, isAuthenticated, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (isInitializing) {
    return <SplashScreen />;
  }

  if (!isAuthenticated || !user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  const renderAppNavigator = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminNavigator />;
      case 'TEACHER':
        return <TeacherNavigator />;
      case 'STUDENT':
        return <StudentNavigator />;
      case 'PARENT':
        return <ParentNavigator />;
      default:
        return <AuthNavigator />;
    }
  };

  return <NavigationContainer>{renderAppNavigator()}</NavigationContainer>;
};
