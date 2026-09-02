import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Loading, EmptyState, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyAssignments } from '../../store/slices/assignmentSlice';
import { StudentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

export const MyAssignmentsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const { assignments, loading } = useAppSelector(s => s.assignments);

  useEffect(() => { dispatch(fetchMyAssignments()); }, [dispatch]);

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Assignments</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <FlatList
        data={assignments}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="No assignments" message="No assignments yet" />}
        renderItem={({ item }) => {
          const overdue = new Date(item.dueDate) < new Date();
          return (
            <TouchableOpacity onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item._id })}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={[styles.icon, overdue && styles.iconOverdue]}>
                    <Ionicons name="document-text" size={20} color={overdue ? colors.error : colors.primary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={[styles.due, overdue && styles.dueOverdue]}>
                      Due: {new Date(item.dueDate).toLocaleDateString()}{overdue ? ' (Overdue)' : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  backBtn: { padding: spacing[1], marginRight: spacing[3] },
  headerTitle: { flex: 1, fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  list: { padding: spacing[4] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  iconOverdue: { backgroundColor: '#FEE2E2' },
  info: { flex: 1 },
  title: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  due: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  dueOverdue: { color: colors.error },
});
