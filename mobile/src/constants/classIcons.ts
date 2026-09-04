export interface SubjectIcon {
  icon: string;
  label: string;
  bg: string;
}

export const SUBJECT_ICONS: SubjectIcon[] = [
  { icon: '🧮', label: 'Mathematics', bg: '#EEF2FF' },
  { icon: '⚛️', label: 'Physics', bg: '#F0FDF4' },
  { icon: '🧪', label: 'Chemistry', bg: '#FFF7ED' },
  { icon: '🧬', label: 'Biology', bg: '#F0FDF4' },
  { icon: '🌍', label: 'Geography', bg: '#F0F9FF' },
  { icon: '📜', label: 'History', bg: '#FFFBEB' },
  { icon: '📖', label: 'Literature', bg: '#FDF4FF' },
  { icon: '✍️', label: 'English', bg: '#EFF6FF' },
  { icon: '💻', label: 'Computer Science', bg: '#F0F9FF' },
  { icon: '🎨', label: 'Art', bg: '#FFF1F2' },
  { icon: '🎵', label: 'Music', bg: '#FDF4FF' },
  { icon: '⚽', label: 'Physical Education', bg: '#F0FDF4' },
  { icon: '🌐', label: 'Social Studies', bg: '#ECFDF5' },
  { icon: '💰', label: 'Economics', bg: '#FFFBEB' },
  { icon: '🏛️', label: 'Civics', bg: '#EFF6FF' },
  { icon: '🔭', label: 'Astronomy', bg: '#EEF2FF' },
  { icon: '🗣️', label: 'Language', bg: '#FFF7ED' },
  { icon: '📐', label: 'Geometry', bg: '#F5F3FF' },
  { icon: '🧠', label: 'Psychology', bg: '#FDF4FF' },
  { icon: '📊', label: 'Statistics', bg: '#EFF6FF' },
];

export const DEFAULT_ICON = '📚';
export const DEFAULT_BG = '#F3F4F6';

export function getIconBg(icon: string): string {
  return SUBJECT_ICONS.find((s) => s.icon === icon)?.bg ?? DEFAULT_BG;
}
