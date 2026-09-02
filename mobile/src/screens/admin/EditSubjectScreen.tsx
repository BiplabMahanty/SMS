import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Input, Button, Card, Loading, Dropdown, LogoutButton } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchSubject, updateSubject } from '../../store/slices/subjectSlice';
import { AdminStackParamList } from '../../navigation/types';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';

type RoutePropType = RouteProp<AdminStackParamList, 'EditSubject'>;

const schema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  description: z.string().optional(),
  class: z.string().min(1, 'Class is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  teacher: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const EditSubjectScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { subjectId } = route.params;

  const { selectedSubject: subject, submitting, error } = useAppSelector((s) => s.subjects);
  const [isElective, setIsElective] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [academicYears, setAcademicYears] = useState<{ label: string; value: string }[]>([]);
  const [classes, setClasses] = useState<{ label: string; value: string }[]>([]);
  const [teachers, setTeachers] = useState<{ label: string; value: string }[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', code: '', description: '', class: '', academicYear: '', teacher: '' },
  });

  useEffect(() => {
    dispatch(fetchSubject(subjectId));

    setLoadingYears(true);
    classService.getAcademicYears()
      .then(({ data }) => setAcademicYears(data.data.map((y) => ({ label: y.name, value: y._id }))))
      .finally(() => setLoadingYears(false));

    setLoadingClasses(true);
    classService.getClasses()
      .then(({ data }) => setClasses(data.data.map((c) => ({ label: c.name, value: c._id }))))
      .finally(() => setLoadingClasses(false));

    setLoadingTeachers(true);
    teacherService.getTeachers()
      .then(({ data }) => setTeachers(data.data.map((t) => ({ label: t.name, value: t._id }))))
      .finally(() => setLoadingTeachers(false));
  }, [subjectId]);

  useEffect(() => {
    if (subject && subject._id === subjectId && !loaded) {
      reset({
        name: subject.name,
        code: subject.code,
        description: subject.description ?? '',
        class: (subject.class as any)?._id ?? (subject.class as unknown as string),
        academicYear: (subject.academicYear as any)?._id ?? (subject.academicYear as unknown as string),
        teacher: (subject.teacher as any)?._id ?? '',
      });
      setIsElective(subject.isElective);
      setLoaded(true);
    }
  }, [subject]);

  const onSubmit = async (values: FormValues) => {
    const result = await dispatch(updateSubject({
      id: subjectId,
      data: { ...values, isElective, teacher: values.teacher || undefined },
    }));
    if (updateSubject.fulfilled.match(result)) navigation.goBack();
  };

  if (!loaded) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Subject</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Details</Text>
          <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Subject Name *" placeholder="e.g. Mathematics" leftIcon="book-outline" onChangeText={onChange} onBlur={onBlur} value={value} error={errors.name?.message} />
          )} />
          <Controller control={control} name="code" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Subject Code *" placeholder="e.g. MATH101" leftIcon="code-outline" autoCapitalize="characters" onChangeText={onChange} onBlur={onBlur} value={value} error={errors.code?.message} />
          )} />
          <Controller control={control} name="description" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Description" placeholder="Optional description" leftIcon="document-text-outline" onChangeText={onChange} onBlur={onBlur} value={value} />
          )} />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Elective Subject</Text>
            <Switch value={isElective} onValueChange={setIsElective} trackColor={{ true: colors.primary }} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Assignment</Text>

          <Controller control={control} name="academicYear" render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Academic Year *"
              placeholder="Select academic year"
              items={academicYears}
              value={value}
              onChange={onChange}
              loading={loadingYears}
              error={errors.academicYear?.message}
            />
          )} />

          <Controller control={control} name="class" render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Class *"
              placeholder="Select class"
              items={classes}
              value={value}
              onChange={onChange}
              loading={loadingClasses}
              error={errors.class?.message}
            />
          )} />

          <Controller control={control} name="teacher" render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Teacher (optional)"
              placeholder="Select teacher"
              items={teachers}
              value={value ?? ''}
              onChange={onChange}
              loading={loadingTeachers}
            />
          )} />
        </Card>

        <Button label="Save Changes" onPress={handleSubmit(onSubmit)} loading={submitting} fullWidth size="lg" style={styles.submitBtn} />
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
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  errorBanner: { backgroundColor: colors.errorLight, borderRadius: 8, padding: spacing[3], marginBottom: spacing[4] },
  errorText: { fontSize: typography.fontSizes.sm, color: colors.error },
  section: { marginBottom: spacing[4], padding: spacing[4] },
  sectionTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing[3] },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[2] },
  switchLabel: { fontSize: typography.fontSizes.base, color: colors.textPrimary },
  submitBtn: { marginTop: spacing[2] },
});
