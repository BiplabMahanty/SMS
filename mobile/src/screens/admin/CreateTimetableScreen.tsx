import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';

import { Input, Button, Card, Dropdown, LogoutButton, TimePicker } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { createTimetableEntry } from '../../store/slices/timetableSlice';
import { DayOfWeek, DAYS_OF_WEEK, DAY_LABELS } from '../../types/timetable';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';

const TIME_RE = /^\d{2}:\d{2}$/;

const schema = z.object({
  academicYear: z.string().min(1, 'Academic year is required'),
  class: z.string().min(1, 'Class is required'),
  section: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  teacher: z.string().min(1, 'Teacher is required'),
  startTime: z.string().regex(TIME_RE, 'Use HH:MM format (e.g. 08:00)'),
  endTime: z.string().regex(TIME_RE, 'Use HH:MM format (e.g. 09:00)'),
  room: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const CreateTimetableScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { submitting, error } = useAppSelector((s) => s.timetable);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');

  const [academicYears, setAcademicYears] = useState<{ label: string; value: string }[]>([]);
  const [classes, setClasses] = useState<{ label: string; value: string }[]>([]);
  const [sections, setSections] = useState<{ label: string; value: string }[]>([]);
  const [subjects, setSubjects] = useState<{ label: string; value: string }[]>([]);
  const [teachers, setTeachers] = useState<{ label: string; value: string }[]>([]);

  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      academicYear: '', class: '', section: '', subject: '',
      teacher: '', startTime: '', endTime: '', room: '',
    },
  });

  const selectedClass = watch('class');

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSections([]); setSubjects([]); return; }

    setLoadingSections(true);
    classService.getSections(selectedClass)
      .then(({ data }) => setSections(data.data.map((s) => ({ label: s.name, value: s._id }))))
      .finally(() => setLoadingSections(false));

    setLoadingSubjects(true);
    subjectService.getSubjects({ class: selectedClass })
      .then(({ data }) => setSubjects(data.data.map((s) => ({ label: `${s.name} (${s.code})`, value: s._id }))))
      .finally(() => setLoadingSubjects(false));
  }, [selectedClass]);

  const onSubmit = async (values: FormValues) => {
    const result = await dispatch(createTimetableEntry({
      ...values,
      dayOfWeek: selectedDay,
      section: values.section || undefined,
      room: values.room || undefined,
    }));
    if (createTimetableEntry.fulfilled.match(result)) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Timetable Entry</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Day selector */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Day of Week *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
                  {DAY_LABELS[day].slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Class & Subject</Text>

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

          <Controller control={control} name="section" render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Section (optional)"
              placeholder={selectedClass ? 'Select section' : 'Select a class first'}
              items={sections}
              value={value ?? ''}
              onChange={onChange}
              loading={loadingSections}
              disabled={!selectedClass}
            />
          )} />

          <Controller control={control} name="subject" render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Subject *"
              placeholder={selectedClass ? 'Select subject' : 'Select a class first'}
              items={subjects}
              value={value}
              onChange={onChange}
              loading={loadingSubjects}
              disabled={!selectedClass}
              error={errors.subject?.message}
            />
          )} />

          <Controller control={control} name="teacher" render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Teacher *"
              placeholder="Select teacher"
              items={teachers}
              value={value}
              onChange={onChange}
              loading={loadingTeachers}
              error={errors.teacher?.message}
            />
          )} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Time & Room</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Controller control={control} name="startTime" render={({ field: { onChange, value } }) => (
                <TimePicker label="Start Time *" value={value} onChange={onChange} error={errors.startTime?.message} />
              )} />
            </View>
            <View style={styles.timeField}>
              <Controller control={control} name="endTime" render={({ field: { onChange, value } }) => (
                <TimePicker label="End Time *" value={value} onChange={onChange} error={errors.endTime?.message} />
              )} />
            </View>
          </View>
          <Controller control={control} name="room" render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Room (optional)" placeholder="e.g. Room 101" leftIcon="location-outline" onChangeText={onChange} onBlur={onBlur} value={value} />
          )} />
        </Card>

        <Button label="Create Entry" onPress={handleSubmit(onSubmit)} loading={submitting} fullWidth size="lg" style={styles.submitBtn} />
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
  dayRow: { gap: spacing[2], paddingVertical: spacing[1] },
  dayChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayChipText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.textSecondary },
  dayChipTextActive: { color: colors.white },
  timeRow: { flexDirection: 'row', gap: spacing[3] },
  timeField: { flex: 1 },
  submitBtn: { marginTop: spacing[2] },
});
