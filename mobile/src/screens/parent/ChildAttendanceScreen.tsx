import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Loading, EmptyState, StatusBadge, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchChildAttendance } from '../../store/slices/attendanceSlice';
import { ParentStackParamList } from '../../navigation/types';
import { AttendanceRecord } from '../../types/attendance';

type RouteProps = RouteProp<ParentStackParamList, 'ChildAttendance'>;

const STATUS_COLORS = {
  PRESENT: 'success' as const,
  ABSENT: 'error' as const,
  LATE: 'warning' as const,
  HALF_DAY: 'info' as const,
};

export const ChildAttendanceScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { studentId, studentName } = route.params;

  const { myRecords, myPercentage, loading } = useAppSelector((s) => s.attendance);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  useEffect(() => {
    dispatch(fetchChildAttendance({ studentId, params: { month, year } }));
  }, [dispatch, studentId, month, year]);

  const prevMonth = () => { if (month > 1) setMonth((m) => m - 1); };
  const nextMonth = () => { if (month < 12) setMonth((m) => m + 1); };
  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const pctColor = myPercentage >= 75 ? colors.success : myPercentage >= 50 ? colors.warning : colors.error;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.headerSub}>{studentName}</Text>
        </View>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <View style={styles.pctCard}>
        <Text style={[styles.pctValue, { color: pctColor }]}>{myPercentage}%</Text>
        <Text style={styles.pctLabel}>Monthly Attendance</Text>
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
          data={myRecords}
          keyExtractor={(r) => r._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="No records" message="No attendance records for this month" />}
          renderItem={({ item }: { item: AttendanceRecord }) => (
            <View style={styles.row}>
              <Text style={styles.dateText}>
                {new Date(item.date).toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
              <StatusBadge status={STATUS_COLORS[item.status]} label={item.status} />
            </View>
          )}
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
  pctCard: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pctValue: { fontSize: typography.fontSizes['3xl'], fontWeight: typography.fontWeights.bold },
  pctLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 4 },
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
});
