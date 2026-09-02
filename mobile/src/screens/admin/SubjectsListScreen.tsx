import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Loading, EmptyState, ErrorState, ConfirmModal, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchSubjects, deleteSubject } from '../../store/slices/subjectSlice';
import { AdminStackParamList } from '../../navigation/types';
import { Subject } from '../../types/timetable';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

export const SubjectsListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { subjects, loading, error } = useAppSelector((s) => s.subjects);

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const load = useCallback((q = search) => {
    dispatch(fetchSubjects({ search: q || undefined }));
  }, [dispatch, search]);

  useEffect(() => { load(); }, []);

  const onSearch = (text: string) => {
    setSearch(text);
    dispatch(fetchSubjects({ search: text || undefined }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSubjects({ search: search || undefined }));
    setRefreshing(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteSubject(deleteTarget._id));
    setDeleteTarget(null);
  };

  if (loading && subjects.length === 0) return <Loading fullScreen />;
  if (error && subjects.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subjects</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddSubject')}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subjects..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={onSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(s) => s._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title="No subjects found"
            message={search ? 'Try a different search' : 'Add your first subject'}
            actionLabel="Add Subject"
            onAction={() => navigation.navigate('AddSubject')}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{item.code}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.subjectMeta}>
                  {(item.class as any)?.name ?? '—'} · {(item.academicYear as any)?.name ?? '—'}
                </Text>
                {item.teacher && (
                  <Text style={styles.teacherText}>
                    <Ionicons name="person-outline" size={11} color={colors.textSecondary} /> {(item.teacher as any)?.name}
                  </Text>
                )}
              </View>
              {item.isElective && (
                <View style={styles.electiveBadge}>
                  <Text style={styles.electiveText}>Elective</Text>
                </View>
              )}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('EditSubject', { subjectId: item._id })}
              >
                <Ionicons name="pencil-outline" size={15} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setDeleteTarget(item)}>
                <Ionicons name="trash-outline" size={15} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Subject"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  backBtn: { padding: spacing[1], marginRight: spacing[3] },
  headerTitle: { flex: 1, fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.md, padding: spacing[2] },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing[4],
    borderRadius: radii.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: typography.fontSizes.base, color: colors.textPrimary, paddingVertical: 0 },
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  codeBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[3],
    minWidth: 52,
    alignItems: 'center',
  },
  codeText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold, color: colors.primary },
  cardInfo: { flex: 1 },
  subjectName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  subjectMeta: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  teacherText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  electiveBadge: { backgroundColor: colors.warningLight, borderRadius: radii.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  electiveText: { fontSize: typography.fontSizes.xs, color: colors.warning, fontWeight: typography.fontWeights.semibold },
  cardActions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  actionText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium },
});
