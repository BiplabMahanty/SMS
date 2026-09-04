import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, radii } from '../../theme';
import apiClient from '../../api/client';

interface PhotoPickerProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = React.useState(false);

  const pick = async (useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission required', `Please allow ${useCamera ? 'camera' : 'photo library'} access.`);
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const form = new FormData();
    form.append('photo', { uri: asset.uri, name: 'photo.jpg', type: 'image/jpeg' } as any);

    setUploading(true);
    try {
      const { data } = await apiClient.post('/upload/profile-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.data.url);
    } catch {
      Alert.alert('Upload failed', 'Could not upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showOptions = () => {
    Alert.alert('Profile Photo', 'Choose source', [
      { text: 'Camera', onPress: () => pick(true) },
      { text: 'Photo Library', onPress: () => pick(false) },
      ...(value ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => onChange(undefined) }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showOptions} style={styles.avatar} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.primary} />
        ) : value ? (
          <Image source={{ uri: value }} style={styles.image} />
        ) : (
          <Ionicons name="person-circle-outline" size={64} color={colors.textSecondary} />
        )}
        <View style={styles.badge}>
          <Ionicons name="camera" size={12} color={colors.white} />
        </View>
      </TouchableOpacity>
      <Text style={styles.hint}>Tap to {value ? 'change' : 'add'} photo (optional)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: spacing[4] },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  image: { width: 88, height: 88, borderRadius: 44 },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  hint: { marginTop: spacing[2], fontSize: typography.fontSizes.xs, color: colors.textSecondary },
});
