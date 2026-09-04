import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loading, EmptyState } from '../../components/ui';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchAssignments, deleteAssignment } from '../../store/slices/assignmentSlice';
import { TeacherStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;
type TabName = 'Dashboard' | 'Schedule' | 'Classes' | 'Assignments' | 'Profile';

const tabs: { name: TabName; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid' },
  { name: 'Schedule', icon: 'calendar-outline', activeIcon: 'calendar' },
  { name: 'Classes', icon: 'reader-outline', activeIcon: 'reader' },
  { name: 'Assignments', icon: 'document-text-outline', activeIcon: 'document-text' },
  { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

export const AssignmentsListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const { assignments, loading } = useAppSelector(s => s.assignments);
  const [filter, setFilter] = useState<'Active' | 'History'>('Active');

  useEffect(() => { dispatch(fetchAssignments()); }, [dispatch]);

  const now = new Date();
  const filtered = assignments.filter(a =>
    filter === 'Active' ? new Date(a.dueDate) >= now : new Date(a.dueDate) < now
  );

  // Build header title from first assignment's class/subject info
  const firstItem = assignments[0];
  const headerTitle = firstItem
    ? `Assignments - ${firstItem.subject?.name ?? firstItem.class.name} - ${firstItem.class.name}${firstItem.section ? ` ${firstItem.section.name}` : ''}`
    : 'Assignments';

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteAssignment(id)) },
    ]);
  };

  const handleTabPress = (tab: TabName) => {
    if (tab === 'Dashboard') navigation.navigate('TeacherDashboard');
    else if (tab === 'Classes') navigation.navigate('MyClasses');
    else if (tab === 'Profile') navigation.navigate('TeacherProfile');
    else if (tab === 'Schedule') navigation.navigate('MyTimetable');
  };

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.safe.backgroundColor} />

      {/* Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>

      {/* Active / History Toggle */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleWrapper}>
          {(['Active', 'History'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, filter === t && styles.toggleBtnActive]}
              onPress={() => setFilter(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, filter === t && styles.toggleTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No assignments"
            message={filter === 'Active' ? 'No active assignments' : 'No past assignments'}
            actionLabel="Create Assignment"
            onAction={() => navigation.navigate('CreateAssignment')}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item._id })}
          >
            <View style={styles.cardLeftBorder} />
            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item._id })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="create-outline" size={22} color={colors.gray600} />
                </TouchableOpacity>
              </View>

              {item.subject && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.subject.name}</Text>
                </View>
              )}

              <View style={styles.cardBottomRow}>
                <Text style={styles.dueText}>
                  Due: {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={styles.submittedText}>Submitted: <Text style={styles.submittedBold}>28/30</Text></Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* New Assignment FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateAssignment')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.fabText}>New Assignment</Text>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const isActive = tab.name === 'Assignments';
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.name}</Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#d4dae2' },

  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: 32,
  },

  toggleContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.full,
    padding: 4,
    ...shadows.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  toggleText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },

  list: {
    paddingHorizontal: spacing[5],
    paddingBottom: 140,
    gap: spacing[3],
  },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardLeftBorder: {
    width: 4,
    backgroundColor: colors.primary,
  },
  cardContent: {
    flex: 1,
    padding: spacing[4],
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginRight: spacing[2],
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    marginBottom: spacing[2],
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  submittedText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  submittedBold: {
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },

  fab: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.gray900,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radii.full,
    ...shadows.lg,
  },
  fabText: {
    color: colors.white,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
  },

  tabBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#f3f5f6',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing[4],
    paddingTop: spacing[2],
    ...shadows.md,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 3 },
  tabLabelActive: { color: colors.primary, fontWeight: typography.fontWeights.semibold },
  tabIndicator: {
    position: 'absolute',
    bottom: -spacing[2],
    width: 24, height: 3,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
});
