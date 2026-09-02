import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Input, Button, Card, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { createClass, updateClass, fetchAcademicYears } from '../../store/slices/classSlice';
import { AdminStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<AdminStackParamList, 'AddEditClass'>;
type NavProp = NativeStackNavigationProp<AdminStackParamList>;

const schema = z.object({
  name: z.string().min(1, 'Class name is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
});
type FormValues = z.infer<typeof schema>;

export const AddEditClassScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { classId, className, academicYearId } = route.params ?? {};
  const isEdit = !!classId;

  const { submitting, error, academicYears } = useAppSelector((s) => s.classes);

  useEffect(() => { dispatch(fetchAcademicYears()); }, [dispatch]);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: className ?? '', academicYear: academicYearId ?? '' },
  });

  const selectedYear = watch('academicYear');

  const onSubmit = async (values: FormValues) => {
    const action = isEdit
      ? updateClass({ id: classId!, data: values })
      : createClass(values);
    const result = await dispatch(action);
    if ((isEdit ? updateClass : createClass).fulfilled.match(result as any)) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Class' : 'Add Class'}</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Card style={styles.card}>
          <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Class Name *"
              placeholder="e.g. Grade 10, Class A"
              leftIcon="school-outline"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.name?.message}
            />
          )} />

          <Text style={styles.label}>Academic Year *</Text>
          {academicYears.length === 0 ? (
            <TouchableOpacity
              style={styles.noYearsBtn}
              onPress={() => navigation.navigate('AcademicYears')}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={styles.noYearsBtnText}>No academic years found — tap to create one</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.yearList}>
              {academicYears.map((y) => (
                <TouchableOpacity
                  key={y._id}
                  style={[styles.yearChip, selectedYear === y._id && styles.yearChipActive]}
                  onPress={() => setValue('academicYear', y._id)}
                >
                  <Text style={[styles.yearChipText, selectedYear === y._id && styles.yearChipTextActive]}>
                    {y.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.academicYear && <Text style={styles.fieldError}>{errors.academicYear.message}</Text>}
        </Card>

        <Button
          label={isEdit ? 'Save Changes' : 'Add Class'}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          fullWidth
          size="lg"
        />
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
  headerTitle: { flex: 1, fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  errorBanner: { backgroundColor: colors.errorLight, borderRadius: 8, padding: spacing[3], marginBottom: spacing[4] },
  errorText: { fontSize: typography.fontSizes.sm, color: colors.error },
  card: { marginBottom: spacing[4], padding: spacing[4] },
  label: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textPrimary, marginBottom: spacing[2] },
  noYearsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing[3],
  },
  noYearsBtnText: { fontSize: typography.fontSizes.sm, color: colors.primary, fontWeight: typography.fontWeights.medium },
  yearList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  yearChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: spacing[5],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.gray50,
  },
  yearChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  yearChipText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  yearChipTextActive: { color: colors.white, fontWeight: typography.fontWeights.semibold },
  fieldError: { fontSize: typography.fontSizes.xs, color: colors.error, marginTop: spacing[1] },
});
