import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Loading, ErrorState, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchTeachers } from '../../store/slices/teacherSlice';
import { fetchClasses, fetchAcademicYears, assignClassToTeacher, unassignClassFromTeacher } from '../../store/slices/classSlice';
import { Teacher } from '../../types/teacher';
import { ClassWithYear } from '../../services/classService';

export const AssignTeacherScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const { teachers, loading: teacherLoading } = useAppSelector((s) => s.teachers);
  const { classes, academicYears, submitting } = useAppSelector((s) => s.classes);

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');

  const load = useCallback(() => {
    dispatch(fetchTeachers({}));
    dispatch(fetchClasses());
    dispatch(fetchAcademicYears());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (academicYears.length > 0 && !selectedYear) {
      setSelectedYear(academicYears[0]._id);
    }
  }, [academicYears]);

  const isAssigned = (teacher: Teacher, cls: ClassWithYear) =>
    teacher.assignedClasses?.some(
      (ac: any) =>
        (ac.class?._id ?? ac.class?.toString()) === cls._id &&
        (ac.academicYear?._id ?? ac.academicYear?.toString()) === selectedYear
    ) ?? false;

  const toggleAssign = async (cls: ClassWithYear) => {
    if (!selectedTeacher || !selectedYear) return;
    const assigned = isAssigned(selectedTeacher, cls);
    const action = assigned
      ? unassignClassFromTeacher({ teacherId: selectedTeacher._id, classId: cls._id, academicYear: selectedYear })
      : assignClassToTeacher({ teacherId: selectedTeacher._id, classId: cls._id, academicYear: selectedYear });

    const result = await dispatch(action);
    if ((assigned ? unassignClassFromTeacher : assignClassToTeacher).fulfilled.match(result as any)) {
      // Refresh teacher list to get updated assignedClasses
      dispatch(fetchTeachers({}));
    } else {
      Alert.alert('Error', (result as any).payload ?? 'Something went wrong');
    }
  };

  if (teacherLoading && teachers.length === 0) return <Loading fullScreen />;

  const filteredClasses = selectedYear
    ? classes.filter((c) => (c.academicYear as any)?._id === selectedYear || c.academicYear._id === selectedYear)
    : classes;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Classes to Teacher</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Academic Year Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Academic Year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {academicYears.map((y) => (
              <TouchableOpacity
                key={y._id}
                style={[styles.chip, selectedYear === y._id && styles.chipActive]}
                onPress={() => setSelectedYear(y._id)}
              >
                <Text style={[styles.chipText, selectedYear === y._id && styles.chipTextActive]}>{y.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Teacher Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Teacher</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {teachers.map((t) => (
              <TouchableOpacity
                key={t._id}
                style={[styles.teacherChip, selectedTeacher?._id === t._id && styles.chipActive]}
                onPress={() => setSelectedTeacher(t)}
              >
                <Ionicons
                  name="person"
                  size={14}
                  color={selectedTeacher?._id === t._id ? colors.white : colors.textSecondary}
                />
                <Text style={[styles.chipText, selectedTeacher?._id === t._id && styles.chipTextActive]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Classes Assignment */}
        {selectedTeacher && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Classes for {selectedTeacher.name}
            </Text>
            {filteredClasses.length === 0 ? (
              <Text style={styles.emptyText}>No classes for this academic year.</Text>
            ) : (
              filteredClasses.map((cls) => {
                const assigned = isAssigned(selectedTeacher, cls);
                return (
                  <Card key={cls._id} style={styles.classCard}>
                    <View style={styles.classRow}>
                      <View style={[styles.iconBox, { backgroundColor: assigned ? colors.successLight : colors.gray100 }]}>
                        <Ionicons name="school" size={18} color={assigned ? colors.success : colors.textSecondary} />
                      </View>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{cls.name}</Text>
                        <Text style={styles.yearText}>{(cls.academicYear as any)?.name ?? '—'}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.assignBtn, assigned ? styles.assignBtnActive : styles.assignBtnInactive]}
                        onPress={() => toggleAssign(cls)}
                        disabled={submitting}
                      >
                        <Ionicons
                          name={assigned ? 'checkmark-circle' : 'add-circle-outline'}
                          size={16}
                          color={assigned ? colors.white : colors.primary}
                        />
                        <Text style={[styles.assignBtnText, assigned && styles.assignBtnTextActive]}>
                          {assigned ? 'Assigned' : 'Assign'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {!selectedTeacher && (
          <View style={styles.placeholder}>
            <Ionicons name="person-outline" size={48} color={colors.gray300} />
            <Text style={styles.placeholderText}>Select a teacher above to manage their class assignments</Text>
          </View>
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
  headerTitle: { flex: 1, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, color: colors.white },
  section: { paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  sectionLabel: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.textSecondary, marginBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { gap: spacing[2], paddingBottom: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.gray50,
  },
  teacherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.gray50,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: typography.fontWeights.semibold },
  classCard: { marginBottom: spacing[2], padding: spacing[3] },
  classRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  classInfo: { flex: 1 },
  className: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  yearText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    borderWidth: 1,
  },
  assignBtnInactive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  assignBtnActive: { borderColor: colors.success, backgroundColor: colors.success },
  assignBtnText: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.semibold, color: colors.primary },
  assignBtnTextActive: { color: colors.white },
  emptyText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontStyle: 'italic' },
  placeholder: { alignItems: 'center', paddingTop: spacing[12], paddingHorizontal: spacing[8] },
  placeholderText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing[3] },
});
