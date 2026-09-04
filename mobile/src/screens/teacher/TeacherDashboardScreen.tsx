import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  StatusBar, TouchableOpacity, FlatList, Image, Modal,
  Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Loading } from '../../components/ui';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { fetchMyProfile, fetchMyClasses, fetchMyStudents } from '../../store/slices/teacherSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { TeacherStackParamList } from '../../navigation/types';
import { getIconBg, DEFAULT_ICON } from '../../constants/classIcons';

type NavProp = NativeStackNavigationProp<TeacherStackParamList>;
type TabName = 'Dashboard' | 'Schedule' | 'Classes' | 'Assignments' | 'Profile';

export const TeacherDashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const user = useAppSelector((s) => s.auth.user);
  const { myProfile, myClasses, myStudents, detailLoading } = useAppSelector((s) => s.teachers);

  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const [quickActionsOpen, setQuickActionsOpen] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const avatarRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMyClasses());
    dispatch(fetchMyStudents(undefined));
  }, [dispatch]);

  if (detailLoading && !myProfile) return <Loading fullScreen />;

  const totalStudents = myStudents.length;

  const openDropdown = () => {
    avatarRef.current?.measureInWindow((x, y, _w, h) => {
      setDropdownPos({ top: y + h + 6, right: 16 });
      setDropdownVisible(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  const closeDropdown = (cb?: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      setDropdownVisible(false);
      cb?.();
    });
  };

  const handleLogout = () => {
    closeDropdown(() => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', style: 'destructive', onPress: () => dispatch(logoutUser()) },
        ]
      );
    });
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'Classes') navigation.navigate('MyClasses');
    else if (tab === 'Assignments') navigation.navigate('AssignmentsList');
    else if (tab === 'Profile') navigation.navigate('TeacherProfile');
    else if (tab === 'Schedule') navigation.navigate('MyTimetable');
  };

  const tabs: { name: TabName; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid' },
    { name: 'Schedule', icon: 'calendar-outline', activeIcon: 'calendar' },
    { name: 'Classes', icon: 'reader-outline', activeIcon: 'reader' },
    { name: 'Assignments', icon: 'document-text-outline', activeIcon: 'document-text' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  const avatarUri = user?.profileImage ?? myProfile?.profileImage;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={styles.safe.backgroundColor} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.nameText}>{user?.name ?? 'Teacher'}</Text>
          </View>

          <TouchableOpacity ref={avatarRef} onPress={openDropdown} activeOpacity={0.85}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {(user?.name ?? 'T')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Dropdown Modal */}
        <Modal transparent visible={dropdownVisible} onRequestClose={() => closeDropdown()}>
          <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => closeDropdown()}>
            <Animated.View
              style={[styles.dropdownMenu, { top: dropdownPos.top, right: dropdownPos.right, opacity: fadeAnim }]}
            >
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => closeDropdown(() => navigation.navigate('TeacherProfile'))}
              >
                <Ionicons name="person-outline" size={16} color={colors.textPrimary} />
                <Text style={styles.dropdownItemText}>Profile</Text>
              </TouchableOpacity>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={16} color={colors.error} />
                <Text style={[styles.dropdownItemText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>

        {/* Today's Overview */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
            <Text style={styles.statLabel}>Total Classes:</Text>
            <Text style={styles.statValue}>{myClasses.length}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
            <Text style={styles.statLabel}>Total Students:</Text>
            <Text style={styles.statValue}>{totalStudents}</Text>
          </View>
        </View>

        {/* My Classes */}
        <Text style={styles.sectionTitle}>My Classes</Text>
        <FlatList
          data={myClasses}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.classesList}
          renderItem={({ item: ac }) => {
            const icon = ac.class.icon ?? DEFAULT_ICON;
            const iconBg = getIconBg(icon);
            const today = new Date().toISOString().split('T')[0];
            return (
              <TouchableOpacity
                style={styles.classCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('MarkAttendance', {
                  classId: ac.class._id,
                  sectionId: ac.section?._id,
                  academicYearId: ac.academicYear._id,
                  className: `${ac.class.name}${ac.section ? ` - ${ac.section.name}` : ''}`,
                  date: today,
                })}
              >
                <View style={[styles.classIconBox, { backgroundColor: iconBg }]}>
                  <Text style={styles.classEmoji}>{icon}</Text>
                </View>
                <Text style={styles.classNameText} numberOfLines={2}>
                  {ac.class.name}{ac.section ? `\n${ac.section.name}` : ''}
                </Text>
                <Text style={styles.classYear}>{ac.academicYear.name}</Text>
                <View style={styles.classFooter}>
                  <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.classFooterText}>1</Text>
                  <Ionicons name="people-outline" size={12} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                  <Text style={styles.classFooterText}>{totalStudents}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No classes assigned yet.</Text>}
        />

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <View style={styles.quickActionsHeader}>
            <View style={styles.plusBtn}>
              <Ionicons name="add" size={22} color={'#f3f5f6'} />
            </View>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <TouchableOpacity onPress={() => setQuickActionsOpen((v) => !v)}>
              <Ionicons
                name={quickActionsOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {quickActionsOpen && (
            <View style={styles.quickActionsBtns}>
              <TouchableOpacity
                style={styles.qaBtn}
                onPress={() => {
                  if (myClasses.length > 0) {
                    const ac = myClasses[0];
                    const today = new Date().toISOString().split('T')[0];
                    navigation.navigate('MarkAttendance', {
                      classId: ac.class._id,
                      sectionId: ac.section?._id,
                      academicYearId: ac.academicYear._id,
                      className: `${ac.class.name}${ac.section ? ` - ${ac.section.name}` : ''}`,
                      date: today,
                    });
                  }
                }}
              >
                <Text style={styles.qaBtnText}>Mark Attendance</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qaBtn} onPress={() => navigation.navigate('CreateAssignment')}>
                <Text style={styles.qaBtnText}>Add Assignment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qaBtn} onPress={() => navigation.navigate('StudyMaterialsList')}>
                <Text style={styles.qaBtnText}>Add Material</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
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
  safe: { flex: 1, backgroundColor: '#d4dae2' },
  scroll: { paddingBottom: 90 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[10],
    paddingBottom: spacing[4],
  },
  welcomeText: { fontSize: typography.fontSizes.base, color: colors.textSecondary },
  nameText: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.textPrimary },

  // Avatar
  avatarImage: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: '#6b6763',
    ...shadows.sm,
  },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  avatarInitial: { fontSize: 20, fontWeight: typography.fontWeights.bold, color: '#f3f5f6' },

  // Dropdown
  dropdownOverlay: { flex: 1 },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#e8e8d6',
    borderRadius: radii.lg,
    minWidth: 160,
    ...shadows.lg,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  dropdownItemText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  dropdownDivider: { height: 1, backgroundColor: colors.border },

  // Section title
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginHorizontal: spacing[2],
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing[3], marginHorizontal: spacing[2], marginBottom: spacing[4] },
  statCard: {
    flex: 1,
    backgroundColor: '#f3f5f6',
    borderRadius: radii.lg,
    padding: spacing[4],
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: typography.fontSizes['3xl'], fontWeight: typography.fontWeights.bold, color: colors.textPrimary },

  // Classes
  classesList: { paddingHorizontal: spacing[5], gap: spacing[3], paddingBottom: spacing[2] },
  classCard: {
    width: 150,
    backgroundColor: '#f3f5f6',
    borderRadius: radii.lg,
    padding: spacing[4],
    ...shadows.sm,
  },
  classIconBox: {
    width: 52, height: 52, borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[3],
  },
  classEmoji: { fontSize: 28 },
  classNameText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  classYear: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 4, marginBottom: spacing[3] },
  classFooter: { flexDirection: 'row', alignItems: 'center' },
  classFooterText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginLeft: 3 },
  emptyText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginLeft: spacing[2] },

  // Quick Actions
  quickActionsCard: {
    backgroundColor: '#f3f5f6',
    borderRadius: radii.xl,
    marginHorizontal: spacing[2],
    marginTop: spacing[4],
    padding: spacing[4],
    ...shadows.sm,
  },
  quickActionsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  plusBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.gray900,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionsTitle: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  quickActionsBtns: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[3] },
  qaBtn: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#f3f5f6',
  },
  qaBtnText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },

  // Bottom Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#f3f5f6',
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
