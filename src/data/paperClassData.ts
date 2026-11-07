export type UserRole = "guest" | "student" | "admin" | "superadmin";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  indexNo?: string;
  school?: string;
  batch?: string;
  email?: string;
}

// All demo/mock accounts removed - all user profiles are loaded dynamically from MySQL database
export const demoAccounts: {
  label: string;
  role: UserRole;
  description: string;
  user: AuthUser;
}[] = [];

export interface PaperStudentResult {
  id: string;
  rank: number;
  name: string;
  school: string;
  indexNo: string;
  part1Score: number; // MCQ out of 40
  part2Score: number; // Structured essay out of 60
  totalScore: number; // Total out of 100
  grade: "A*" | "A" | "B" | "C";
  achievement?: string;
  avatarInitials: string;
  avatarImage?: string;
}

export interface PaperClassItem {
  id: string;
  paperNumber: string;
  paperCode: string;
  title: string;
  batch: "2025 O/L Speed Revision" | "2026 O/L Paper Class" | "2027 O/L Foundation" | string;
  term: string;
  examDate: string;
  totalCandidates: number;
  highestMark: number;
  averageMark: number;
  passPercentage: number;
  topics: string[];
  durationMinutes: number;
  topper?: {
    name: string;
    school: string;
    indexNo: string;
    totalScore: number;
    part1Score: number;
    part2Score: number;
    badge: string;
    quote?: string;
    avatarImage?: string;
  };
  scoreDistribution?: {
    ninetyPlus: number;
    eightyToEightyNine: number;
    seventyToSeventyNine: number;
    belowSeventy: number;
  };
  results: PaperStudentResult[];
}

// All hardcoded mock papers removed - all papers & candidate marks are loaded from MySQL database
export const paperClassList: PaperClassItem[] = [];

export interface PaperSummaryStat {
  paperNumber: string;
  paperCode: string;
  title: string;
  highestMark: number;
  highestScorerName: string;
  highestScorerSchool: string;
  averageMark: number;
  totalStudents: number;
}

export const paperSummaryStats: PaperSummaryStat[] = [];
