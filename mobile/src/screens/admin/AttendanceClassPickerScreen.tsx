import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { AdminStackParamList } from '../../navigation/types';
import { classService, ClassWithYear } from '../../services/classService';

type NavProp = NativeStackNavigationProp<AdminStackParamList>;

export const AttendanceClassPickerScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [classes, setClasses] = useState<ClassWithYear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classService.getClasses()
      .then(({ data }) => setClasses(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Class</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(c) => c._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="school-outline" title="No classes" message="No classes found" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AttendanceReport', {
                classId: item._id,
                academicYearId: item.academicYear._id,
                className: `${item.name} · ${item.academicYear.name}`,
              })}
            >
              <View style={styles.icon}>
                <Ionicons name="school" size={20} color={colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.className}>{item.name}</Text>
                <Text style={styles.yearText}>{item.academicYear.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
            </TouchableOpacity>
          )}
        />
      )}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing[4] },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    elevation: 2,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  info: { flex: 1 },
  className: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  yearText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
});
