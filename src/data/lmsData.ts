import { PaperStudentResult, paperClassList } from "./paperClassData";

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
  {
    id: "std-001",
    fullName: "Senuri Fernando",
    phone: "0771234567",
    password: "pass123",
    role: "student",
    indexNo: "53914864",
    batch: "2026 O/L Speed Revision & Paper Class",
    school: "Visakha Vidyalaya, Colombo",
    parentPhone: "0777654321",
    avatarUrl: "/images/top_student_rank1.jpg",
    enrolledDate: "2025-01-10",
    status: "active",
  },
  {
    id: "std-002",
    fullName: "Kavindu Wickramasinghe",
    phone: "0712345678",
    password: "pass123",
    role: "student",
    indexNo: "53914865",
    batch: "2026 O/L Speed Revision & Paper Class",
    school: "Dharmaraja College, Kandy",
    parentPhone: "0717654321",
    avatarUrl: "/images/top_student_rank2.jpg",
    enrolledDate: "2025-01-15",
    status: "active",
  },
  {
    id: "std-003",
    fullName: "Dinithi Jayasuriya",
    phone: "0783456789",
    password: "pass123",
    role: "student",
    indexNo: "53914866",
    batch: "2027 O/L Commerce Foundation",
    school: "Devi Balika Vidyalaya, Colombo",
    parentPhone: "0787654321",
    enrolledDate: "2025-02-01",
    status: "active",
  },
  {
    id: "std-004",
    fullName: "Sachithra Weerasinghe",
    phone: "0754567890",
    password: "pass123",
    role: "student",
    indexNo: "53914867",
    batch: "2026 O/L Speed Revision & Paper Class",
    school: "Ananda College, Colombo",
    parentPhone: "0757654321",
    enrolledDate: "2025-01-12",
    status: "active",
  },
];

export const initialLmsPapers: LMSPaper[] = [
  {
    id: "paper-01",
    paperNumber: 1,
    title: "Accounting Fundamentals & Ledger Balancing",
    batch: "2026 O/L Speed Revision & Paper Class",
    subject: "Business & Accounting Studies",
    month: "January",
    year: 2026,
    totalMarks: 100,
    durationMinutes: 120,
    status: "published",
    results: paperClassList[0]?.results || [],
    studentScore: {
      part1: 38,
      part2: 54,
      total: 92,
      grade: "A",
      rank: 2,
    },
  },
  {
    id: "paper-02",
    paperNumber: 2,
    title: "Cash Book, Bank Reconciliation & Petty Cash",
    batch: "2026 O/L Speed Revision & Paper Class",
    subject: "Business & Accounting Studies",
    month: "February",
    year: 2026,
    totalMarks: 100,
    durationMinutes: 120,
    status: "published",
    results: paperClassList[1]?.results || [],
    studentScore: {
      part1: 36,
      part2: 52,
      total: 88,
      grade: "A",
      rank: 5,
    },
  },
  {
    id: "paper-03",
    paperNumber: 3,
    title: "Trial Balance Errors & Suspense Account Drill",
    batch: "2026 O/L Speed Revision & Paper Class",
    subject: "Business & Accounting Studies",
    month: "March",
    year: 2026,
    totalMarks: 100,
    durationMinutes: 120,
    status: "published",
    results: paperClassList[2]?.results || [],
    studentScore: {
      part1: 39,
      part2: 56,
      total: 95,
      grade: "A",
      rank: 1,
    },
  },
  {
    id: "paper-04",
    paperNumber: 4,
    title: "Final Accounts of Sole Proprietorship (Trading & P/L)",
    batch: "2026 O/L Speed Revision & Paper Class",
    subject: "Business & Accounting Studies",
    month: "April",
    year: 2026,
    totalMarks: 100,
    durationMinutes: 120,
    status: "upcoming",
    results: [],
  },
];

