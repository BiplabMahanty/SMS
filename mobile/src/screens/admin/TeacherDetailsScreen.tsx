import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card, Loading, ErrorState, StatusBadge, ConfirmModal, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchTeacher, deleteTeacher } from '../../store/slices/teacherSlice';
import { AdminStackParamList } from '../../navigation/types';
import { useState } from 'react';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;
type RoutePropType = RouteProp<AdminStackParamList, 'TeacherDetails'>;

const InfoRow: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; value?: string }> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.infoIcon} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

export const TeacherDetailsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { teacherId } = route.params;

  const { selectedTeacher: teacher, detailLoading, error, submitting } = useAppSelector((s) => s.teachers);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchTeacher(teacherId));
  }, [teacherId]);

  const handleDelete = async () => {
    await dispatch(deleteTeacher(teacherId));
    navigation.goBack();
  };

  if (detailLoading) return <Loading fullScreen />;
  if (error || !teacher) return <ErrorState message={error || 'Teacher not found'} onRetry={() => dispatch(fetchTeacher(teacherId))} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Details</Text>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditTeacher', { teacherId })}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {teacher.profileImage ? (
            <Image source={{ uri: teacher.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{teacher.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{teacher.name}</Text>
          <Text style={styles.teacherId}>{teacher.teacherId}</Text>
          <StatusBadge status={teacher.status} />
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow icon="mail-outline" label="Email" value={teacher.email} />
          <InfoRow icon="call-outline" label="Phone" value={teacher.phone} />
          <InfoRow icon="business-outline" label="Department" value={teacher.department} />
          <InfoRow icon="calendar-outline" label="Joining Date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : undefined} />
        </Card>

        {teacher.subjects.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <View style={styles.tagRow}>
              {teacher.subjects.map((s) => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {teacher.assignedClasses.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Classes</Text>
            {teacher.assignedClasses.map((ac, i) => (
              <View key={i} style={styles.classRow}>
                <Ionicons name="school-outline" size={16} color={colors.primary} />
                <Text style={styles.classText}>
                  {ac.class.name}{ac.section ? ` — ${ac.section.name}` : ''} ({ac.academicYear.name})
                </Text>
              </View>
            ))}
          </Card>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDelete(true)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteBtnText}>Delete Teacher</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${teacher.name}?`}
        confirmLabel="Delete"
        variant="danger"
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
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  backBtn: { padding: spacing[1], marginRight: spacing[3] },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.md,
    padding: spacing[2],
  },
  scroll: { paddingBottom: spacing[10] },
  profileCard: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: spacing[6],
    paddingTop: spacing[2],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  avatarImage: { width: 72, height: 72, borderRadius: 36, marginBottom: spacing[3] },
  avatarText: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
  },
  name: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    marginBottom: spacing[1],
  },
  teacherId: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing[2],
  },
  section: { margin: spacing[4], marginBottom: 0, padding: spacing[4] },
  sectionTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing[3] },
  infoIcon: { marginRight: spacing[3], marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  infoValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, fontWeight: typography.fontWeights.medium, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  tagText: { fontSize: typography.fontSizes.sm, color: colors.primary, fontWeight: typography.fontWeights.medium },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  classText: { fontSize: typography.fontSizes.sm, color: colors.textPrimary },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    margin: spacing[4],
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteBtnText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.error,
  },
});
