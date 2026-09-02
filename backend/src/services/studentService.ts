import { Student } from '../models/Student';

export const generateStudentId = async (): Promise<string> => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Student.countDocuments();
  const padded = String(count + 1).padStart(4, '0');
  return `STU${year}${padded}`;
};
