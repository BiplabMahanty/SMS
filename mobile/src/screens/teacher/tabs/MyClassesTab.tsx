import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radii, shadows } from '../../../theme';
import { useAppSelector } from '../../../hooks/useAppStore';
import { getIconBg, DEFAULT_ICON } from '../../../constants/classIcons';
import { TeacherStackParamList } from '../../../navigation/types';
import { EmptyState } from '../../../components/ui';

type NavProp = NativeStackNavigationProp<TeacherStackParamList>;

export const MyClassesTab: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { myClasses } = useAppSelector((s) => s.teachers);
  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {myClasses.length === 0 ? (
        <EmptyState icon="school-outline" title="No classes assigned" message="Contact your admin to get classes assigned" />
      ) : (
        myClasses.map((ac, i) => {
          if (!ac.class || !ac.academicYear) return null;
          const iconBg = getIconBg(ac.class.icon ?? DEFAULT_ICON);
          return (
            <TouchableOpacity
              key={String(i)}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MarkAttendance', {
                classId: ac.class._id,
                sectionId: ac.section?._id,
                academicYearId: ac.academicYear._id,
                className: `${ac.class.name}${ac.section ? ` - ${ac.section.name}` : ''}`,
                date: today,
              })}
            >
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                <Text style={styles.emoji}>{ac.class.icon ?? DEFAULT_ICON}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{ac.class.name}{ac.section ? ` — ${ac.section.name}` : ''}</Text>
                <Text style={styles.year}>{ac.academicYear.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing[4], paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f3f5f6', borderRadius: radii.lg,
    padding: spacing[4], marginBottom: spacing[3],
    gap: spacing[3], ...shadows.sm,
  },
  iconBox: { width: 52, height: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  year: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
});
