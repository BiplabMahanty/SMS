import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '../../theme';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, error, placeholder = 'Select date' }) => {
  const [show, setShow] = useState(false);

  const date = value ? new Date(value) : new Date();

  const onPickerChange = (_: any, selected?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selected) {
      const iso = selected.toISOString().split('T')[0];
      onChange(iso);
    }
  };

  const displayValue = value
    ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, error ? styles.inputError : null]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} style={styles.icon} />
        <Text style={[styles.valueText, !displayValue && styles.placeholder]}>
          {displayValue || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      {show && (
        <RNDateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing[4] },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.error },
  icon: { marginRight: spacing[2] },
  valueText: { flex: 1, fontSize: typography.fontSizes.base, color: colors.textPrimary },
  placeholder: { color: colors.textDisabled },
  error: { fontSize: typography.fontSizes.xs, color: colors.error, marginTop: spacing[1] },
});
