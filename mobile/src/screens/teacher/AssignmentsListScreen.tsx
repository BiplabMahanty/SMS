import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Loading, EmptyState, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchAssignments, deleteAssignment } from '../../store/slices/assignmentSlice';
import { TeacherStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<TeacherStackParamList>;

export const AssignmentsListScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const { assignments, loading } = useAppSelector(s => s.assignments);

  useEffect(() => { dispatch(fetchAssignments()); }, [dispatch]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteAssignment(id)) },
    ]);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAssignment')} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <FlatList
        data={assignments}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="No assignments" message="Tap + to create one" actionLabel="Create Assignment" onAction={() => navigation.navigate('CreateAssignment')} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <TouchableOpacity onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item._id })}>
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.sub}>
                    {item.class.name}{item.section ? ` · ${item.section.name}` : ''} · Due: {new Date(item.dueDate).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.title)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  backBtn: { padding: spacing[1], marginRight: spacing[3] },
  headerTitle: { flex: 1, fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  addBtn: { padding: spacing[1] },
  list: { padding: spacing[4] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  info: { flex: 1 },
  title: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  sub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
});
