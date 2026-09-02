import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Card, Loading, EmptyState, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyClasses } from '../../store/slices/teacherSlice';
import { AssignedClass } from '../../types/teacher';

export const MyClassesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { myClasses, detailLoading } = useAppSelector((s) => s.teachers);

  useEffect(() => { dispatch(fetchMyClasses()); }, [dispatch]);

  if (detailLoading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Classes</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <FlatList
        data={myClasses}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="school-outline" title="No classes assigned" message="Contact your admin to get classes assigned" />}
        renderItem={({ item }: { item: AssignedClass }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <Ionicons name="school" size={22} color={colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.className}>{item.class.name}{item.section ? ` — ${item.section.name}` : ''}</Text>
                <Text style={styles.yearText}>{item.academicYear.name}</Text>
              </View>
            </View>
          </Card>
        )}
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
  list: { padding: spacing[4] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  info: { flex: 1 },
  className: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  yearText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
});
