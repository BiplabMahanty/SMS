import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Loading, EmptyState } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchMyChildren } from '../../store/slices/studentSlice';
import { ParentStackParamList } from '../../navigation/types';
import { Student } from '../../types/student';

type NavProp = NativeStackNavigationProp<ParentStackParamList>;

export const ParentDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const user = useAppSelector((s) => s.auth.user);
  const { myChildren, loading } = useAppSelector((s) => s.students);

  useEffect(() => { dispatch(fetchMyChildren()); }, [dispatch]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={() => dispatch(logoutUser())} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Children</Text>

      {loading ? <Loading /> : (
        <FlatList
          data={myChildren}
          keyExtractor={(s) => s._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState icon="people-outline" title="No children found" message="Contact admin to link your children to your account" />
          }
          renderItem={({ item }: { item: Student }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentMeta}>
                    {item.class.name}{item.section ? ` · ${item.section.name}` : ''} · {item.studentId}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                  onPress={() => navigation.navigate('ChildAttendance', { studentId: item._id, studentName: item.name })}
                >
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.secondaryLight }]}
                  onPress={() => navigation.navigate('ChildTimetable', { studentId: item._id, studentName: item.name })}
                >
                  <Ionicons name="time-outline" size={16} color={colors.secondary} />
                  <Text style={[styles.actionText, { color: colors.secondary }]}>Timetable</Text>
                </TouchableOpacity>
              </View>
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
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)' },
  name: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.white, marginTop: 2 },
  logoutBtn: { padding: spacing[2], backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radii.md },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  list: { padding: spacing[4] },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3] },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  info: { flex: 1 },
  studentName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  studentMeta: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing[2] },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    borderRadius: radii.md,
  },
  actionText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium },
});
