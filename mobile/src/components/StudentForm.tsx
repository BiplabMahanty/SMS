import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Input, Button, Card, Dropdown, PhotoPicker, DatePicker } from './ui';
import { colors, typography, spacing } from '../theme';
import { StudentFormData, Student } from '../types/student';
import { classService } from '../services/classService';

const studentSchema = z.object({
  profileImage: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.string().optional(),
  admissionDate: z.string().optional(),
  academicYear: z.string().min(1, 'Academic year is required'),
  class: z.string().min(1, 'Class is required'),
  section: z.string().optional(),
  rollNumber: z.string().optional(),
  'address.street': z.string().optional(),
  'address.city': z.string().optional(),
  'address.state': z.string().optional(),
  'address.zipCode': z.string().optional(),
  'address.country': z.string().optional(),
});

type FormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  defaultValues?: Partial<Student>;
  onSubmit: (data: StudentFormData) => void;
  submitting: boolean;
  submitLabel: string;
  error?: string | null;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  defaultValues,
  onSubmit,
  submitting,
  submitLabel,
  error,
}) => {
  const [academicYears, setAcademicYears] = useState<{ label: string; value: string }[]>([]);
  const [classes, setClasses] = useState<{ label: string; value: string }[]>([]);
  const [sections, setSections] = useState<{ label: string; value: string }[]>([]);
  const [photo, setPhoto] = useState<string | undefined>(defaultValues?.profileImage);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      profileImage: defaultValues?.profileImage ?? '',
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      password: '',
      phone: defaultValues?.phone ?? '',
      gender: defaultValues?.gender,
      dateOfBirth: defaultValues?.dateOfBirth
        ? new Date(defaultValues.dateOfBirth).toISOString().split('T')[0]
        : '',
      admissionDate: defaultValues?.admissionDate
        ? new Date(defaultValues.admissionDate).toISOString().split('T')[0]
        : '',
      academicYear: typeof defaultValues?.academicYear === 'object' && defaultValues.academicYear !== null
        ? (defaultValues.academicYear as { _id: string })._id
        : (defaultValues?.academicYear as unknown as string) ?? '',
      class: typeof defaultValues?.class === 'object' && defaultValues.class !== null
        ? (defaultValues.class as { _id: string })._id
        : (defaultValues?.class as unknown as string) ?? '',
      section: typeof defaultValues?.section === 'object' && defaultValues.section !== null
        ? (defaultValues.section as { _id: string })._id
        : (defaultValues?.section as unknown as string) ?? '',
      rollNumber: defaultValues?.rollNumber ?? '',
      'address.street': defaultValues?.address?.street ?? '',
      'address.city': defaultValues?.address?.city ?? '',
      'address.state': defaultValues?.address?.state ?? '',
      'address.zipCode': defaultValues?.address?.zipCode ?? '',
      'address.country': defaultValues?.address?.country ?? '',
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
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSections([]); return; }
    setLoadingSections(true);
    classService.getSections(selectedClass)
      .then(({ data }) => setSections(data.data.map((s) => ({ label: s.name, value: s._id }))))
      .finally(() => setLoadingSections(false));
  }, [selectedClass]);

  const handleFormSubmit = (values: FormValues) => {
    const payload: StudentFormData = {
      profileImage: photo || undefined,
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth || undefined,
      admissionDate: values.admissionDate || undefined,
      academicYear: values.academicYear,
      class: values.class,
      section: values.section || undefined,
      rollNumber: values.rollNumber || undefined,
      address: {
        street: values['address.street'],
        city: values['address.city'],
        state: values['address.state'],
        zipCode: values['address.zipCode'],
        country: values['address.country'],
      },
    };
    onSubmit(payload);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
          <Input label="Email *" placeholder="student@example.com" leftIcon="mail-outline" keyboardType="email-address" autoCapitalize="none" onChangeText={onChange} onBlur={onBlur} value={value} error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Password *" placeholder="Min 8 characters" leftIcon="lock-closed-outline" isPassword onChangeText={onChange} onBlur={onBlur} value={value} error={errors.password?.message} />
        )} />
        <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Phone" placeholder="+1 234 567 8900" leftIcon="call-outline" keyboardType="phone-pad" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
        <Controller control={control} name="gender" render={({ field: { onChange, value } }) => (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.optionRow}>
              {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                <Button key={g} label={g} onPress={() => onChange(g)} variant={value === g ? 'primary' : 'outline'} size="sm" style={styles.optionBtn} />
              ))}
            </View>
          </View>
        )} />
        <Controller control={control} name="dateOfBirth" render={({ field: { onChange, value } }) => (
          <DatePicker label="Date of Birth" value={value ?? ''} onChange={onChange} />
        )} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>

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
            label="Section"
            placeholder={selectedClass ? 'Select section (optional)' : 'Select a class first'}
            items={sections}
            value={value ?? ''}
            onChange={onChange}
            loading={loadingSections}
            disabled={!selectedClass}
          />
        )} />

        <Controller control={control} name="rollNumber" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Roll Number" placeholder="e.g. 01" leftIcon="document-text-outline" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
        <Controller control={control} name="admissionDate" render={({ field: { onChange, value } }) => (
          <DatePicker label="Admission Date" value={value ?? ''} onChange={onChange} />
        )} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Controller control={control} name="address.street" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Street" placeholder="123 Main St" leftIcon="location-outline" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
        <Controller control={control} name="address.city" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="City" placeholder="New York" leftIcon="business-outline" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
        <Controller control={control} name="address.state" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="State" placeholder="NY" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
        <Controller control={control} name="address.zipCode" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Zip Code" placeholder="10001" keyboardType="numeric" onChangeText={onChange} onBlur={onBlur} value={value} />
        )} />
        <Controller control={control} name="address.country" render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Country" placeholder="United States" onChangeText={onChange} onBlur={onBlur} value={value} containerStyle={{ marginBottom: 0 }} />
        )} />
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
  fieldGroup: { marginBottom: spacing[4] },
  fieldLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  optionRow: { flexDirection: 'row', gap: spacing[2] },
  optionBtn: { flex: 1 },
  submitBtn: { marginTop: spacing[2] },
});
