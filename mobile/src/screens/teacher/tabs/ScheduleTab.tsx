import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppStore';
import { fetchMyTimetableTeacher } from '../../../store/slices/timetableSlice';
import { TimetableEntry, DayOfWeek, DAYS_OF_WEEK } from '../../../types/timetable';
import { EmptyState } from '../../../components/ui';

const SUBJECT_EMOJI: Record<string, string> = {
  physics: '⚛️', math: '🧮', mathematics: '🧮', chemistry: '🧪',
  biology: '🌿', english: '📖', history: '🏛️', geography: '🌍',
  computer: '💻', art: '🎨', music: '🎵', pe: '⚽', homeroom: '👥',
};
const CARD_COLORS = ['#2563EB', '#F59E0B', '#7C3AED', '#9CA3AF'];

function getSubjectEmoji(name: string) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(SUBJECT_EMOJI)) {
    if (lower.includes(key)) return SUBJECT_EMOJI[key];
  }
  return '📚';
}

function getWeekDays(): { label: string; dayNum: number; dayOfWeek: DayOfWeek; date: Date }[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return DAYS_OF_WEEK.map((dow, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label: dow.slice(0, 3).charAt(0) + dow.slice(1, 3).toLowerCase(), dayNum: d.getDate(), dayOfWeek: dow, date: d };
  });
}

function getTodayDow(): DayOfWeek {
  const map: Record<number, DayOfWeek> = { 0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
  return map[new Date().getDay()];
}

const ScheduleCard: React.FC<{ entry: TimetableEntry; index: number }> = ({ entry, index }) => {
  const accent = CARD_COLORS[index % CARD_COLORS.length];
  const emoji = getSubjectEmoji(entry.subject.name);
  const location = entry.room ? (entry.subject.name.toLowerCase().includes('lab') ? `Lab ${entry.room}` : `Room ${entry.room}`) : null;
  return (
    <View style={styles.cardRow}>
      <View style={styles.dotCol}><View style={styles.dot} /></View>
      <View style={[styles.card, { borderLeftColor: accent }]}>
        <Text style={styles.cardTime}>{entry.startTime} - {entry.endTime}</Text>
        <View style={styles.cardBody}>
          <View style={[styles.emojiBox, { backgroundColor: accent + '18' }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardSubject} numberOfLines={1}>{entry.subject.name}</Text>
            <View style={styles.classRow}>
              <Ionicons name="school-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.classText} numberOfLines={1}>{entry.class.name}{entry.section ? `  ·  ${entry.section.name}` : ''}</Text>
            </View>
            {location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.locationText}>{location}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export const ScheduleTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myEntries, loading } = useAppSelector((s) => s.timetable);
  const weekDays = getWeekDays();
  const todayDow = getTodayDow();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDow);

  const load = () => { dispatch(fetchMyTimetableTeacher({})); };
  useEffect(() => { load(); }, []);

  const dayEntries = [...myEntries].filter((e) => e.dayOfWeek === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Schedule.</Text>
      <View style={styles.weekStrip}>
        {weekDays.map(({ label, dayNum, dayOfWeek }) => {
          const isSelected = dayOfWeek === selectedDay;
          const isToday = dayOfWeek === todayDow;
          const count = myEntries.filter((e) => e.dayOfWeek === dayOfWeek).length;
          return (
            <TouchableOpacity key={dayOfWeek} style={[styles.dayCell, isSelected && styles.dayCellActive]} onPress={() => setSelectedDay(dayOfWeek)} activeOpacity={0.75}>
              {count > 0 && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                  <Text style={[styles.countBadgeText, isSelected && styles.countBadgeTextActive]}>{count}</Text>
                </View>
              )}
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{label}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumActive, isToday && !isSelected && styles.dayNumToday]}>{dayNum}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {dayEntries.length === 0
          ? <EmptyState icon="calendar-outline" title="No classes" message="Enjoy your free day!" />
          : dayEntries.map((entry, i) => <ScheduleCard key={entry._id} entry={entry} index={i} />)
        }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.textPrimary, paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[3] },
  weekStrip: { flexDirection: 'row', paddingHorizontal: spacing[4], paddingBottom: spacing[3], gap: 4 },
  dayCell: { flex: 1, alignItems: 'center', paddingVertical: spacing[2], borderRadius: radii.lg, position: 'relative' },
  dayCellActive: { backgroundColor: colors.primary, ...shadows.sm },
  countBadge: { position: 'absolute', top: 3, left: 3, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  countBadgeActive: { backgroundColor: colors.white },
  countBadgeText: { fontSize: 9, fontWeight: typography.fontWeights.bold, color: colors.white, lineHeight: 12 },
  countBadgeTextActive: { color: colors.primary },
  dayLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, fontWeight: typography.fontWeights.medium },
  dayLabelActive: { color: colors.white },
  dayNum: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginTop: 2 },
  dayNumActive: { color: colors.white },
  dayNumToday: { color: colors.primary },
  list: { paddingHorizontal: spacing[4], paddingBottom: 100, paddingTop: spacing[2] },
  cardRow: { flexDirection: 'row', marginBottom: spacing[3], alignItems: 'center' },
  dotCol: { width: 20, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray300 },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, borderLeftWidth: 4, padding: spacing[3], ...shadows.sm },
  cardTime: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginBottom: spacing[2] },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  emojiBox: { width: 52, height: 52, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emoji: { fontSize: 28 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardSubject: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.textPrimary, marginBottom: 4 },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  classText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: typography.fontWeights.medium, flex: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
});
