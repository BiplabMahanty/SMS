import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudentStackParamList } from './types';
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { MyTimetableStudentScreen } from '../screens/student/MyTimetableStudentScreen';
import { MyAttendanceScreen } from '../screens/student/MyAttendanceScreen';
import { MyAssignmentsScreen } from '../screens/student/MyAssignmentsScreen';
import { AssignmentDetailScreen } from '../screens/teacher/AssignmentDetailScreen';
import { StudyMaterialsScreen } from '../screens/teacher/StudyMaterialsScreen';

const Stack = createNativeStackNavigator<StudentStackParamList>();

export const StudentNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
    <Stack.Screen name="MyTimetable" component={MyTimetableStudentScreen} />
    <Stack.Screen name="MyAttendance" component={MyAttendanceScreen} />
    <Stack.Screen name="MyAssignments" component={MyAssignmentsScreen} />
    <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
    <Stack.Screen name="StudyMaterials" component={StudyMaterialsScreen} />
  </Stack.Navigator>
);
