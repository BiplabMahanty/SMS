export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  AdminSignup: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  StudentsList: undefined;
  StudentDetails: { studentId: string };
  AddStudent: undefined;
  EditStudent: { studentId: string };
  TeachersList: undefined;
  TeacherDetails: { teacherId: string };
  AddTeacher: undefined;
  EditTeacher: { teacherId: string };
  SubjectsList: undefined;
  AddSubject: undefined;
  EditSubject: { subjectId: string };
  ClassesList: undefined;
  AddEditClass: { classId?: string; className?: string; academicYearId?: string } | undefined;
  SectionsList: { classId: string; className: string };
  AddEditSection: { classId: string; academicYearId: string; sectionId?: string; sectionName?: string };
  AcademicYears: undefined;
  AssignTeacher: undefined;
  Timetable: undefined;
  CreateTimetable: undefined;
  AttendanceReport: { classId: string; sectionId?: string; academicYearId: string; className: string };
  AttendanceClassPicker: undefined;
};

export type TeacherStackParamList = {
  TeacherDashboard: undefined;
  MyClasses: undefined;
  MyStudents: undefined;
  TeacherProfile: undefined;
  MarkAttendance: { classId: string; sectionId?: string; academicYearId: string; className: string; date: string };
  AttendanceHistory: { classId: string; sectionId?: string; academicYearId: string; className: string };
  AssignmentDetail: { assignmentId: string };
  CreateAssignment: undefined;
  AssignmentSubmissions: { assignmentId: string; title: string };
  StudyMaterialsList: undefined;
};

export type StudentStackParamList = {
  StudentDashboard: undefined;
  MyTimetable: undefined;
  MyAttendance: undefined;
  MyAssignments: undefined;
  AssignmentDetail: { assignmentId: string };
  StudyMaterials: undefined;
};

export type ParentStackParamList = {
  ParentDashboard: undefined;
  ChildTimetable: { studentId: string; studentName: string };
  ChildAttendance: { studentId: string; studentName: string };
};
