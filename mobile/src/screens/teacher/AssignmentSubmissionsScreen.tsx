import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Card, Loading, EmptyState, Button, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchSubmissions, gradeSubmission } from '../../store/slices/assignmentSlice';
import { TeacherStackParamList } from '../../navigation/types';
import { AssignmentSubmission } from '../../types/assignment';

type Route = RouteProp<TeacherStackParamList, 'AssignmentSubmissions'>;

export const AssignmentSubmissionsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { params } = useRoute<Route>();
  const { submissions, loading } = useAppSelector(s => s.assignments);
  const [selected, setSelected] = useState<AssignmentSubmission | null>(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => { dispatch(fetchSubmissions(params.assignmentId)); }, [dispatch]);

  const handleGrade = async () => {
    if (!selected || !marks) return;
    setGrading(true);
    try {
      await dispatch(gradeSubmission({ submissionId: selected._id, marks: Number(marks), feedback })).unwrap();
      Alert.alert('Success', 'Graded successfully');
      setSelected(null);
      dispatch(fetchSubmissions(params.assignmentId));
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed');
    } finally {
      setGrading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Submissions · {params.title}</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <FlatList
        data={submissions}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="document-outline" title="No submissions yet" message="" />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.student.name}</Text>
                <Text style={styles.sub}>Roll: {item.student.rollNumber} · {item.status}</Text>
                {item.marks !== undefined && <Text style={styles.sub}>Marks: {item.marks}</Text>}
              </View>
              {item.status !== 'GRADED' && (
                <TouchableOpacity onPress={() => { setSelected(item); setMarks(''); setFeedback(''); }}>
                  <Ionicons name="create-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
      />
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Grade Submission</Text>
            <TextInput style={styles.input} placeholder="Marks" keyboardType="numeric" value={marks} onChangeText={setMarks} />
            <TextInput style={[styles.input, styles.multiline]} placeholder="Feedback (optional)" value={feedback} onChangeText={setFeedback} multiline />
            <View style={styles.modalBtns}>
              <Button label="Cancel" onPress={() => setSelected(null)} variant="outline" style={styles.modalBtn} />
              <Button label="Grade" onPress={handleGrade} loading={grading} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
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
  info: { flex: 1 },
  name: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  sub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing[6] },
  modalTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing[4] },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing[3], marginBottom: spacing[3], fontSize: typography.fontSizes.base },
  multiline: { height: 80, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: spacing[3] },
  modalBtn: { flex: 1 },
});
