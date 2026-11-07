import { PaperStudentResult } from "./paperClassData";

export type { PaperStudentResult };
export type UserRole = "student" | "admin";

export interface LMSUser {
  id: string;
  fullName: string;
  phone: string;
  password?: string;
  role: UserRole;
  indexNo?: string;
  batch?: string;
  school?: string;
  parentPhone?: string;
  avatarUrl?: string;
  enrolledDate: string;
  status: "active" | "inactive" | "pending";
}

export interface LMSPaper {
  id: string;
  paperNumber: number;
  title: string;
  batch: string;
  subject: string;
  month: string;
  year: number;
  totalMarks: number;
  durationMinutes: number;
  pdfUrl?: string;
  markingSchemeUrl?: string;
  status: "published" | "upcoming" | "grading";
  results?: PaperStudentResult[];
  studentScore?: {
    part1: number;
    part2: number;
    total: number;
    grade: "A" | "B" | "C" | "S" | "F";
    rank: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export interface LMSQuiz {
  id: string;
  title: string;
  subject: string;
  batch: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  completed?: boolean;
  score?: number;
  totalMarks?: number;
}

export interface LMSEvaluation {
  id: string;
  studentId: string;
  paperOrTerm: string;
  date: string;
  attendanceRate: number; // percentage
  strengths: string[];
  weaknesses: string[];
  teacherRemarks: string;
  recommendedAction: string;
  performanceGrade: "Outstanding" | "Very Good" | "Good" | "Needs Focus";
}

/**
 * System fallback users. Only the Lead Administrator account is seeded by default.
 * All student accounts are retrieved dynamically from the MySQL database (users table).
 */
export const initialLmsUsers: LMSUser[] = [
  {
    id: "admin-01",
    fullName: "Evon Aravinda (Lead Educator & Admin)",
    phone: "0719998877",
    password: "admin123",
    role: "admin",
    batch: "All Batches",
    school: "Main Faculty",
    avatarUrl: "/images/educator.jpg",
    enrolledDate: "2024-01-01",
    status: "active",
  },
];

/**
 * Empty fallback papers. All model papers & exam results are retrieved directly
 * from the MySQL database (papers & paper_results tables).
 */
export const initialLmsPapers: LMSPaper[] = [];

/**
 * Empty fallback quizzes. All quizzes and question banks are retrieved directly
 * from the MySQL database (quizzes & quiz_questions tables).
 */
export const initialLmsQuizzes: LMSQuiz[] = [];

/**
 * Empty fallback evaluations. All teacher evaluations are retrieved directly
 * from the MySQL database (evaluations table).
 */
export const initialLmsEvaluations: LMSEvaluation[] = [];
