import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Card, Loading, Button, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchAssignment, fetchMySubmission, submitAssignment } from '../../store/slices/assignmentSlice';
import { assignmentService } from '../../services/assignmentService';
import { TeacherStackParamList, StudentStackParamList } from '../../navigation/types';

type TeacherRoute = RouteProp<TeacherStackParamList, 'AssignmentDetail'>;
type StudentRoute = RouteProp<StudentStackParamList, 'AssignmentDetail'>;

export const AssignmentDetailScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute<TeacherRoute | StudentRoute>();
  const { assignmentId } = route.params;
  const { currentAssignment, mySubmission } = useAppSelector(s => s.assignments);
  const { user } = useAppSelector(s => s.auth);
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [files, setFiles] = useState<{ name: string; uri: string; type: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignment(assignmentId));
    if (!isTeacher) dispatch(fetchMySubmission(assignmentId));
  }, [dispatch, assignmentId]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (!result.canceled) {
      setFiles(prev => [...prev, ...result.assets.map(a => ({ name: a.name, uri: a.uri, type: a.mimeType ?? 'application/octet-stream' }))]);
    }
  };

  const handleSubmit = async () => {
    if (!files.length) { Alert.alert('Error', 'Please attach at least one file'); return; }
    setSubmitting(true);
    const fd = new FormData();
    files.forEach(f => fd.append('files', { uri: f.uri, name: f.name, type: f.type } as any));
    try {
      await dispatch(submitAssignment({ id: assignmentId, formData: fd })).unwrap();
      Alert.alert('Success', 'Assignment submitted!');
      setFiles([]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentAssignment) return <Loading fullScreen />;

  const a = currentAssignment;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{a.title}</Text>
        {isTeacher && (
          <TouchableOpacity onPress={() => (navigation as any).navigate('AssignmentSubmissions', { assignmentId: a._id, title: a.title })}>
            <Ionicons name="people-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        )}
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.label}>Class</Text>
          <Text style={styles.value}>{a.class.name}{a.section ? ` · ${a.section.name}` : ''}</Text>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.value}>{new Date(a.dueDate).toLocaleDateString()}</Text>
          {a.description ? (<><Text style={styles.label}>Description</Text><Text style={styles.value}>{a.description}</Text></>) : null}
          {a.attachments.length > 0 && (
            <>
              <Text style={styles.label}>Attachments</Text>
              {a.attachments.map((f, i) => (
                <TouchableOpacity key={i} style={styles.fileRow} onPress={() => Linking.openURL(assignmentService.getFileUrl(f.filename))}>
                  <Ionicons name="document-outline" size={16} color={colors.primary} />
                  <Text style={styles.fileLink}>{f.originalName}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </Card>

        {!isTeacher && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>My Submission</Text>
            {mySubmission ? (
              <>
                <View style={styles.statusRow}>
                  <Text style={styles.label}>Status: </Text>
                  <Text style={[styles.value, { color: mySubmission.status === 'GRADED' ? colors.success : colors.warning }]}>{mySubmission.status}</Text>
                </View>
                {mySubmission.marks !== undefined && <Text style={styles.value}>Marks: {mySubmission.marks}</Text>}
                {mySubmission.feedback && <Text style={styles.value}>Feedback: {mySubmission.feedback}</Text>}
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
                  <Ionicons name="attach" size={20} color={colors.primary} />
                  <Text style={styles.filePickerText}>Attach Files</Text>
                </TouchableOpacity>
                {files.map((f, i) => (
                  <View key={i} style={styles.fileRow}>
                    <Ionicons name="document-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                    <TouchableOpacity onPress={() => setFiles(p => p.filter((_, j) => j !== i))}>
                      <Ionicons name="close-circle" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                <Button label="Submit Assignment" onPress={handleSubmit} loading={submitting} style={styles.btn} />
              </>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  backBtn: { padding: spacing[1], marginRight: spacing[3] },
  headerTitle: { flex: 1, fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  content: { padding: spacing[4] },
  card: { marginBottom: spacing[4], padding: spacing[4] },
  label: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: spacing[2] },
  value: { fontSize: typography.fontSizes.base, color: colors.textPrimary },
  sectionTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing[3] },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  filePicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: spacing[3], marginBottom: spacing[3] },
  filePickerText: { marginLeft: spacing[2], color: colors.primary, fontWeight: typography.fontWeights.medium },
  fileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[2] },
  fileName: { flex: 1, marginHorizontal: spacing[2], fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  fileLink: { flex: 1, marginLeft: spacing[2], fontSize: typography.fontSizes.sm, color: colors.primary, textDecorationLine: 'underline' },
  btn: { marginTop: spacing[3] },
});
