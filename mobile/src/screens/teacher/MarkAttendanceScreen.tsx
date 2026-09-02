import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button, Loading, EmptyState, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchStudents } from '../../store/slices/studentSlice';
import { markAttendance, fetchClassAttendance, clearClassRecords } from '../../store/slices/attendanceSlice';
import { TeacherStackParamList } from '../../navigation/types';
import { AttendanceStatus, ATTENDANCE_STATUSES, STATUS_LABELS, AttendanceMarkRecord } from '../../types/attendance';

type NavProp = NativeStackNavigationProp<TeacherStackParamList>;
type RouteProps = RouteProp<TeacherStackParamList, 'MarkAttendance'>;

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: colors.success,
  ABSENT: colors.error,
  LATE: colors.warning,
  HALF_DAY: colors.info,
};

export const MarkAttendanceScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { classId, sectionId, academicYearId, className, date } = route.params;

  const { students } = useAppSelector((s) => s.students);
  const { classRecords, submitting, loading } = useAppSelector((s) => s.attendance);

  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    dispatch(fetchStudents({ class: classId, section: sectionId, limit: 200 }));
    dispatch(fetchClassAttendance({ class: classId, section: sectionId, academicYear: academicYearId, date }));
    return () => { dispatch(clearClassRecords()); };
  }, [dispatch, classId, sectionId, academicYearId, date]);

  // Pre-fill existing records
  useEffect(() => {
    if (classRecords.length) {
      const map: Record<string, AttendanceStatus> = {};
      classRecords.forEach((r) => { map[r.student._id] = r.status; });
      setStatusMap(map);
    }
  }, [classRecords]);

  // Default all to PRESENT if no existing records
  useEffect(() => {
    if (!loading && students.length && !classRecords.length) {
      const map: Record<string, AttendanceStatus> = {};
      students.forEach((s) => { map[s._id] = 'PRESENT'; });
      setStatusMap(map);
    }
  }, [loading, students, classRecords]);

  const setStatus = useCallback((studentId: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  }, []);

  const handleSubmit = async () => {
    const records: AttendanceMarkRecord[] = students.map((s) => ({
      student: s._id,
      status: statusMap[s._id] ?? 'PRESENT',
    }));

    const result = await dispatch(markAttendance({
      records,
      date,
      academicYear: academicYearId,
      class: classId,
      ...(sectionId && { section: sectionId }),
    }));

    if (markAttendance.fulfilled.match(result)) {
      Alert.alert('Success', 'Attendance marked successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.payload as string);
    }
  };

  if (loading) return <Loading fullScreen />;

  const presentCount = Object.values(statusMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(statusMap).filter((s) => s === 'ABSENT').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerSub}>{className} · {date}</Text>
        </View>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.success }]}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.error }]}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.textPrimary }]}>{students.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(s) => s._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No students" message="No students found in this class" />}
        renderItem={({ item }) => {
          const current = statusMap[item._id] ?? 'PRESENT';
          return (
            <View style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentId}>{item.rollNumber ?? item.studentId}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow}>
                {ATTENDANCE_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusBtn,
                      { borderColor: STATUS_COLORS[status] },
                      current === status && { backgroundColor: STATUS_COLORS[status] },
                    ]}
                    onPress={() => setStatus(item._id, status)}
                  >
                    <Text style={[styles.statusBtnText, { color: current === status ? colors.white : STATUS_COLORS[status] }]}>
                      {STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <Button label="Submit Attendance" onPress={handleSubmit} loading={submitting} />
      </View>
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
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  headerSub: { fontSize: typography.fontSizes.sm, color: colors.primaryLight, marginTop: 2 },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryCount: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold },
  summaryLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  list: { padding: spacing[3] },
  studentRow: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing[3],
    marginBottom: spacing[2],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  studentInfo: { marginBottom: spacing[2] },
  studentName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  studentId: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  statusRow: { flexDirection: 'row' },
  statusBtn: {
    borderWidth: 1.5,
    borderRadius: radii.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    marginRight: spacing[2],
  },
  statusBtnText: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium },
  footer: { padding: spacing[4], backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
