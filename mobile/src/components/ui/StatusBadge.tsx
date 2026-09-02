import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';

type Status = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED' | 'ON_LEAVE'
  | 'success' | 'error' | 'warning' | 'info';

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: colors.successLight, text: colors.success, label: 'Active' },
  INACTIVE: { bg: colors.gray100, text: colors.gray500, label: 'Inactive' },
  GRADUATED: { bg: colors.primaryLight, text: colors.primary, label: 'Graduated' },
  TRANSFERRED: { bg: colors.warningLight, text: colors.warning, label: 'Transferred' },
  SUSPENDED: { bg: colors.errorLight, text: colors.error, label: 'Suspended' },
  ON_LEAVE: { bg: colors.warningLight, text: colors.warning, label: 'On Leave' },
  success: { bg: colors.successLight, text: colors.success, label: 'Success' },
  error: { bg: colors.errorLight, text: colors.error, label: 'Error' },
  warning: { bg: colors.warningLight, text: colors.warning, label: 'Warning' },
  info: { bg: colors.infoLight, text: colors.info, label: 'Info' },
};

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const cfg = statusConfig[status] ?? statusConfig.INACTIVE;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{label ?? cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
});
