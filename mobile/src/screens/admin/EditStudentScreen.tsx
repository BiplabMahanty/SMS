import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Loading, ErrorState, LogoutButton } from '../../components/ui';
import { StudentForm } from '../../components/StudentForm';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  fetchStudent,
  updateStudent,
  clearStudentError,
  clearSelectedStudent,
} from '../../store/slices/studentSlice';
import { StudentFormData } from '../../types/student';
import { AdminStackParamList } from '../../navigation/types';

type RouteType = RouteProp<AdminStackParamList, 'EditStudent'>;

export const EditStudentScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { studentId } = route.params;

  const { selectedStudent: student, detailLoading, submitting, error } = useAppSelector(
    (s) => s.students
  );

  useEffect(() => {
    dispatch(clearStudentError());
    dispatch(fetchStudent(studentId));
    return () => { dispatch(clearSelectedStudent()); };
  }, [studentId, dispatch]);

  const handleSubmit = async (data: StudentFormData) => {
    const result = await dispatch(updateStudent({ id: studentId, data }));
    if (updateStudent.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  if (detailLoading) return <Loading fullScreen message="Loading student..." />;
  if (!student) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState message={error ?? 'Student not found'} onRetry={() => dispatch(fetchStudent(studentId))} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Student</Text>
        <LogoutButton />
      </View>
      <StudentForm
        defaultValues={student}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
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
