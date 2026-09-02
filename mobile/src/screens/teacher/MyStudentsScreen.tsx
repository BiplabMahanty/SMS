import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Loading, EmptyState, ErrorState, StatusBadge, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyStudents } from '../../store/slices/teacherSlice';
import { Student } from '../../types/student';

export const MyStudentsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { myStudents, myStudentsPagination, loading, error } = useAppSelector((s) => s.teachers);

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { dispatch(fetchMyStudents({})); }, [dispatch]);

  const onSearch = (text: string) => {
    setSearch(text);
    dispatch(fetchMyStudents({ search: text || undefined, page: 1 }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyStudents({ search: search || undefined, page: 1 }));
    setRefreshing(false);
  };

  if (loading && myStudents.length === 0) return <Loading fullScreen />;
  if (error && myStudents.length === 0) return <ErrorState message={error} onRetry={() => dispatch(fetchMyStudents({}))} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Students</Text>
        <Text style={styles.count}>{myStudentsPagination?.total ?? 0}</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
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
        data={myStudents}
        keyExtractor={(s: Student) => s._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No students found" message="No students in your assigned classes" />}
        renderItem={({ item }: { item: Student }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentSub}>{item.studentId} · Roll {item.rollNumber ?? '—'}</Text>
                <Text style={styles.studentClass}>
                  {(item.class as any)?.name ?? ''}{(item.section as any)?.name ? ` — ${(item.section as any).name}` : ''}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          </Card>
        )}
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
  count: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)' },
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
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  avatarText: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary },
  info: { flex: 1 },
  studentName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  studentSub: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  studentClass: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 1 },
});
