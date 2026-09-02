import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import teacherReducer from './slices/teacherSlice';
import subjectReducer from './slices/subjectSlice';
import timetableReducer from './slices/timetableSlice';
import attendanceReducer from './slices/attendanceSlice';
import assignmentReducer from './slices/assignmentSlice';
import classReducer from './slices/classSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    students: studentReducer,
    teachers: teacherReducer,
    subjects: subjectReducer,
    timetable: timetableReducer,
    attendance: attendanceReducer,
    assignments: assignmentReducer,
    classes: classReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
