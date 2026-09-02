import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { StudentForm } from '../../components/StudentForm';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { createStudent, clearStudentError } from '../../store/slices/studentSlice';
import { StudentFormData } from '../../types/student';
import { LogoutButton } from '../../components/ui';

export const AddStudentScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { submitting, error } = useAppSelector((s) => s.students);

  useEffect(() => {
    dispatch(clearStudentError());
  }, [dispatch]);

  const handleSubmit = async (data: StudentFormData) => {
    const result = await dispatch(createStudent(data));
    if (createStudent.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Student</Text>
        <LogoutButton />
      </View>
      <StudentForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Add Student"
        error={error}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing[1], marginRight: spacing[2] },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
});
