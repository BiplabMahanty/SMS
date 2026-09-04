import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { Button, Input, Card, PhotoPicker } from '../components/ui';
import { colors, typography, spacing } from '../theme';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { registerAdmin, clearError } from '../store/slices/authSlice';
import { AuthStackParamList } from '../navigation/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'AdminSignup'>;

export const AdminSignupScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [photo, setPhoto] = useState<string | undefined>();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    dispatch(clearError());
    dispatch(registerAdmin({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      profileImage: photo,
    }));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={56} color={colors.primary} />
            <Text style={styles.title}>Create Admin Account</Text>
            <Text style={styles.subtitle}>Set up your administrator profile</Text>
          </View>

          <Card style={styles.card}>
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <PhotoPicker value={photo} onChange={setPhoto} />

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="admin@example.com"
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Min. 8 characters"
                  leftIcon="lock-closed-outline"
                  isPassword
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  leftIcon="lock-closed-outline"
                  isPassword
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              label="Create Admin Account"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.submitBtn}
            />
          </Card>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
            <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing[5] },
  header: { alignItems: 'center', marginBottom: spacing[6] },
  title: {
    marginTop: spacing[4],
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing[1],
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
  },
  card: { padding: spacing[5] },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  errorText: { flex: 1, fontSize: typography.fontSizes.sm, color: colors.error },
  submitBtn: { marginTop: spacing[2] },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[5],
    gap: spacing[1],
  },
  backText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});
