import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from './types';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { StudentsListScreen } from '../screens/admin/StudentsListScreen';
import { StudentDetailsScreen } from '../screens/admin/StudentDetailsScreen';
import { AddStudentScreen } from '../screens/admin/AddStudentScreen';
import { EditStudentScreen } from '../screens/admin/EditStudentScreen';
import { TeachersListScreen } from '../screens/admin/TeachersListScreen';
import { TeacherDetailsScreen } from '../screens/admin/TeacherDetailsScreen';
import { AddTeacherScreen } from '../screens/admin/AddTeacherScreen';
import { EditTeacherScreen } from '../screens/admin/EditTeacherScreen';
import { SubjectsListScreen } from '../screens/admin/SubjectsListScreen';
import { AddSubjectScreen } from '../screens/admin/AddSubjectScreen';
import { EditSubjectScreen } from '../screens/admin/EditSubjectScreen';
import { ClassesListScreen } from '../screens/admin/ClassesListScreen';
import { AddEditClassScreen } from '../screens/admin/AddEditClassScreen';
import { SectionsListScreen } from '../screens/admin/SectionsListScreen';
import { AddEditSectionScreen } from '../screens/admin/AddEditSectionScreen';
import { AssignTeacherScreen } from '../screens/admin/AssignTeacherScreen';
import { AcademicYearsScreen } from '../screens/admin/AcademicYearsScreen';
import { TimetableScreen } from '../screens/admin/TimetableScreen';
import { CreateTimetableScreen } from '../screens/admin/CreateTimetableScreen';
import { AttendanceReportScreen } from '../screens/admin/AttendanceReportScreen';
import { AttendanceClassPickerScreen } from '../screens/admin/AttendanceClassPickerScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="StudentsList" component={StudentsListScreen} />
    <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
    <Stack.Screen name="AddStudent" component={AddStudentScreen} />
    <Stack.Screen name="EditStudent" component={EditStudentScreen} />
    <Stack.Screen name="TeachersList" component={TeachersListScreen} />
    <Stack.Screen name="TeacherDetails" component={TeacherDetailsScreen} />
    <Stack.Screen name="AddTeacher" component={AddTeacherScreen} />
    <Stack.Screen name="EditTeacher" component={EditTeacherScreen} />
    <Stack.Screen name="SubjectsList" component={SubjectsListScreen} />
    <Stack.Screen name="AddSubject" component={AddSubjectScreen} />
    <Stack.Screen name="EditSubject" component={EditSubjectScreen} />
    <Stack.Screen name="ClassesList" component={ClassesListScreen} />
    <Stack.Screen name="AddEditClass" component={AddEditClassScreen} />
    <Stack.Screen name="SectionsList" component={SectionsListScreen} />
    <Stack.Screen name="AddEditSection" component={AddEditSectionScreen} />
    <Stack.Screen name="AssignTeacher" component={AssignTeacherScreen} />
    <Stack.Screen name="AcademicYears" component={AcademicYearsScreen} />
    <Stack.Screen name="Timetable" component={TimetableScreen} />
    <Stack.Screen name="CreateTimetable" component={CreateTimetableScreen} />
    <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} />
    <Stack.Screen name="AttendanceClassPicker" component={AttendanceClassPickerScreen} />
  </Stack.Navigator>
);
