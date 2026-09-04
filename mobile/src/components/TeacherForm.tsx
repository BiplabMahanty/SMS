import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';

import { Input, Button, Card, PhotoPicker, DatePicker } from './ui';
import { colors, typography, spacing, radii } from '../theme';
import { TeacherFormData, Teacher } from '../types/teacher';

const teacherSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  department: z.string().optional(),
  joiningDate: z.string().optional(),
});

type FormValues = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  defaultValues?: Partial<Teacher>;
  onSubmit: (data: TeacherFormData) => void;
  submitting: boolean;
  submitLabel: string;
  error?: string | null;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
}) => {
  const [subjects, setSubjects] = useState<string[]>(defaultValues?.subjects ?? []);
  const [subjectInput, setSubjectInput] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(defaultValues?.profileImage);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      password: '',
      phone: defaultValues?.phone ?? '',
      department: defaultValues?.department ?? '',
      joiningDate: defaultValues?.joiningDate
        ? new Date(defaultValues.joiningDate).toISOString().split('T')[0]
        : '',
    },
  });

  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed]);
    }
    setSubjectInput('');
  };

  const removeSubject = (s: string) => setSubjects((prev) => prev.filter((x) => x !== s));

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      profileImage: photo || undefined,
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      department: values.department,
      joiningDate: values.joiningDate || undefined,
      subjects,
      assignedClasses: defaultValues?.assignedClasses?.map((ac) => ({
        class: ac.class._id,
        section: ac.section?._id,
        academicYear: ac.academicYear._id,
      })),
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <PhotoPicker value={photo} onChange={setPhoto} />

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Full Name *" placeholder="Enter full name" leftIcon="person-outline" onChangeText={onChange} onBlur={onBlur} value={value} error={errors.name?.message} />
        )} />
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Email *" placeholder="teacher@school.com" leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" onChangeText={onChange} onBlur={onBlur} value={value} error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Password *" placeholder="Min 8 characters" leftIcon="lock-closed-outline" isPassword onChangeText={onChange} onBlur={onBlur} value={value} error={errors.password?.message} />
        )} />
        <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Phone" placeholder="+1 234 567 8900" leftIcon="call-outline" keyboardType="phone-pad" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Information</Text>
        <Controller control={control} name="department" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Department" placeholder="e.g. Mathematics" leftIcon="business-outline" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
        <Controller control={control} name="joiningDate" render={({ field: { onChange, value } }) => (
          <DatePicker label="Joining Date" value={value ?? ''} onChange={onChange} />
        )} />

        {/* Subjects */}
        <Text style={styles.fieldLabel}>Subjects</Text>
        <View style={styles.subjectInputRow}>
          <Input
            placeholder="Add a subject"
            leftIcon="book-outline"
            value={subjectInput}
            onChangeText={setSubjectInput}
            onSubmitEditing={addSubject}
            returnKeyType="done"
            containerStyle={styles.subjectInput}
          />
          <TouchableOpacity onPress={addSubject} style={styles.addSubjectBtn}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        {subjects.length > 0 && (
          <View style={styles.tagRow}>
            {subjects.map((s) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
                <TouchableOpacity onPress={() => removeSubject(s)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="close" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Button
        label={submitLabel}
        onPress={handleSubmit(handleFormSubmit)}
        loading={submitting}
        fullWidth
        size="lg"
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  errorBanner: {
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: { fontSize: typography.fontSizes.sm, color: colors.error },
  section: { marginBottom: spacing[4], padding: spacing[4] },
  sectionTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing[3],
  },
  fieldLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  subjectInputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  subjectInput: { flex: 1, marginBottom: 0 },
  addSubjectBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing[3],
    marginTop: 2,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[2] },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    gap: spacing[1],
  },
  tagText: { fontSize: typography.fontSizes.sm, color: colors.primary, fontWeight: typography.fontWeights.medium },
  submitBtn: { marginTop: spacing[2] },
});
