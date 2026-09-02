import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableOpacity, Alert, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Card, Loading, EmptyState, Button, Input, LogoutButton } from '../../components/ui';
import { colors, typography, spacing, radii } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMaterials, createMaterial, deleteMaterial } from '../../store/slices/assignmentSlice';
import { studyMaterialService } from '../../services/assignmentService';

export const StudyMaterialsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { materials, loading } = useAppSelector(s => s.assignments);
  const { user } = useAppSelector(s => s.auth);
  const canUpload = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', classId: '', academicYearId: '' });
  const [file, setFile] = useState<{ name: string; uri: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { dispatch(fetchMaterials()); }, [dispatch]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setFile({ name: a.name, uri: a.uri, type: a.mimeType ?? 'application/octet-stream' });
    }
  };

  const handleUpload = async () => {
    if (!form.title || !form.classId || !form.academicYearId || !file) {
      Alert.alert('Error', 'All fields and a file are required');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    fd.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
    try {
      await dispatch(createMaterial(fd)).unwrap();
      setShowModal(false);
      setForm({ title: '', description: '', classId: '', academicYearId: '' });
      setFile(null);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Delete this material?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteMaterial(id)) },
    ]);
  };

  const fileIcon = (type: string) => {
    if (type.includes('pdf')) return 'document-text';
    if (type.includes('image')) return 'image';
    if (type.includes('video')) return 'videocam';
    return 'document';
  };

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Materials</Text>
        {canUpload && (
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
        <LogoutButton color="rgba(255,255,255,0.85)" />
      </View>
      <FlatList
        data={materials}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="folder-open-outline" title="No materials" message={canUpload ? 'Tap + to upload' : 'No materials available'} actionLabel={canUpload ? 'Upload Material' : undefined} onAction={canUpload ? () => setShowModal(true) : undefined} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <Ionicons name={fileIcon(item.mimetype) as any} size={22} color={colors.primary} />
              </View>
              <TouchableOpacity style={styles.info} onPress={() => Linking.openURL(studyMaterialService.getFileUrl(item.filename))}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.sub}>{item.class.name}{item.section ? ` · ${item.section.name}` : ''}</Text>
              </TouchableOpacity>
              {canUpload && (
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
      />
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Upload Material</Text>
            <Input label="Title *" value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} />
            <Input label="Class ID *" value={form.classId} onChangeText={v => setForm(p => ({ ...p, classId: v }))} />
            <Input label="Academic Year ID *" value={form.academicYearId} onChangeText={v => setForm(p => ({ ...p, academicYearId: v }))} />
            <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
              <Ionicons name="attach" size={20} color={colors.primary} />
              <Text style={styles.filePickerText}>{file ? file.name : 'Select File *'}</Text>
            </TouchableOpacity>
            <View style={styles.modalBtns}>
              <Button label="Cancel" onPress={() => setShowModal(false)} variant="outline" style={styles.modalBtn} />
              <Button label="Upload" onPress={handleUpload} loading={uploading} style={styles.modalBtn} />
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
  addBtn: { padding: spacing[1] },
  list: { padding: spacing[4] },
  card: { marginBottom: spacing[3], padding: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 44, height: 44, borderRadius: radii.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  info: { flex: 1 },
  title: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary },
  sub: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing[6] },
  modalTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing[4] },
  filePicker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: spacing[3], marginBottom: spacing[3] },
  filePickerText: { marginLeft: spacing[2], color: colors.primary, fontWeight: typography.fontWeights.medium, flex: 1 },
  modalBtns: { flexDirection: 'row', gap: spacing[3] },
  modalBtn: { flex: 1 },
});
