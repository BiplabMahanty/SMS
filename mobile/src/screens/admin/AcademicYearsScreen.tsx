import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, ScrollView, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, Loading, EmptyState, ErrorState, ConfirmModal, Input, Button, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  fetchAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from '../../store/slices/classSlice';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});
type FormValues = z.infer<typeof schema>;

interface YearItem {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export const AcademicYearsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { academicYears, loading, submitting, error } = useAppSelector((s) => s.classes);

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<YearItem | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<YearItem | null>(null);

  useEffect(() => { dispatch(fetchAcademicYears()); }, [dispatch]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', startDate: '', endDate: '' },
  });

  const openAdd = () => {
    setEditTarget(null);
    setIsCurrent(false);
    reset({ name: '', startDate: '', endDate: '' });
    setModalVisible(true);
  };

  const openEdit = (item: YearItem) => {
    setEditTarget(item);
    setIsCurrent(item.isCurrent ?? false);
    reset({
      name: item.name,
      startDate: item.startDate?.split('T')[0] ?? '',
      endDate: item.endDate?.split('T')[0] ?? '',
    });
    setModalVisible(true);
  };

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, isCurrent };
    const action = editTarget
      ? updateAcademicYear({ id: editTarget._id, data: payload })
      : createAcademicYear(payload);
    const result = await dispatch(action);
    const matched = editTarget
      ? updateAcademicYear.fulfilled.match(result)
      : createAcademicYear.fulfilled.match(result);
    if (matched) { setModalVisible(false); reset(); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteAcademicYear(deleteTarget._id));
    setDeleteTarget(null);
  };

  if (loading && academicYears.length === 0) return <Loading fullScreen />;
  if (error && academicYears.length === 0) return <ErrorState message={error} onRetry={() => dispatch(fetchAcademicYears())} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academic Years</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <FlatList
        data={academicYears}
        keyExtractor={(y) => y._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No academic years"
            message="Create your first academic year to get started"
            actionLabel="Create Academic Year"
            onAction={openAdd}
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconBox, { backgroundColor: item.isCurrent ? colors.successLight : colors.primaryLight }]}>
                <Ionicons name="calendar" size={20} color={item.isCurrent ? colors.success : colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.yearName}>{item.name}</Text>
                  {item.isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentText}>Current</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.dateText}>
                  {item.startDate ? new Date(item.startDate).toLocaleDateString() : '—'}
                  {' → '}
                  {item.endDate ? new Date(item.endDate).toLocaleDateString() : '—'}
                </Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item as YearItem)}>
                <Ionicons name="pencil-outline" size={15} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setDeleteTarget(item as YearItem)}>
                <Ionicons name="trash-outline" size={15} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editTarget ? 'Edit Academic Year' : 'New Academic Year'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Name *"
                  placeholder="e.g. 2024-25"
                  leftIcon="text-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                />
              )} />

              <Controller control={control} name="startDate" render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Start Date * (YYYY-MM-DD)"
                  placeholder="e.g. 2024-04-01"
                  leftIcon="calendar-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.startDate?.message}
                />
              )} />

              <Controller control={control} name="endDate" render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="End Date * (YYYY-MM-DD)"
                  placeholder="e.g. 2025-03-31"
                  leftIcon="calendar-outline"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.endDate?.message}
                />
              )} />

              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <Text style={styles.switchLabel}>Set as Current Year</Text>
                  <Text style={styles.switchSub}>Marks this as the active academic year</Text>
                </View>
                <Switch value={isCurrent} onValueChange={setIsCurrent} trackColor={{ true: colors.success }} />
              </View>

              <Button
                label={editTarget ? 'Save Changes' : 'Create Academic Year'}
                onPress={handleSubmit(onSubmit)}
                loading={submitting}
                fullWidth
                size="lg"
                style={styles.submitBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Academic Year"
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
  list: { padding: spacing[4], paddingBottom: spacing[8] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  yearName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  currentBadge: { backgroundColor: colors.successLight, borderRadius: radii.full, paddingHorizontal: spacing[2], paddingVertical: 2 },
  currentText: { fontSize: typography.fontSizes.xs, color: colors.success, fontWeight: typography.fontWeights.semibold },
  dateText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: spacing[4], marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  actionText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing[5],
    paddingBottom: spacing[10],
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] },
  modalTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  errorBanner: { backgroundColor: colors.errorLight, borderRadius: 8, padding: spacing[3], marginBottom: spacing[3] },
  errorText: { fontSize: typography.fontSizes.sm, color: colors.error },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[3], marginBottom: spacing[2] },
  switchInfo: { flex: 1, marginRight: spacing[3] },
  switchLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  switchSub: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  submitBtn: { marginTop: spacing[2] },
});
