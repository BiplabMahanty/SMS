import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Loading, EmptyState, StatusBadge, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchAttendanceHistory } from '../../store/slices/attendanceSlice';
import { TeacherStackParamList } from '../../navigation/types';
import { AttendanceRecord } from '../../types/attendance';

type RouteProps = RouteProp<TeacherStackParamList, 'AttendanceHistory'>;

const STATUS_COLORS = {
  PRESENT: 'success' as const,
  ABSENT: 'error' as const,
  LATE: 'warning' as const,
  HALF_DAY: 'info' as const,
};

export const AttendanceHistoryScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { classId, sectionId, academicYearId, className } = route.params;

  const { historyRecords, loading, pagination } = useAppSelector((s) => s.attendance);
  const [page, setPage] = useState(1);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  useEffect(() => {
    dispatch(fetchAttendanceHistory({ class: classId, section: sectionId, academicYear: academicYearId, month, year, page, limit: 50 }));
  }, [dispatch, classId, sectionId, academicYearId, month, year, page]);

  const prevMonth = () => {
    if (month === 1) return;
    setMonth((m) => m - 1);
    setPage(1);
  };
  const nextMonth = () => {
    if (month === 12) return;
    setMonth((m) => m + 1);
    setPage(1);
  };

  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <View style={styles.filterRow}>
        <Text style={styles.className}>{className}</Text>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} disabled={month === 1}>
            <Ionicons name="chevron-back" size={20} color={month === 1 ? colors.gray300 : colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity onPress={nextMonth} disabled={month === 12}>
            <Ionicons name="chevron-forward" size={20} color={month === 12 ? colors.gray300 : colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? <Loading /> : (
        <FlatList
          data={historyRecords}
          keyExtractor={(r) => r._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="No records" message="No attendance records for this period" />}
          renderItem={({ item }: { item: AttendanceRecord }) => (
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.studentName}>{item.student.name}</Text>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <StatusBadge status={STATUS_COLORS[item.status]} label={item.status} />
            </View>
          )}
          ListFooterComponent={
            pagination && pagination.totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <TouchableOpacity onPress={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <Ionicons name="chevron-back" size={20} color={page === 1 ? colors.gray300 : colors.primary} />
                </TouchableOpacity>
                <Text style={styles.pageText}>{page} / {pagination.totalPages}</Text>
                <TouchableOpacity onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
                  <Ionicons name="chevron-forward" size={20} color={page === pagination.totalPages ? colors.gray300 : colors.primary} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
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
  headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  className: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  monthLabel: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, fontWeight: typography.fontWeights.medium },
  list: { padding: spacing[3] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[3],
    marginBottom: spacing[2],
    elevation: 1,
  },
  rowLeft: { flex: 1 },
  studentName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  dateText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[4], paddingVertical: spacing[4] },
  pageText: { fontSize: typography.fontSizes.sm, color: colors.textPrimary },
});
