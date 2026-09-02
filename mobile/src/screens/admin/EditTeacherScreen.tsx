import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { TeacherForm } from '../../components/TeacherForm';
import { Loading, LogoutButton } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchTeacher, updateTeacher } from '../../store/slices/teacherSlice';
import { AdminStackParamList } from '../../navigation/types';
import { TeacherFormData } from '../../types/teacher';

type RoutePropType = RouteProp<AdminStackParamList, 'EditTeacher'>;

export const EditTeacherScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { teacherId } = route.params;

  const { selectedTeacher: teacher, detailLoading, submitting, error } = useAppSelector((s) => s.teachers);

  useEffect(() => {
    dispatch(fetchTeacher(teacherId));
  }, [teacherId]);

  const handleSubmit = async (data: TeacherFormData) => {
    const result = await dispatch(updateTeacher({ id: teacherId, data }));
    if (updateTeacher.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  if (detailLoading || !teacher) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Teacher</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <TeacherForm
        defaultValues={teacher}
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
