export interface Attachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  class: { _id: string; name: string };
  section?: { _id: string; name: string };
  subject?: { _id: string; name: string };
  academicYear: { _id: string; name: string };
  teacher: { _id: string; name: string; teacherId: string };
  dueDate: string;
  totalMarks?: number;
  attachments: Attachment[];
  submission?: AssignmentSubmission | null;
  createdAt: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string;
  student: { _id: string; name: string; studentId: string; rollNumber: string };
  status: 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';
  attachments: Attachment[];
  note?: string;
  marks?: number;
  feedback?: string;
  submittedAt: string;
}

export interface StudyMaterial {
  _id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'OTHER';
  class: { _id: string; name: string };
  section?: { _id: string; name: string };
  subject?: { _id: string; name: string };
  academicYear: { _id: string; name: string };
  uploadedBy: { _id: string };
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt: string;
}
