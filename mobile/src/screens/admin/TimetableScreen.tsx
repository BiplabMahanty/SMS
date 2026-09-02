import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Loading, ErrorState, ConfirmModal, LogoutButton } from '../../components/ui';
import { TimetableView } from '../../components/TimetableView';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchTimetable, deleteTimetableEntry } from '../../store/slices/timetableSlice';
import { AdminStackParamList } from '../../navigation/types';
import { TimetableEntry } from '../../types/timetable';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

export const TimetableScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { entries, loading, error } = useAppSelector((s) => s.timetable);
  const [deleteTarget, setDeleteTarget] = useState<TimetableEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => { dispatch(fetchTimetable({})); };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await dispatch(deleteTimetableEntry(deleteTarget._id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (loading && entries.length === 0) return <Loading fullScreen />;
  if (error && entries.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timetable</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateTimetable')}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <TimetableView
        entries={entries}
        loading={loading}
        onRefresh={load}
        showTeacher
        showClass
        onDelete={(entry) => setDeleteTarget(entry)}
        onAdd={() => navigation.navigate('CreateTimetable')}
      />

      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Entry"
        message={`Remove ${deleteTarget?.subject?.name ?? 'this entry'} on ${deleteTarget?.dayOfWeek}?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
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
});
