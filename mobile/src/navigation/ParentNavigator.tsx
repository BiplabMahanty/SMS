import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParentStackParamList } from './types';
import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { ChildTimetableScreen } from '../screens/parent/ChildTimetableScreen';
import { ChildAttendanceScreen } from '../screens/parent/ChildAttendanceScreen';

const Stack = createNativeStackNavigator<ParentStackParamList>();

export const ParentNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
    <Stack.Screen name="ChildTimetable" component={ChildTimetableScreen} />
    <Stack.Screen name="ChildAttendance" component={ChildAttendanceScreen} />
  </Stack.Navigator>
);
