import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Loading, EmptyState, StatusBadge, Card, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyAttendance, fetchMyAttendanceSummary } from '../../store/slices/attendanceSlice';
import { AttendanceRecord } from '../../types/attendance';

const STATUS_COLORS = {
  PRESENT: 'success' as const,
  ABSENT: 'error' as const,
  LATE: 'warning' as const,
  HALF_DAY: 'info' as const,
};

export const MyAttendanceScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { myRecords, myPercentage, summary, loading } = useAppSelector((s) => s.attendance);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());
  const [tab, setTab] = useState<'monthly' | 'summary'>('monthly');

  useEffect(() => {
    dispatch(fetchMyAttendanceSummary());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMyAttendance({ month, year }));
  }, [dispatch, month, year]);

  const prevMonth = () => { if (month > 1) { setMonth((m) => m - 1); } };
  const nextMonth = () => { if (month < 12) { setMonth((m) => m + 1); } };
  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const pct = summary?.overall.percentage ?? myPercentage;
  const pctColor = pct >= 75 ? colors.success : pct >= 50 ? colors.warning : colors.error;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Attendance</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      {/* Overall percentage */}
      <View style={styles.pctCard}>
        <Text style={[styles.pctValue, { color: pctColor }]}>{pct}%</Text>
        <Text style={styles.pctLabel}>Overall Attendance</Text>
        {summary && (
          <Text style={styles.pctSub}>{summary.overall.present} / {summary.overall.total} days present</Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['monthly', 'summary'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'monthly' ? 'Monthly' : 'Subject-wise'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <Loading /> : tab === 'monthly' ? (
        <>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} disabled={month === 1}>
              <Ionicons name="chevron-back" size={20} color={month === 1 ? colors.gray300 : colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={nextMonth} disabled={month === 12}>
              <Ionicons name="chevron-forward" size={20} color={month === 12 ? colors.gray300 : colors.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={myRecords}
            keyExtractor={(r) => r._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState icon="calendar-outline" title="No records" message="No attendance records for this month" />}
            renderItem={({ item }: { item: AttendanceRecord }) => (
              <View style={styles.row}>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                <StatusBadge status={STATUS_COLORS[item.status]} label={item.status} />
              </View>
            )}
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {!summary?.subjectWise.length ? (
            <EmptyState icon="book-outline" title="No subject data" message="No subject-wise attendance available" />
          ) : summary.subjectWise.map((sw, i) => {
            const p = sw.percentage;
            const c = p >= 75 ? colors.success : p >= 50 ? colors.warning : colors.error;
            return (
              <Card key={i} style={styles.subjectCard} padding={spacing[4]}>
                <View style={styles.subjectRow}>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{sw.subject.name}</Text>
                    <Text style={styles.subjectCode}>{sw.subject.code}</Text>
                  </View>
                  <View style={styles.subjectStats}>
                    <Text style={[styles.subjectPct, { color: c }]}>{p}%</Text>
                    <Text style={styles.subjectCount}>{sw.present}/{sw.total}</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${p}%` as any, backgroundColor: c }]} />
                </View>
              </Card>
            );
          })}
        </ScrollView>
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
  pctCard: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pctValue: { fontSize: typography.fontSizes['4xl'], fontWeight: typography.fontWeights.bold },
  pctLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: spacing[1] },
  pctSub: { fontSize: typography.fontSizes.xs, color: colors.gray400, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing[3], alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: typography.fontWeights.semibold },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface },
  monthLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
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
  dateText: { fontSize: typography.fontSizes.base, color: colors.textPrimary },
  subjectCard: { marginBottom: spacing[3] },
  subjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  subjectCode: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  subjectStats: { alignItems: 'flex-end' },
  subjectPct: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold },
  subjectCount: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  progressBar: { height: 6, backgroundColor: colors.gray100, borderRadius: radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radii.full },
});
