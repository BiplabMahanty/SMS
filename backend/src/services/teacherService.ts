import { Teacher, ITeacher } from '../models/Teacher';

export const generateTeacherId = async (): Promise<string> => {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Teacher.countDocuments();
  const padded = String(count + 1).padStart(4, '0');
  return `TCH${year}${padded}`;
};

export const getTeacherByUserId = async (userId: string): Promise<ITeacher | null> => {
  return Teacher.findOne({ user: userId });
};
