import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Loading, ErrorState, LogoutButton } from '../../components/ui';
import { TimetableView } from '../../components/TimetableView';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchChildTimetable } from '../../store/slices/timetableSlice';
import { ParentStackParamList } from '../../navigation/types';

type RoutePropType = RouteProp<ParentStackParamList, 'ChildTimetable'>;

export const ChildTimetableScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { studentId, studentName } = route.params;

  const { myEntries, loading, error } = useAppSelector((s) => s.timetable);

  const load = () => { dispatch(fetchChildTimetable({ studentId })); };

  useEffect(() => { load(); }, [studentId]);

  if (loading && myEntries.length === 0) return <Loading fullScreen />;
  if (error && myEntries.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Timetable</Text>
          <Text style={styles.headerSub}>{studentName}</Text>
        </View>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <TimetableView
        entries={myEntries}
        loading={loading}
        onRefresh={load}
        showTeacher
        showClass={false}
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
  headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  headerSub: { fontSize: typography.fontSizes.xs, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
});
