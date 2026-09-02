import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Loading, EmptyState, ErrorState, StatusBadge, ConfirmModal, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchTeachers, deleteTeacher } from '../../store/slices/teacherSlice';
import { AdminStackParamList } from '../../navigation/types';
import { Teacher } from '../../types/teacher';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

const TeacherCard: React.FC<{
  teacher: Teacher;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ teacher, onPress, onEdit, onDelete }) => (
  <Card style={styles.card} onPress={onPress}>
    <View style={styles.cardRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{teacher.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{teacher.name}</Text>
        <Text style={styles.cardSub}>{teacher.teacherId} · {teacher.department || 'No dept.'}</Text>
        <Text style={styles.cardEmail}>{teacher.email}</Text>
      </View>
      <StatusBadge status={teacher.status} />
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
        <Ionicons name="pencil-outline" size={16} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color={colors.error} />
        <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  </Card>
);

export const TeachersListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { teachers, pagination, loading, error } = useAppSelector((s) => s.teachers);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const load = useCallback((p = 1, q = search) => {
    dispatch(fetchTeachers({ page: p, limit: 20, search: q || undefined }));
  }, [dispatch, search]);

  useEffect(() => { load(1); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await dispatch(fetchTeachers({ page: 1, limit: 20, search: search || undefined }));
    setRefreshing(false);
  };

  const onSearch = (text: string) => {
    setSearch(text);
    setPage(1);
    dispatch(fetchTeachers({ page: 1, limit: 20, search: text || undefined }));
  };

  const loadMore = () => {
    if (pagination && page < pagination.totalPages) {
      const next = page + 1;
      setPage(next);
      dispatch(fetchTeachers({ page: next, limit: 20, search: search || undefined }));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteTeacher(deleteTarget._id));
    setDeleteTarget(null);
  };

  if (loading && teachers.length === 0) return <Loading fullScreen />;
  if (error && teachers.length === 0) return (
    <ErrorState message={error} onRetry={() => load(1)} />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teachers</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTeacher')}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teachers..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={onSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={teachers}
        keyExtractor={(t) => t._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="person-outline"
            title="No teachers found"
            message={search ? 'Try a different search term' : 'Add your first teacher'}
            actionLabel="Add Teacher"
            onAction={() => navigation.navigate('AddTeacher')}
          />
        }
        renderItem={({ item }) => (
          <TeacherCard
            teacher={item}
            onPress={() => navigation.navigate('TeacherDetails', { teacherId: item._id })}
            onEdit={() => navigation.navigate('EditTeacher', { teacherId: item._id })}
            onDelete={() => setDeleteTarget(item)}
          />
        )}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
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
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.md,
    padding: spacing[2],
  },
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
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
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
