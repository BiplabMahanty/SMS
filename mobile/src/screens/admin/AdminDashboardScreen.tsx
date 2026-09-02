import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchStudents } from '../../store/slices/studentSlice';
import { fetchTeachers } from '../../store/slices/teacherSlice';
import { fetchClasses } from '../../store/slices/classSlice';
import { AdminStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, bgColor, onPress }) => (
  <TouchableOpacity
    style={[styles.statCard, { borderLeftColor: color }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.75 : 1}
  >
    <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </TouchableOpacity>
);

interface QuickLinkProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}

const QuickLink: React.FC<QuickLinkProps> = ({ icon, label, onPress, color }) => (
  <TouchableOpacity style={styles.quickLink} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.quickLinkIcon, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.quickLinkLabel}>{label}</Text>
  </TouchableOpacity>
);

export const AdminDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const user = useAppSelector((s) => s.auth.user);
  const { pagination } = useAppSelector((s) => s.students);
  const { pagination: teacherPagination } = useAppSelector((s) => s.teachers);
  const { classes } = useAppSelector((s) => s.classes);

  useEffect(() => {
    dispatch(fetchStudents({ limit: 1 }));
    dispatch(fetchTeachers({ limit: 1 }));
    dispatch(fetchClasses());
  }, [dispatch]);

  const totalStudents = pagination?.total ?? 0;
  const totalTeachers = teacherPagination?.total ?? 0;
  const totalClasses = classes.length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => dispatch(logoutUser())}
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Stats */}
          <TouchableOpacity
              onPress={() => dispatch(logoutUser())}
               activeOpacity={0.7}
            >
            <Text style={styles.sectionTitle}>Overview</Text>
          </TouchableOpacity>
          <View style={styles.statsGrid}>
            <StatCard
              icon="people"
              label="Total Students"
              value={totalStudents}
              color={colors.primary}
              bgColor={colors.primaryLight}
              onPress={() => navigation.navigate('StudentsList')}
            />
            <StatCard
              icon="person"
              label="Teachers"
              value={totalTeachers}
              color={colors.secondary}
              bgColor={colors.secondaryLight}
              onPress={() => navigation.navigate('TeachersList')}
            />
            <StatCard
              icon="people-circle"
              label="Parents"
              value="—"
              color={colors.success}
              bgColor={colors.successLight}
            />
            <StatCard
              icon="library"
              label="Classes"
              value={totalClasses}
              color={colors.warning}
              bgColor={colors.warningLight}
              onPress={() => navigation.navigate('ClassesList')}
            />
          </View>

          {/* Quick Links */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Card style={styles.quickLinksCard} padding={spacing[4]}>
            <View style={styles.quickLinksGrid}>
              <QuickLink
                icon="person-add"
                label="Add Student"
                onPress={() => navigation.navigate('AddStudent')}
                color={colors.primary}
              />
              <QuickLink
                icon="people"
                label="Students"
                onPress={() => navigation.navigate('StudentsList')}
                color={colors.secondary}
              />
              <QuickLink
                icon="person-add-outline"
                label="Add Teacher"
                onPress={() => navigation.navigate('AddTeacher')}
                color={colors.success}
              />
              <QuickLink
                icon="person"
                label="Teachers"
                onPress={() => navigation.navigate('TeachersList')}
                color={colors.warning}
              />
              <QuickLink
                icon="school-outline"
                label="Classes"
                onPress={() => navigation.navigate('ClassesList')}
                color={colors.info}
              />
              <QuickLink
                icon="calendar-outline"
                label="Academic Years"
                onPress={() => navigation.navigate('AcademicYears')}
                color={colors.info}
              />
              <QuickLink
                icon="book-outline"
                label="Subjects"
                onPress={() => navigation.navigate('SubjectsList')}
                color={colors.secondary}
              />
              <QuickLink
                icon="person-circle-outline"
                label="Assign Teacher"
                onPress={() => navigation.navigate('AssignTeacher')}
                color={colors.success}
              />
              <QuickLink
                icon="bar-chart"
                label="Attendance"
                onPress={() => navigation.navigate('AttendanceClassPicker')}
                color={colors.warning}
              />
              <QuickLink
                icon="time-outline"
                label="Timetable"
                onPress={() => navigation.navigate('Timetable')}
                color={colors.primary}
              />
            </View>
          </Card>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: typography.fontSizes.sm,
    color: colors.primaryLight,
  },
  name: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginTop: 2,
  },
  logoutBtn: {
    padding: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.md,
  },
  body: {
    padding: spacing[4],
    marginTop: -spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
    marginTop: spacing[4],
  },
  statsGrid: {
    gap: spacing[3],
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  statInfo: { flex: 1 },
  statValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickLinksCard: { marginBottom: spacing[4] },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  quickLink: {
    width: '45%',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radii.md,
    backgroundColor: colors.gray50,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickLinkLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
