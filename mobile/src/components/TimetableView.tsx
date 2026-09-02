import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii } from '../theme';
import { TimetableEntry, DayOfWeek, DAYS_OF_WEEK, DAY_LABELS } from '../types/timetable';
import { EmptyState } from './ui';

interface TimetableViewProps {
  entries: TimetableEntry[];
  loading: boolean;
  onRefresh: () => void;
  showTeacher?: boolean;
  showClass?: boolean;
  onDelete?: (entry: TimetableEntry) => void;
  onAdd?: () => void;
}

const PeriodCard: React.FC<{ entry: TimetableEntry; showTeacher: boolean; showClass: boolean; onDelete?: (entry: TimetableEntry) => void }> = ({
  entry, showTeacher, showClass, onDelete,
}) => (
  <View style={styles.periodCard}>
    <View style={styles.timeCol}>
      <Text style={styles.timeText}>{entry.startTime}</Text>
      <View style={styles.timeLine} />
      <Text style={styles.timeText}>{entry.endTime}</Text>
    </View>
    <View style={styles.periodBody}>
      <View style={styles.periodHeader}>
        <Text style={styles.subjectName}>{entry.subject.name}</Text>
        <Text style={styles.subjectCode}>{entry.subject.code}</Text>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(entry)} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={15} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.periodMeta}>
        {showTeacher && (
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{entry.teacher.name}</Text>
          </View>
        )}
        {showClass && (
          <View style={styles.metaItem}>
            <Ionicons name="school-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {entry.class.name}{entry.section ? ` — ${entry.section.name}` : ''}
            </Text>
          </View>
        )}
        {entry.room && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>Room {entry.room}</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

export const TimetableView: React.FC<TimetableViewProps> = ({
  entries, loading, onRefresh, showTeacher = true, showClass = false, onDelete, onAdd,
}) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() as DayOfWeek;
  const validToday = DAYS_OF_WEEK.includes(today) ? today : 'MONDAY';
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(validToday);

  const dayEntries = entries.filter((e) => e.dayOfWeek === selectedDay);

  return (
    <View style={styles.container}>
      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySelector}
      >
        {DAYS_OF_WEEK.map((day) => {
          const count = entries.filter((e) => e.dayOfWeek === day).length;
          const isSelected = day === selectedDay;
          const isToday = day === validToday;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayTab, isSelected && styles.dayTabActive]}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.75}
            >
              <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                {DAY_LABELS[day].slice(0, 3)}
              </Text>
              {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotActive]} />}
              {count > 0 && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isSelected && styles.countTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Periods */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.periodsList}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      >
        {dayEntries.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={`No classes on ${DAY_LABELS[selectedDay]}`}
            message={onAdd ? 'Add a period to get started.' : 'Enjoy your free day!'}
            actionLabel={onAdd ? 'Add Period' : undefined}
            onAction={onAdd}
          />
        ) : (
          dayEntries.map((entry) => (
            <PeriodCard
              key={entry._id}
              entry={entry}
              showTeacher={showTeacher}
              showClass={showClass}
              onDelete={onDelete}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  daySelector: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  dayTab: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 56,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayTabText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  dayTabTextActive: { color: colors.white },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
  todayDotActive: { backgroundColor: colors.white },
  countBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
  },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  countText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  countTextActive: { color: colors.white },
  periodsList: { padding: spacing[4], paddingBottom: spacing[10] },
  periodCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing[3],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeCol: {
    width: 56,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[1],
  },
  timeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
  timeLine: {
    width: 1,
    height: 12,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  deleteBtn: { padding: spacing[2], marginLeft: spacing[2] },
  periodBody: { flex: 1, padding: spacing[3] },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  subjectName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  subjectCode: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  periodMeta: { gap: spacing[1] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  metaText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
});
