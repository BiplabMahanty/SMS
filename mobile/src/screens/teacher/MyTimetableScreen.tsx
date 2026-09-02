import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Loading, ErrorState, LogoutButton } from '../../components/ui';
import { TimetableView } from '../../components/TimetableView';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyTimetableTeacher } from '../../store/slices/timetableSlice';

export const MyTimetableScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { myEntries, loading, error } = useAppSelector((s) => s.timetable);

  const load = () => { dispatch(fetchMyTimetableTeacher({})); };

  useEffect(() => { load(); }, []);

  if (loading && myEntries.length === 0) return <Loading fullScreen />;
  if (error && myEntries.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Timetable</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <TimetableView
        entries={myEntries}
        loading={loading}
        onRefresh={load}
        showTeacher={false}
        showClass
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
  headerTitle: { flex: 1, fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
});
