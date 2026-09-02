import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Button, Card, Input, Loading, EmptyState, ErrorState } from '../components/ui';
import { colors, typography, spacing } from '../theme';
import { healthService } from '../services/healthService';

type DemoView = 'components' | 'empty' | 'error' | 'loading';

export const HomeScreen: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<DemoView>('components');
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const checkHealth = async () => {
    setChecking(true);
    setHealthStatus('');
    try {
      const res = await healthService.check();
      setHealthStatus(`✅ ${res.data.message}`);
    } catch {
      setHealthStatus('❌ Backend unreachable');
    } finally {
      setChecking(false);
    }
  };

  if (activeDemo === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <Loading fullScreen message="Loading data..." />
        <View style={styles.backBtn}>
          <Button label="Back" onPress={() => setActiveDemo('components')} variant="outline" size="sm" />
        </View>
      </SafeAreaView>
    );
  }

  if (activeDemo === 'empty') {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="school-outline"
          title="No Students Found"
          message="There are no students enrolled yet. Add a student to get started."
          actionLabel="Add Student"
          onAction={() => setActiveDemo('components')}
        />
      </SafeAreaView>
    );
  }

  if (activeDemo === 'error') {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState
          title="Failed to load data"
          message="Could not connect to the server. Check your connection and try again."
          onRetry={() => setActiveDemo('components')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Student Management</Text>
          <Text style={styles.subtitle}>Phase 1 — Foundation</Text>
        </View>

        {/* Health Check */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Health Check</Text>
          <Button
            label="Ping API"
            onPress={checkHealth}
            loading={checking}
            fullWidth
          />
          {healthStatus ? (
            <Text style={styles.healthStatus}>{healthStatus}</Text>
          ) : null}
        </Card>

        {/* Input Demo */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Input Component</Text>
          <Input
            label="Student Name"
            placeholder="Enter student name"
            leftIcon="person-outline"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <Input
            label="Password"
            placeholder="Enter password"
            leftIcon="lock-closed-outline"
            isPassword
          />
          <Input
            label="With Error"
            placeholder="Enter email"
            leftIcon="mail-outline"
            error="Invalid email address"
            value="bad-email"
            onChangeText={() => {}}
          />
        </Card>

        {/* Button Variants */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Button Variants</Text>
          <View style={styles.buttonRow}>
            <Button label="Primary" onPress={() => {}} style={styles.btnFlex} />
            <Button label="Secondary" onPress={() => {}} variant="secondary" style={styles.btnFlex} />
          </View>
          <View style={styles.buttonRow}>
            <Button label="Outline" onPress={() => {}} variant="outline" style={styles.btnFlex} />
            <Button label="Danger" onPress={() => {}} variant="danger" style={styles.btnFlex} />
          </View>
          <Button label="Ghost Button" onPress={() => {}} variant="ghost" fullWidth />
          <Button label="Loading..." onPress={() => {}} loading fullWidth style={{ marginTop: spacing[2] }} />
          <Button label="Disabled" onPress={() => {}} disabled fullWidth style={{ marginTop: spacing[2] }} />
        </Card>

        {/* State Demos */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>State Components</Text>
          <View style={styles.buttonRow}>
            <Button label="Empty State" onPress={() => setActiveDemo('empty')} variant="outline" size="sm" style={styles.btnFlex} />
            <Button label="Error State" onPress={() => setActiveDemo('error')} variant="outline" size="sm" style={styles.btnFlex} />
          </View>
          <Button label="Loading State" onPress={() => setActiveDemo('loading')} variant="outline" size="sm" fullWidth style={{ marginTop: spacing[2] }} />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    marginBottom: spacing[5],
    marginTop: spacing[2],
  },
  title: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  btnFlex: {
    flex: 1,
  },
  healthStatus: {
    marginTop: spacing[3],
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backBtn: {
    position: 'absolute',
    bottom: spacing[8],
    alignSelf: 'center',
  },
});
