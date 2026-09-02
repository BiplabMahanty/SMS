import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Loading, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchTeachers } from '../../store/slices/teacherSlice';
import {
  fetchClasses, fetchSections, fetchAcademicYears,
  assignClassToTeacher, unassignClassFromTeacher, clearSections,
} from '../../store/slices/classSlice';
import { Teacher } from '../../types/teacher';
import { ClassWithYear } from '../../services/classService';
import { SectionItem } from '../../types/student';

export const AssignTeacherScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const { teachers, loading: teacherLoading } = useAppSelector((s) => s.teachers);
  const { classes, sections, academicYears, submitting } = useAppSelector((s) => s.classes);

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchTeachers({}));
    dispatch(fetchClasses());
    dispatch(fetchAcademicYears());
  }, [dispatch]);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (academicYears.length > 0 && !selectedYear) {
      setSelectedYear(academicYears[0]._id);
    }
  }, [academicYears]);

  // When a class is expanded, fetch its sections
  useEffect(() => {
    if (expandedClass) {
      setSectionsLoading(true);
      dispatch(fetchSections(expandedClass)).finally(() => setSectionsLoading(false));
    } else {
      dispatch(clearSections());
    }
  }, [expandedClass]);

  const getAssignment = (teacher: Teacher, cls: ClassWithYear, sectionId?: string) =>
    teacher.assignedClasses?.find(
      (ac: any) =>
        (ac.class?._id ?? ac.class?.toString()) === cls._id &&
        (ac.academicYear?._id ?? ac.academicYear?.toString()) === selectedYear &&
        (sectionId
          ? (ac.section?._id ?? ac.section?.toString()) === sectionId
          : !ac.section)
    );

  const isAssigned = (teacher: Teacher, cls: ClassWithYear, sectionId?: string) =>
    !!getAssignment(teacher, cls, sectionId);

  const toggleAssign = async (cls: ClassWithYear, sectionId?: string) => {
    if (!selectedTeacher || !selectedYear) return;
    const assigned = isAssigned(selectedTeacher, cls, sectionId);
    const payload = { teacherId: selectedTeacher._id, classId: cls._id, academicYear: selectedYear, sectionId };
    const action = assigned ? unassignClassFromTeacher(payload) : assignClassToTeacher(payload);
    const result = await dispatch(action);
    if ((assigned ? unassignClassFromTeacher : assignClassToTeacher).fulfilled.match(result as any)) {
      dispatch(fetchTeachers({}));
    } else {
      Alert.alert('Error', (result as any).payload ?? 'Something went wrong');
    }
  };

  const handleClassPress = (classId: string) => {
    setExpandedClass((prev) => (prev === classId ? null : classId));
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
                onPress={() => { setSelectedTeacher(t); setExpandedClass(null); }}
              >
                <Ionicons name="person" size={14} color={selectedTeacher?._id === t._id ? colors.white : colors.textSecondary} />
                <Text style={[styles.chipText, selectedTeacher?._id === t._id && styles.chipTextActive]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Classes + Sections Assignment */}
        {selectedTeacher && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Classes for {selectedTeacher.name}</Text>
            {filteredClasses.length === 0 ? (
              <Text style={styles.emptyText}>No classes for this academic year.</Text>
            ) : (
              filteredClasses.map((cls) => {
                const isExpanded = expandedClass === cls._id;
                const wholeClassAssigned = isAssigned(selectedTeacher, cls);

                return (
                  <Card key={cls._id} style={styles.classCard}>
                    {/* Class Row */}
                    <TouchableOpacity style={styles.classRow} onPress={() => handleClassPress(cls._id)} activeOpacity={0.7}>
                      <View style={[styles.iconBox, { backgroundColor: wholeClassAssigned ? colors.successLight : colors.gray100 }]}>
                        <Ionicons name="school" size={18} color={wholeClassAssigned ? colors.success : colors.textSecondary} />
                      </View>
                      <View style={styles.classInfo}>
                        <Text style={styles.className}>{cls.name}</Text>
                        <Text style={styles.yearText}>{(cls.academicYear as any)?.name ?? '—'}</Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textSecondary}
                        style={styles.chevron}
                      />
                    </TouchableOpacity>

                    {/* Expanded: Whole Class + Sections */}
                    {isExpanded && (
                      <View style={styles.sectionList}>
                        {/* Assign whole class (no section) */}
                        <AssignRow
                          label="Entire Class"
                          sublabel="All sections"
                          assigned={wholeClassAssigned}
                          submitting={submitting}
                          onPress={() => toggleAssign(cls)}
                        />

                        {/* Per-section rows */}
                        {sectionsLoading ? (
                          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: spacing[2] }} />
                        ) : sections.length === 0 ? (
                          <Text style={styles.noSectionsText}>No sections in this class</Text>
                        ) : (
                          sections.map((sec: SectionItem) => (
                            <AssignRow
                              key={sec._id}
                              label={`Section ${sec.name}`}
                              assigned={isAssigned(selectedTeacher, cls, sec._id)}
                              submitting={submitting}
                              onPress={() => toggleAssign(cls, sec._id)}
                            />
                          ))
                        )}
                      </View>
                    )}
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

interface AssignRowProps {
  label: string;
  sublabel?: string;
  assigned: boolean;
  submitting: boolean;
  onPress: () => void;
}

const AssignRow: React.FC<AssignRowProps> = ({ label, sublabel, assigned, submitting, onPress }) => (
  <View style={styles.assignRow}>
    <View style={styles.assignRowInfo}>
      <Text style={styles.assignRowLabel}>{label}</Text>
      {sublabel && <Text style={styles.assignRowSublabel}>{sublabel}</Text>}
    </View>
    <TouchableOpacity
      style={[styles.assignBtn, assigned ? styles.assignBtnActive : styles.assignBtnInactive]}
      onPress={onPress}
      disabled={submitting}
    >
      <Ionicons name={assigned ? 'checkmark-circle' : 'add-circle-outline'} size={16} color={assigned ? colors.white : colors.primary} />
      <Text style={[styles.assignBtnText, assigned && styles.assignBtnTextActive]}>
        {assigned ? 'Assigned' : 'Assign'}
      </Text>
    </TouchableOpacity>
  </View>
);

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
  chevron: { marginLeft: spacing[2] },
  sectionList: { marginTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing[2], gap: spacing[2] },
  assignRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[1] },
  assignRowInfo: { flex: 1 },
  assignRowLabel: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  assignRowSublabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  noSectionsText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, fontStyle: 'italic', paddingVertical: spacing[1] },
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
