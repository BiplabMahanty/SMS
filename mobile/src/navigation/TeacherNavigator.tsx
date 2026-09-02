import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TeacherStackParamList } from './types';
import { TeacherDashboardScreen } from '../screens/teacher/TeacherDashboardScreen';
import { MyClassesScreen } from '../screens/teacher/MyClassesScreen';
import { MyStudentsScreen } from '../screens/teacher/MyStudentsScreen';
import { TeacherProfileScreen } from '../screens/teacher/TeacherProfileScreen';
import { MyTimetableScreen } from '../screens/teacher/MyTimetableScreen';
import { MarkAttendanceScreen } from '../screens/teacher/MarkAttendanceScreen';
import { AttendanceHistoryScreen } from '../screens/teacher/AttendanceHistoryScreen';
import { AssignmentsListScreen } from '../screens/teacher/AssignmentsListScreen';
import { CreateAssignmentScreen } from '../screens/teacher/CreateAssignmentScreen';
import { AssignmentDetailScreen } from '../screens/teacher/AssignmentDetailScreen';
import { AssignmentSubmissionsScreen } from '../screens/teacher/AssignmentSubmissionsScreen';
import { StudyMaterialsScreen } from '../screens/teacher/StudyMaterialsScreen';

const Stack = createNativeStackNavigator<TeacherStackParamList>();

export const TeacherNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
    <Stack.Screen name="MyClasses" component={MyClassesScreen} />
    <Stack.Screen name="MyStudents" component={MyStudentsScreen} />
    <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
    <Stack.Screen name="MyTimetable" component={MyTimetableScreen} />
    <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
    <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
    <Stack.Screen name="AssignmentsList" component={AssignmentsListScreen} />
    <Stack.Screen name="CreateAssignment" component={CreateAssignmentScreen} />
    <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
    <Stack.Screen name="AssignmentSubmissions" component={AssignmentSubmissionsScreen} />
    <Stack.Screen name="StudyMaterialsList" component={StudyMaterialsScreen} />
  </Stack.Navigator>
);
