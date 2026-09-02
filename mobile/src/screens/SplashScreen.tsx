import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Loading } from '../components/ui';
import { colors, typography, spacing } from '../theme';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="school" size={72} color={colors.primary} />
      <Text style={styles.title}>Student Management</Text>
      <Text style={styles.subtitle}>System</Text>
      <View style={styles.loader}>
        <Loading size="large" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing[5],
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  loader: {
    marginTop: spacing[10],
  },
});
