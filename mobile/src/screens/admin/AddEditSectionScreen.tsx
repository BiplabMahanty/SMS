import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Input, Button, Card, LogoutButton } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { createSection, updateSection } from '../../store/slices/classSlice';
import { AdminStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<AdminStackParamList, 'AddEditSection'>;

const schema = z.object({ name: z.string().min(1, 'Section name is required') });
type FormValues = z.infer<typeof schema>;

export const AddEditSectionScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { classId, academicYearId, sectionId, sectionName } = route.params;
  const isEdit = !!sectionId;

  const { submitting, error } = useAppSelector((s) => s.classes);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: sectionName ?? '' },
  });

  const onSubmit = async (values: FormValues) => {
    const action = isEdit
      ? updateSection({ id: sectionId!, name: values.name })
      : createSection({ classId, name: values.name, academicYear: academicYearId });
    const result = await dispatch(action);
    if ((isEdit ? updateSection : createSection).fulfilled.match(result as any)) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Section' : 'Add Section'}</Text>
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
              label="Section Name *"
              placeholder="e.g. A, B, Red, Blue"
              leftIcon="grid-outline"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.name?.message}
            />
          )} />
        </Card>
        <Button
          label={isEdit ? 'Save Changes' : 'Add Section'}
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
});
