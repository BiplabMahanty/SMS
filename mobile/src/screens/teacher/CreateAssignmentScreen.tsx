import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Input, Button, Dropdown, LogoutButton, DatePicker } from '../../components/ui';
import { colors, typography, spacing } from '../../theme';
import { useAppDispatch } from '../../hooks/useAppStore';
import { createAssignment } from '../../store/slices/assignmentSlice';
import { classService } from '../../services/classService';

export const CreateAssignmentScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [files, setFiles] = useState<{ name: string; uri: string; type: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [academicYears, setAcademicYears] = useState<{ label: string; value: string }[]>([]);
  const [classes, setClasses] = useState<{ label: string; value: string }[]>([]);
  const [sections, setSections] = useState<{ label: string; value: string }[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  useEffect(() => {
    setLoadingYears(true);
    classService.getAcademicYears()
      .then(({ data }) => setAcademicYears(data.data.map((y) => ({ label: y.name, value: y._id }))))
      .finally(() => setLoadingYears(false));

    setLoadingClasses(true);
    classService.getClasses()
      .then(({ data }) => setClasses(data.data.map((c) => ({ label: c.name, value: c._id }))))
      .finally(() => setLoadingClasses(false));
  }, []);

  useEffect(() => {
    if (!classId) { setSections([]); setSectionId(''); return; }
    setLoadingSections(true);
    classService.getSections(classId)
      .then(({ data }) => setSections(data.data.map((s) => ({ label: s.name, value: s._id }))))
      .finally(() => setLoadingSections(false));
  }, [classId]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (!result.canceled) {
      setFiles(prev => [...prev, ...result.assets.map(a => ({ name: a.name, uri: a.uri, type: a.mimeType ?? 'application/octet-stream' }))]);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !classId || !academicYearId || !form.dueDate) {
      Alert.alert('Error', 'Title, Class, Academic Year and Due Date are required');
      return;
    }
    setLoading(true);
    try {
      let payload: FormData | object;
      if (files.length > 0) {
        const fd = new FormData();
        fd.append('title', form.title);
        if (form.description) fd.append('description', form.description);
        fd.append('classId', classId);
        if (sectionId) fd.append('sectionId', sectionId);
        fd.append('academicYearId', academicYearId);
        fd.append('dueDate', form.dueDate);
        files.forEach(f => fd.append('files', { uri: f.uri, name: f.name, type: f.type } as any));
        payload = fd;
      } else {
        payload = { title: form.title, description: form.description || undefined, classId, sectionId: sectionId || undefined, academicYearId, dueDate: form.dueDate };
      }
      await dispatch(createAssignment(payload)).unwrap();
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', typeof e === 'string' ? e : e?.message ?? 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Assignment</Text>
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Title *" value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} />
        <Input label="Description" value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} multiline numberOfLines={3} />

        <Dropdown
          label="Academic Year *"
          placeholder="Select academic year"
          items={academicYears}
          value={academicYearId}
          onChange={setAcademicYearId}
          loading={loadingYears}
        />

        <Dropdown
          label="Class *"
          placeholder="Select class"
          items={classes}
          value={classId}
          onChange={setClassId}
          loading={loadingClasses}
        />

        <Dropdown
          label="Section (optional)"
          placeholder={classId ? 'Select section' : 'Select a class first'}
          items={sections}
          value={sectionId}
          onChange={setSectionId}
          loading={loadingSections}
          disabled={!classId}
        />

        <DatePicker
          label="Due Date *"
          value={form.dueDate}
          onChange={v => setForm(p => ({ ...p, dueDate: v }))}
        />

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

        <Button label="Create Assignment" onPress={handleSubmit} loading={loading} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  backBtn: { padding: spacing[1], marginRight: spacing[3] },
  headerTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.white },
  content: { padding: spacing[4] },
  filePicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: spacing[3], marginBottom: spacing[3] },
  filePickerText: { marginLeft: spacing[2], color: colors.primary, fontWeight: typography.fontWeights.medium },
  fileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[2] },
  fileName: { flex: 1, marginHorizontal: spacing[2], fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  btn: { marginTop: spacing[4] },
});
