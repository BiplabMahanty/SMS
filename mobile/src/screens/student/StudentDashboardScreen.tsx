import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppStore';
import { logoutUser } from '../../store/slices/authSlice';
import { StudentStackParamList } from '../../navigation/types';

type NavProp = NativeStackNavigationProp<StudentStackParamList>;

export const StudentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.role}>Student Dashboard</Text>
          <Text style={styles.name}>Welcome, {user?.name}</Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MyAttendance')}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>My Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MyTimetable')}>
            <Ionicons name="time-outline" size={24} color={colors.secondary} />
            <Text style={styles.actionLabel}>My Timetable</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MyAssignments')}>
            <Ionicons name="document-text-outline" size={24} color={colors.warning} />
            <Text style={styles.actionLabel}>Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('StudyMaterials')}>
            <Ionicons name="folder-open-outline" size={24} color={colors.info} />
            <Text style={styles.actionLabel}>Materials</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logoutUser())}>
        <Ionicons name="log-out-outline" size={20} color={colors.white} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  role: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.white },
  name: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[4], justifyContent: 'center' },
  actionBtn: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing[4], width: 120, elevation: 2 },
  actionLabel: { marginTop: spacing[2], fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textPrimary, textAlign: 'center' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    marginHorizontal: spacing[5],
    marginBottom: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: radii.lg,
    gap: spacing[2],
  },
  logoutText: { color: colors.white, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
});
