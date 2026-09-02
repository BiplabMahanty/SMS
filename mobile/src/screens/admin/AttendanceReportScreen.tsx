import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Loading, EmptyState, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchClassReport } from '../../store/slices/attendanceSlice';
import { AdminStackParamList } from '../../navigation/types';
import { ClassAttendanceSummaryItem } from '../../types/attendance';

type RouteProps = RouteProp<AdminStackParamList, 'AttendanceReport'>;

export const AttendanceReportScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { classId, sectionId, academicYearId, className } = route.params;

  const { classReport, loading } = useAppSelector((s) => s.attendance);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  useEffect(() => {
    dispatch(fetchClassReport({ class: classId, section: sectionId, academicYear: academicYearId, month, year }));
  }, [dispatch, classId, sectionId, academicYearId, month, year]);

  const prevMonth = () => { if (month > 1) setMonth((m) => m - 1); };
  const nextMonth = () => { if (month < 12) setMonth((m) => m + 1); };
  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Attendance Report</Text>
          <Text style={styles.headerSub}>{className}</Text>
        </View>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} disabled={month === 1}>
          <Ionicons name="chevron-back" size={20} color={month === 1 ? colors.gray300 : colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} disabled={month === 12}>
          <Ionicons name="chevron-forward" size={20} color={month === 12 ? colors.gray300 : colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? <Loading /> : (
        <FlatList
          data={classReport}
          keyExtractor={(item) => item.student._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="bar-chart-outline" title="No data" message="No attendance data for this period" />}
          renderItem={({ item }: { item: ClassAttendanceSummaryItem }) => {
            const pctColor = item.percentage >= 75 ? colors.success : item.percentage >= 50 ? colors.warning : colors.error;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.student.name}</Text>
                    <Text style={styles.studentId}>{item.student.rollNumber ?? item.student.studentId}</Text>
                  </View>
                  <Text style={[styles.pct, { color: pctColor }]}>{item.percentage}%</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: colors.success }]}>{item.present}</Text>
                    <Text style={styles.statLbl}>Present</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: colors.error }]}>{item.absent}</Text>
                    <Text style={styles.statLbl}>Absent</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: colors.warning }]}>{item.late}</Text>
                    <Text style={styles.statLbl}>Late</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={[styles.statVal, { color: colors.info }]}>{item.halfDay}</Text>
                    <Text style={styles.statLbl}>Half Day</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.percentage}%` as any, backgroundColor: pctColor }]} />
                </View>
              </View>
            );
          }}
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
  headerSub: { fontSize: typography.fontSizes.sm, color: colors.primaryLight, marginTop: 2 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  list: { padding: spacing[3] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  studentInfo: { flex: 1 },
  studentName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  studentId: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  pct: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] },
  stat: { alignItems: 'center' },
  statVal: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold },
  statLbl: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  progressBar: { height: 6, backgroundColor: colors.gray100, borderRadius: radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radii.full },
});
