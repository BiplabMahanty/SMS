import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Loading, EmptyState } from '../../../components/ui';
import { colors, typography, spacing, radii, shadows } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppStore';
import { fetchAssignments, deleteAssignment } from '../../../store/slices/assignmentSlice';
import { TeacherStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export const AssignmentsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const { assignments, loading } = useAppSelector((s) => s.assignments);
  const [filter, setFilter] = useState<'Active' | 'History'>('Active');

  useEffect(() => { dispatch(fetchAssignments()); }, [dispatch]);

  const now = new Date();
  const filtered = assignments.filter((a) =>
    filter === 'Active' ? new Date(a.dueDate) >= now : new Date(a.dueDate) < now
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteAssignment(id)) },
    ]);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignments</Text>
      </View>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleWrapper}>
          {(['Active', 'History'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.toggleBtn, filter === t && styles.toggleBtnActive]} onPress={() => setFilter(t)} activeOpacity={0.8}>
              <Text style={[styles.toggleText, filter === t && styles.toggleTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
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
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item._id })}>
            <View style={styles.cardLeftBorder} />
            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item._id })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="create-outline" size={22} color={colors.gray600} />
                </TouchableOpacity>
              </View>
              {item.subject && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.subject.name}</Text>
                </View>
              )}
              <View style={styles.cardBottomRow}>
                <Text style={styles.dueText}>Due: {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                <Text style={styles.submittedText}>Submitted: <Text style={styles.submittedBold}>{item.submissionCount ?? 0}/{item.totalStudents ?? 0}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateAssignment')} activeOpacity={0.85}>
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.fabText}>New Assignment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing[5], paddingTop: spacing[6], paddingBottom: spacing[3] },
  headerTitle: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  toggleContainer: { paddingHorizontal: spacing[5], marginBottom: spacing[4] },
  toggleWrapper: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radii.full, padding: 4, ...shadows.sm },
  toggleBtn: { flex: 1, paddingVertical: spacing[2], borderRadius: radii.full, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.primaryLight },
  toggleText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textSecondary },
  toggleTextActive: { color: colors.primary, fontWeight: typography.fontWeights.semibold },
  list: { paddingHorizontal: spacing[5], paddingBottom: 140, gap: spacing[3] },
  card: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radii.lg, overflow: 'hidden', ...shadows.sm },
  cardLeftBorder: { width: 4, backgroundColor: colors.primary },
  cardContent: { flex: 1, padding: spacing[4] },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing[2] },
  cardTitle: { flex: 1, fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, marginRight: spacing[2] },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.primaryLight, borderRadius: radii.sm, paddingHorizontal: spacing[2], paddingVertical: 2, marginBottom: spacing[2] },
  badgeText: { fontSize: typography.fontSizes.xs, color: colors.primary, fontWeight: typography.fontWeights.medium },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dueText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  submittedText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  submittedBold: { fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  fab: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.gray900, paddingHorizontal: spacing[5], paddingVertical: spacing[3], borderRadius: radii.full, ...shadows.lg },
  fabText: { color: colors.white, fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold },
});
