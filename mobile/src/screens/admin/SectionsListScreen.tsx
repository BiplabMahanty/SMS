import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Loading, EmptyState, ErrorState, ConfirmModal, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchSections, deleteSection, fetchAcademicYears } from '../../store/slices/classSlice';
import { AdminStackParamList } from '../../navigation/types';
import { SectionItem } from '../../types/student';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;
type RouteProps = RouteProp<AdminStackParamList, 'SectionsList'>;

export const SectionsListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { classId, className } = route.params;

  const { sections, academicYears, loading, error } = useAppSelector((s) => s.classes);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SectionItem | null>(null);

  const load = useCallback(() => {
    dispatch(fetchSections(classId));
    dispatch(fetchAcademicYears());
  }, [dispatch, classId]);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchSections(classId));
    setRefreshing(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteSection(deleteTarget._id));
    setDeleteTarget(null);
  };

  const currentAcademicYear = academicYears[0]?._id ?? '';

  if (loading && sections.length === 0) return <Loading fullScreen />;
  if (error && sections.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Sections</Text>
          <Text style={styles.headerSub}>{className}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddEditSection', { classId, academicYearId: currentAcademicYear })}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <FlatList
        data={sections}
        keyExtractor={(s) => s._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="grid-outline"
            title="No sections found"
            message="Add a section to this class"
            actionLabel="Add Section"
            onAction={() => navigation.navigate('AddEditSection', { classId, academicYearId: currentAcademicYear })}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="grid" size={20} color={colors.info} />
              </View>
              <Text style={styles.sectionName}>Section {item.name}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('AddEditSection', {
                  classId,
                  academicYearId: currentAcademicYear,
                  sectionId: item._id,
                  sectionName: item.name,
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
        title="Delete Section"
        message={`Delete Section "${deleteTarget?.name}"?`}
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
  headerText: { flex: 1 },
  headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  headerSub: { fontSize: typography.fontSizes.xs, color: 'rgba(255,255,255,0.75)' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.md, padding: spacing[2] },
  list: { padding: spacing[4], paddingBottom: spacing[8] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  sectionName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  cardActions: { flexDirection: 'row', gap: spacing[4], marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  actionText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium },
});
