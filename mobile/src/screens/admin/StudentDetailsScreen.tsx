import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Loading, ErrorState, StatusBadge, ConfirmModal, Card, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchStudent, deleteStudent, clearSelectedStudent } from '../../store/slices/studentSlice';
import { AdminStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;
type RouteType = RouteProp<AdminStackParamList, 'StudentDetails'>;

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

export const StudentDetailsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { studentId } = route.params;

  const { selectedStudent: student, detailLoading, submitting, error } = useAppSelector((s) => s.students);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchStudent(studentId));
    return () => { dispatch(clearSelectedStudent()); };
  }, [studentId, dispatch]);

  const handleDelete = async () => {
    await dispatch(deleteStudent(studentId));
    setShowDelete(false);
    navigation.goBack();
  };

  if (detailLoading) return <Loading fullScreen message="Loading student..." />;
  if (error || !student) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState message={error ?? 'Student not found'} onRetry={() => dispatch(fetchStudent(studentId))} />
      </SafeAreaView>
    );
  }

  const dob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString()
    : undefined;
  const admission = new Date(student.admissionDate).toLocaleDateString();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditStudent', { studentId })}
            style={styles.headerBtn}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDelete(true)} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
          <LogoutButton />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <Card style={styles.profileCard}>
          {student.profileImage ? (
            <Image source={{ uri: student.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentId}>{student.studentId}</Text>
          <StatusBadge status={student.status} />
        </Card>

        {/* Personal Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow label="Email" value={student.email} />
          <InfoRow label="Phone" value={student.phone} />
          <InfoRow label="Date of Birth" value={dob} />
          <InfoRow label="Gender" value={student.gender} />
        </Card>

        {/* Academic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          <InfoRow label="Academic Year" value={student.academicYear?.name} />
          <InfoRow label="Class" value={student.class?.name} />
          <InfoRow label="Section" value={student.section?.name} />
          <InfoRow label="Roll Number" value={student.rollNumber} />
          <InfoRow label="Admission Date" value={admission} />
        </Card>

        {/* Address */}
        {student.address && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <InfoRow label="Street" value={student.address.street} />
            <InfoRow label="City" value={student.address.city} />
            <InfoRow label="State" value={student.address.state} />
            <InfoRow label="Zip Code" value={student.address.zipCode} />
            <InfoRow label="Country" value={student.address.country} />
          </Card>
        )}

        {/* Parent */}
        {student.parent && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Parent / Guardian</Text>
            <InfoRow label="Name" value={student.parent.name} />
            <InfoRow label="Email" value={student.parent.email} />
            <InfoRow label="Phone" value={student.parent.phone} />
          </Card>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${student.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={submitting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing[1], marginRight: spacing[2] },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  headerActions: { flexDirection: 'row', gap: spacing[1] },
  headerBtn: { padding: spacing[2] },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  profileCard: {
    alignItems: 'center',
    padding: spacing[6],
    marginBottom: spacing[4],
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  avatarImage: { width: 80, height: 80, borderRadius: radii.full, marginBottom: spacing[3] },
  avatarText: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  studentName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  studentId: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  section: { marginBottom: spacing[4], padding: spacing[4] },
  sectionTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.medium,
    flex: 2,
    textAlign: 'right',
  },
});