export const initialLmsQuizzes: LMSQuiz[] = [
  {
    id: "quiz-01",
    title: "Speed MCQ Challenge: Business Environment & Stakeholders",
    subject: "Business Studies",
    batch: "2026/2027 O/L Commerce",
    durationMinutes: 15,
    questions: [
      {
        id: "q1",
        question: "Which of the following is considered an internal stakeholder of a business?",
        options: ["Suppliers", "Shareholders/Owners", "Government Tax Authority", "Customers"],
        correctAnswer: 1,
        explanation: "Owners and employees operate inside the organization, making them internal stakeholders.",
      },
      {
        id: "q2",
        question: "What is the primary objective of a commercial enterprise?",
        options: ["Providing public social welfare", "Profit maximization through value creation", "Controlling inflation", "Collecting government tariffs"],
        correctAnswer: 1,
        explanation: "Commercial entities operate primarily to earn profits while delivering goods and services.",
      },
      {
        id: "q3",
        question: "A company that limits shareholder liability to their unpaid share value is known as a:",
        options: ["Sole proprietorship", "Partnership", "Limited Liability Company (PLC/LTD)", "Cooperative Society"],
        correctAnswer: 2,
        explanation: "In limited liability entities, personal assets of shareholders are legally protected.",
      },
      {
        id: "q4",
        question: "The basic accounting equation is represented as:",
        options: ["Assets = Liabilities - Equity", "Assets = Liabilities + Equity", "Equity = Assets + Liabilities", "Liabilities = Assets + Equity"],
        correctAnswer: 1,
        explanation: "Assets represent what the business owns, funded either by borrowings (Liabilities) or owners (Equity).",
      },
      {
        id: "q5",
        question: "When goods are bought on credit, which journal book records the primary entry?",
        options: ["Sales Journal", "Purchases Journal", "Cash Book", "Petty Cash Book"],
        correctAnswer: 1,
        explanation: "Credit purchases of merchandise inventory are recorded first in the Purchases Journal.",
      },
    ],
  },
  {
    id: "quiz-02",
    title: "Accounting Quick Drill: Double Entry & Ledger Rules",
    subject: "Accounting Studies",
    batch: "2026/2027 O/L Commerce",
    durationMinutes: 10,
    questions: [
      {
        id: "q2-1",
        question: "An increase in an Asset account is recorded as a:",
        options: ["Credit", "Debit", "Footnote only", "Negative adjustment"],
        correctAnswer: 1,
        explanation: "Under double-entry conventions, asset and expense increases are recorded on the debit side.",
      },
      {
        id: "q2-2",
        question: "Rent paid by cash Rs. 25,000 results in:",
        options: ["Debit Cash, Credit Rent", "Debit Rent Expense, Credit Cash", "Debit Capital, Credit Cash", "Debit Rent, Credit Landlord"],
        correctAnswer: 1,
        explanation: "Rent is an expense (debit increase) and Cash is an asset decreasing (credit decrease).",
      },
      {
        id: "q2-3",
        question: "Which of the following errors is NOT disclosed by a Trial Balance?",
        options: ["Arithmetic casting error in ledger", "Single sided entry error", "Compensating error of equal magnitude", "Entering different amounts on debit and credit"],
        correctAnswer: 2,
        explanation: "Compensating errors cancel each other out on both debit and credit sides.",
      },
    ],
  },
];

export const initialLmsEvaluations: LMSEvaluation[] = [
  {
    id: "eval-01",
    studentId: "std-001",
    paperOrTerm: "Paper Class 01-03 Cumulative Review",
    date: "2026-03-25",
    attendanceRate: 98,
    strengths: [
      "Exceptional accuracy in Part 1 multiple choice questions (average 38/40).",
      "Very neat and structured balance sheet layouts.",
      "Clear explanation in 5-mark business studies essay answers.",
    ],
    weaknesses: [
      "Occasionally forgets to write proper narrative ledger descriptions.",
      "Needs slight speed optimization when balancing 10-column financial statements.",
    ],
    teacherRemarks:
      "Senuri is demonstrating consistent A-grade caliber. Her attention to detail in ledger accounts and accounting definitions is commendable. Keep this momentum for the final national exam!",
    recommendedAction: "Practice 1 timed 20-mark final account essay every weekend under 25-minute examination conditions.",
    performanceGrade: "Outstanding",
  },
];

