import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Loading, EmptyState, ErrorState, ConfirmModal, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchClasses, deleteClass } from '../../store/slices/classSlice';
import { AdminStackParamList } from '../../navigation/types';
import { ClassWithYear } from '../../services/classService';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

export const ClassesListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { classes, loading, error } = useAppSelector((s) => s.classes);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassWithYear | null>(null);

  const load = useCallback(() => { dispatch(fetchClasses()); }, [dispatch]);
  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchClasses());
    setRefreshing(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteClass(deleteTarget._id));
    setDeleteTarget(null);
  };

  if (loading && classes.length === 0) return <Loading fullScreen />;
  if (error && classes.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Classes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditClass', undefined)}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <FlatList
        data={classes}
        keyExtractor={(c) => c._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="school-outline"
            title="No classes found"
            message="Add your first class"
            actionLabel="Add Class"
            onAction={() => navigation.navigate('AddEditClass', undefined)}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="school" size={20} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.className}>{item.name}</Text>
                <Text style={styles.yearText}>{(item.academicYear as any)?.name ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('SectionsList', { classId: item._id, className: item.name })}
              >
                <Ionicons name="list-outline" size={15} color={colors.info} />
                <Text style={[styles.actionText, { color: colors.info }]}>Sections</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('AddEditClass', {
                  classId: item._id,
                  className: item.name,
                  academicYearId: (item.academicYear as any)?._id,
                })}
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
        title="Delete Class"
        message={`Delete "${deleteTarget?.name}"? All its sections will also be deleted.`}
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
  list: { padding: spacing[4], paddingBottom: spacing[8] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  cardInfo: { flex: 1 },
  className: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  yearText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: spacing[4], marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  actionText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium },
});
