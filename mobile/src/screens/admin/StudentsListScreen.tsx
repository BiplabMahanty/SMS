import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState, ErrorState, StatusBadge, ConfirmModal, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchStudents, deleteStudent, clearStudentError } from '../../store/slices/studentSlice';
import { Student } from '../../types/student';
import { AdminStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

const StudentRow: React.FC<{
  student: Student;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ student, onPress, onEdit, onDelete }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.rowInfo}>
      <Text style={styles.rowName} numberOfLines={1}>{student.name}</Text>
      <Text style={styles.rowSub} numberOfLines={1}>
        {student.studentId} · {student.class?.name ?? '—'}
        {student.section ? ` · ${student.section.name}` : ''}
      </Text>
      <StatusBadge status={student.status} />
    </View>
    <View style={styles.rowActions}>
      <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="create-outline" size={18} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export const StudentsListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { students, pagination, loading, submitting, error } = useAppSelector((s) => s.students);

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    (p = 1, q = search) => {
      dispatch(fetchStudents({ page: p, limit: 20, search: q || undefined }));
    },
    [dispatch, search]
  );

  useEffect(() => {
    load(1, '');
  }, [dispatch]);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      load(1, search);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await dispatch(fetchStudents({ page: 1, limit: 20, search: search || undefined }));
    setRefreshing(false);
  };

  const loadMore = () => {
    if (pagination && page < pagination.totalPages && !loading) {
      const next = page + 1;
      setPage(next);
      dispatch(fetchStudents({ page: next, limit: 20, search: search || undefined }));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteStudent(deleteTarget._id));
    setDeleteTarget(null);
  };

  if (error && students.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState message={error} onRetry={() => { dispatch(clearStudentError()); load(1); }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Students</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddStudent')}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.gray400} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, ID..."
          placeholderTextColor={colors.gray400}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.gray400} />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      {pagination && (
        <Text style={styles.countText}>
          {pagination.total} student{pagination.total !== 1 ? 's' : ''}
        </Text>
      )}

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            onPress={() => navigation.navigate('StudentDetails', { studentId: item._id })}
            onEdit={() => navigation.navigate('EditStudent', { studentId: item._id })}
            onDelete={() => setDeleteTarget(item)}
          />
        )}
        contentContainerStyle={students.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="people-outline"
              title="No students found"
              message={search ? 'Try a different search term.' : 'Add your first student to get started.'}
              actionLabel={search ? undefined : 'Add Student'}
              onAction={search ? undefined : () => navigation.navigate('AddStudent')}
            />
          )
        }
        ListFooterComponent={
          loading && students.length > 0 ? (
            <ActivityIndicator color={colors.primary} style={{ padding: spacing[4] }} />
          ) : null
        }
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={submitting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing[1], marginRight: spacing[2] },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing[2],
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing[4],
    marginBottom: spacing[2],
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
  },
  searchIcon: { marginRight: spacing[2] },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[3],
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
  },
  countText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing[5],
    marginBottom: spacing[2],
  },
  list: { paddingHorizontal: spacing[4], paddingBottom: spacing[8] },
  emptyContainer: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[3],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  avatarText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rowSub: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  rowActions: { flexDirection: 'row', gap: spacing[1] },
  actionBtn: { padding: spacing[2] },
});
