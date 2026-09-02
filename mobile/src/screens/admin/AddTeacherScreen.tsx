import React from 'react';
import { SafeAreaView, StatusBar, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { TeacherForm } from '../../components/TeacherForm';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { createTeacher } from '../../store/slices/teacherSlice';
import { TeacherFormData } from '../../types/teacher';
import { LogoutButton } from '../../components/ui';

export const AddTeacherScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { submitting, error } = useAppSelector((s) => s.teachers);

  const handleSubmit = async (data: TeacherFormData) => {
    const result = await dispatch(createTeacher(data));
    if (createTeacher.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Teacher</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <TeacherForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Add Teacher"
        error={error}
      />
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
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.white,
  },
});
