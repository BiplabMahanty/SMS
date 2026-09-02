import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../hooks/useAppStore';
import { logoutUser } from '../../store/slices/authSlice';
import { spacing, radii } from '../../theme';

interface Props {
  color?: string;
}

export const LogoutButton: React.FC<Props> = ({ color = '#DC2626' }) => {
  const dispatch = useAppDispatch();
  return (
    <TouchableOpacity onPress={() => dispatch(logoutUser())} style={styles.btn}>
      <Ionicons name="log-out-outline" size={22} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { padding: spacing[1], borderRadius: radii.md },
});
