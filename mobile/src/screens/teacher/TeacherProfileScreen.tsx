import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Loading, ErrorState, StatusBadge, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyProfile } from '../../store/slices/teacherSlice';

export const TeacherProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { myProfile: teacher, detailLoading, error } = useAppSelector((s) => s.teachers);

  useEffect(() => { dispatch(fetchMyProfile()); }, [dispatch]);

  if (detailLoading && !teacher) return <Loading fullScreen />;
  if (error && !teacher) return <ErrorState message={error} onRetry={() => dispatch(fetchMyProfile())} />;
  if (!teacher) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileBanner}>
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
          <Text style={styles.sectionTitle}>Contact</Text>
          {[
            { icon: 'mail-outline' as const, label: 'Email', value: teacher.email },
            { icon: 'call-outline' as const, label: 'Phone', value: teacher.phone },
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Ionicons name={row.icon} size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value || '—'}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Professional</Text>
          {[
            { icon: 'business-outline' as const, label: 'Department', value: teacher.department },
            { icon: 'calendar-outline' as const, label: 'Joining Date', value: teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : undefined },
          ].map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Ionicons name={row.icon} size={16} color={colors.textSecondary} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value || '—'}</Text>
              </View>
            </View>
          ))}
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
      </ScrollView>
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
  profileBanner: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: spacing[6],
    paddingTop: spacing[2],
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
  avatarImage: { width: 72, height: 72, borderRadius: 36, marginBottom: spacing[3] },
  avatarText: { fontSize: typography.fontSizes['3xl'], fontWeight: typography.fontWeights.bold, color: colors.white },
  name: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.white, marginBottom: spacing[1] },
  teacherId: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginBottom: spacing[2] },
  section: { margin: spacing[4], marginBottom: 0, padding: spacing[4] },
  sectionTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing[3] },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing[3] },
  infoIcon: { marginRight: spacing[3], marginTop: 2 },
  infoLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  infoValue: { fontSize: typography.fontSizes.sm, color: colors.textPrimary, fontWeight: typography.fontWeights.medium, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: { backgroundColor: colors.primaryLight, borderRadius: radii.full, paddingHorizontal: spacing[3], paddingVertical: spacing[1] },
  tagText: { fontSize: typography.fontSizes.sm, color: colors.primary, fontWeight: typography.fontWeights.medium },
});
