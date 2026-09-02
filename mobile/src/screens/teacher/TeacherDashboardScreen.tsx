import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Loading } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchMyProfile, fetchMyClasses } from '../../store/slices/teacherSlice';
import { TeacherStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<TeacherStackParamList>;

export const TeacherDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const user = useAppSelector((s) => s.auth.user);
  const { myProfile, myClasses, detailLoading } = useAppSelector((s) => s.teachers);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMyClasses());
  }, [dispatch]);

  if (detailLoading && !myProfile) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}</Text>
            {myProfile?.department && (
              <Text style={styles.dept}>{myProfile.department}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => dispatch(logoutUser())} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderLeftColor: colors.primary }]}>
              <Text style={styles.statValue}>{myClasses.length}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={[styles.statBox, { borderLeftColor: colors.secondary }]}>
              <Text style={styles.statValue}>{myProfile?.subjects.length ?? 0}</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Card style={styles.actionsCard} padding={spacing[4]}>
            <View style={styles.actionsGrid}>
              {[
                { icon: 'people-outline' as const, label: 'My Students', screen: 'MyStudents' as const, color: colors.primary },
                { icon: 'school-outline' as const, label: 'My Classes', screen: 'MyClasses' as const, color: colors.secondary },
                { icon: 'person-outline' as const, label: 'My Profile', screen: 'TeacherProfile' as const, color: colors.success },
                { icon: 'time-outline' as const, label: 'My Timetable', screen: 'MyTimetable' as const, color: colors.primary },
                { icon: 'document-text-outline' as const, label: 'Assignments', screen: 'AssignmentsList' as const, color: colors.warning },
                { icon: 'folder-open-outline' as const, label: 'Materials', screen: 'StudyMaterialsList' as const, color: colors.info },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.actionItem}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.actionIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Assigned Classes with attendance shortcuts */}
          {myClasses.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Assigned Classes</Text>
              {myClasses.map((ac, i) => {
                const today = new Date().toISOString().split('T')[0];
                return (
                  <Card key={i} style={styles.classCard}>
                    <View style={styles.classRow}>
                      <View style={styles.classIcon}>
                        <Ionicons name="school" size={20} color={colors.primary} />
                      </View>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{ac.class.name}{ac.section ? ` — ${ac.section.name}` : ''}</Text>
                        <Text style={styles.classYear}>{ac.academicYear.name}</Text>
                      </View>
                    </View>
                    <View style={styles.attendanceBtns}>
                      <TouchableOpacity
                        style={[styles.attBtn, { backgroundColor: colors.successLight }]}
                        onPress={() => navigation.navigate('MarkAttendance', {
                          classId: ac.class._id,
                          sectionId: ac.section?._id,
                          academicYearId: ac.academicYear._id,
                          className: `${ac.class.name}${ac.section ? ` — ${ac.section.name}` : ''}`,
                          date: today,
                        })}
                      >
                        <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                        <Text style={[styles.attBtnText, { color: colors.success }]}>Mark Today</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.attBtn, { backgroundColor: colors.primaryLight }]}
                        onPress={() => navigation.navigate('AttendanceHistory', {
                          classId: ac.class._id,
                          sectionId: ac.section?._id,
                          academicYearId: ac.academicYear._id,
                          className: `${ac.class.name}${ac.section ? ` — ${ac.section.name}` : ''}`,
                        })}
                      >
                        <Ionicons name="time-outline" size={14} color={colors.primary} />
                        <Text style={[styles.attBtnText, { color: colors.primary }]}>History</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)' },
  name: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.white, marginTop: 2 },
  dept: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  logoutBtn: { padding: spacing[2], backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radii.md },
  body: { padding: spacing[4], marginTop: -spacing[4] },
  statsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[2] },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[4],
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statValue: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  statLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginTop: spacing[4],
    marginBottom: spacing[3],
  },
  actionsCard: { marginBottom: spacing[2] },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  actionItem: { width: '30%', alignItems: 'center', padding: spacing[2] },
  actionIcon: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  actionLabel: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.textPrimary, textAlign: 'center' },
  classCard: { marginBottom: spacing[3], padding: spacing[4] },
  classRow: { flexDirection: 'row', alignItems: 'center' },
  classIcon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  classInfo: { flex: 1 },
  className: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  classYear: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  attendanceBtns: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] },
  attBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radii.full },
  attBtnText: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium },
});
