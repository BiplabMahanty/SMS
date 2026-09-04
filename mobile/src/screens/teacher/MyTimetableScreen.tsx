import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, ScrollView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyTimetableTeacher } from '../../store/slices/timetableSlice';
import { TimetableEntry, DayOfWeek, DAYS_OF_WEEK } from '../../types/timetable';
import { TeacherStackParamList } from '../../navigation/types';
import { EmptyState } from '../../components/ui';

type NavProp = NativeStackNavigationProp<TeacherStackParamList>;
type TabName = 'Dashboard' | 'Schedule' | 'Classes' | 'Assignments' | 'Profile';

// Map subject names to emojis
const SUBJECT_EMOJI: Record<string, string> = {
  physics: '⚛️',
  math: '🧮',
  mathematics: '🧮',
  chemistry: '🧪',
  biology: '🌿',
  english: '📖',
  history: '🏛️',
  geography: '🌍',
  computer: '💻',
  art: '🎨',
  music: '🎵',
  pe: '⚽',
  homeroom: '👥',
};

const CARD_COLORS = ['#2563EB', '#F59E0B', '#7C3AED', '#9CA3AF'];

function getSubjectEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(SUBJECT_EMOJI)) {
    if (lower.includes(key)) return SUBJECT_EMOJI[key];
  }
  return '📚';
}

function getCardColor(index: number): string {
  return CARD_COLORS[index % CARD_COLORS.length];
}

// Build 7-day week strip starting from Monday of current week
function getWeekDays(): { label: string; dayNum: number; dayOfWeek: DayOfWeek; date: Date }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return DAYS_OF_WEEK.map((dow, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: dow.slice(0, 3).charAt(0) + dow.slice(1, 3).toLowerCase(),
      dayNum: d.getDate(),
      dayOfWeek: dow,
      date: d,
    };
  });
}

function getTodayDayOfWeek(): DayOfWeek {
  const map: Record<number, DayOfWeek> = {
    0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
    4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
  };
  return map[new Date().getDay()];
}

const ScheduleCard: React.FC<{ entry: TimetableEntry; index: number }> = ({ entry, index }) => {
  const accentColor = getCardColor(index);
  const emoji = getSubjectEmoji(entry.subject.name);
  const location = entry.room
    ? (entry.subject.name.toLowerCase().includes('lab') ? `Lab ${entry.room}` : `Room ${entry.room}`)
    : null;

  return (
    <View style={styles.cardRow}>
      <View style={styles.dotCol}>
        <View style={styles.dot} />
      </View>
      <View style={[styles.card, { borderLeftColor: accentColor }]}>
        {/* Time */}
        <Text style={styles.cardTime}>{entry.startTime} - {entry.endTime}</Text>

        {/* Body: emoji + full-width info */}
        <View style={styles.cardBody}>
          <View style={[styles.emojiBox, { backgroundColor: accentColor + '18' }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          <View style={styles.cardInfo}>
            {/* Subject name */}
            <Text style={styles.cardSubject} numberOfLines={1}>{entry.subject.name}</Text>

            {/* Class + Section on same row */}
            <View style={styles.classRow}>
              <Ionicons name="school-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.classText} numberOfLines={1}>
                {entry.class.name}{entry.section ? `  ·  ${entry.section.name}` : ''}
              </Text>
            </View>

            {/* Room */}
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

export const MyTimetableScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { myEntries, loading } = useAppSelector((s) => s.timetable);

  const weekDays = getWeekDays();
  const todayDow = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDow);

  const load = () => { dispatch(fetchMyTimetableTeacher({})); };
  useEffect(() => { load(); }, []);

  const dayEntries = [...myEntries]
    .filter((e) => e.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const tabs: { name: TabName; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid' },
    { name: 'Schedule', icon: 'calendar-outline', activeIcon: 'calendar' },
    { name: 'Classes', icon: 'reader-outline', activeIcon: 'reader' },
    { name: 'Assignments', icon: 'document-text-outline', activeIcon: 'document-text' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  const handleTabPress = (tab: TabName) => {
    if (tab === 'Dashboard') navigation.navigate('TeacherDashboard');
    else if (tab === 'Classes') navigation.navigate('MyClasses');
    else if (tab === 'Assignments') navigation.navigate('AssignmentsList');
    else if (tab === 'Profile') navigation.navigate('TeacherProfile');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF2F7" />

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>My Schedule.</Text>
      </View>

      {/* Week strip */}
      <View style={styles.weekStrip}>
        {weekDays.map(({ label, dayNum, dayOfWeek }) => {
          const isSelected = dayOfWeek === selectedDay;
          const isToday = dayOfWeek === todayDow;
          const count = myEntries.filter((e) => e.dayOfWeek === dayOfWeek).length;
          return (
            <TouchableOpacity
              key={dayOfWeek}
              style={[styles.dayCell, isSelected && styles.dayCellActive]}
              onPress={() => setSelectedDay(dayOfWeek)}
              activeOpacity={0.75}
            >
              {count > 0 && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                  <Text style={[styles.countBadgeText, isSelected && styles.countBadgeTextActive]}>{count}</Text>
                </View>
              )}
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{label}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumActive, isToday && !isSelected && styles.dayNumToday]}>
                {dayNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Schedule list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {dayEntries.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No classes" message="Enjoy your free day!" />
        ) : (
          dayEntries.map((entry, i) => (
            <ScheduleCard key={entry._id} entry={entry} index={i} />
          ))
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.name === 'Schedule';
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.name}</Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EEF2F7' },

  titleRow: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[3],
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },

  // Week strip
  weekStrip: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: 4,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countBadgeActive: { backgroundColor: colors.white },
  countBadgeText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: colors.white,
    lineHeight: 12,
  },
  countBadgeTextActive: { color: colors.primary },
  dayCellActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  dayLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  dayLabelActive: { color: colors.white },
  dayNum: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  dayNumActive: { color: colors.white },
  dayNumToday: { color: colors.primary },

  // List
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing[4], paddingBottom: 100, paddingTop: spacing[2] },

  // Card row with dot
  cardRow: { flexDirection: 'row', marginBottom: spacing[3], alignItems: 'center' },
  dotCol: { width: 20, alignItems: 'center' },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.gray300,
  },

  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    padding: spacing[3],
    ...shadows.sm,
  },
  cardTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing[2],
  },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  emojiBox: {
    width: 52, height: 52, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: 28 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardSubject: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  classText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },

  // Bottom Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing[4],
    paddingTop: spacing[2],
    ...shadows.md,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabLabel: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 3 },
  tabLabelActive: { color: colors.primary, fontWeight: typography.fontWeights.semibold },
  tabIndicator: {
    position: 'absolute',
    bottom: -spacing[2],
    width: 24, height: 3,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
});
