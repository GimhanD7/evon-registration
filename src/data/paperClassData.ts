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

export const demoAccounts: {
  label: string;
  role: UserRole;
  description: string;
  user: AuthUser;
}[] = [
  {
    label: "Student: Tenushi Pamodya (Rank 5)",
    role: "student",
    description: "Sumedha College • Shows only her own marks",
    user: {
      id: "std-53914864",
      name: "Tenushi Pamodya",
      role: "student",
      indexNo: "53914864",
      school: "Sumedha College, Gampaha",
      batch: "2025 O/L Speed Revision",
    },
  },
  {
    label: "Student: Linuka Damsanda (Rank 10)",
    role: "student",
    description: "Bandaranayake College • Shows only his own marks",
    user: {
      id: "std-53884191",
      name: "Linuka Damsanda",
      role: "student",
      indexNo: "53884191",
      school: "Bandaranayake College, Gampaha",
      batch: "2026 O/L Paper Class",
    },
  },
  {
    label: "Staff Admin",
    role: "admin",
    description: "Examiner / Evaluator • Can view all student marks",
    user: {
      id: "admin-01",
      name: "Kavinda Perera (Class Admin)",
      role: "admin",
      email: "admin@evon.lk",
    },
  },
  {
    label: "Super Admin (Master Access)",
    role: "superadmin",
    description: "Evon Aravinda • Full Master Access & Management",
    user: {
      id: "superadmin-01",
      name: "Evon Aravinda (Super Admin)",
      role: "superadmin",
      email: "superadmin@evon.lk",
    },
  },
];

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
  batch: "2025 O/L Speed Revision" | "2026 O/L Paper Class" | "2027 O/L Foundation";
  term: string;
  examDate: string;
  totalCandidates: number;
  highestMark: number;
  averageMark: number;
  passPercentage: number;
  topics: string[];
  durationMinutes: number;
  topper: {
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
  scoreDistribution: {
    ninetyPlus: number;
    eightyToEightyNine: number;
    seventyToSeventyNine: number;
    belowSeventy: number;
  };
  results: PaperStudentResult[];
}

export const paperClassList: PaperClassItem[] = [
  {
    id: "paper-01",
    paperNumber: "Paper 01",
    paperCode: "EA-2025-P01",
    title: "All-Island Full O/L Model Exam 01 - Business & Accounting Studies",
    batch: "2025 O/L Speed Revision",
    term: "Final Pre-Exam Assessment",
    examDate: "September 2026",
    totalCandidates: 524,
    highestMark: 100,
    averageMark: 76.8,
    passPercentage: 99.2,
    durationMinutes: 180,
    topics: [
      "Accounting Equation & Source Documents",
      "Prime Entry Books & Ledger Accounts",
      "Trial Balance & Error Rectification",
      "Sole Proprietorship Financial Statements",
      "Business Stakeholders & Economic Roles"
    ],
    topper: {
      name: "Yashodhini Vihara",
      school: "Devi Balika Vidyalaya, Colombo",
      indexNo: "53560574",
      totalScore: 100,
      part1Score: 40,
      part2Score: 60,
      badge: "Island 1st • Perfect Score 100/100",
      quote: "Sir's ledger balancing shortcuts and speed writing methods helped me complete both sections with 25 minutes left for checking!",
      avatarImage: "/images/top_student_rank1.jpg"
    },
    scoreDistribution: {
      ninetyPlus: 88,
      eightyToEightyNine: 194,
      seventyToSeventyNine: 148,
      belowSeventy: 94
    },
    results: [
      {
        id: "p1-1",
        rank: 1,
        name: "Yashodhini Vihara",
        school: "Devi Balika Vidyalaya, Colombo",
        indexNo: "53560574",
        part1Score: 40,
        part2Score: 60,
        totalScore: 100,
        grade: "A*",
        achievement: "Perfect Score 100% • Island 1st",
        avatarInitials: "YV",
        avatarImage: "/images/top_student_rank1.jpg"
      },
      {
        id: "p1-2",
        rank: 2,
        name: "Hasal Samaranayake",
        school: "Ananda College, Colombo",
        indexNo: "53519028",
        part1Score: 40,
        part2Score: 59,
        totalScore: 99,
        grade: "A*",
        achievement: "Class 2nd • Perfect MCQ 40/40",
        avatarInitials: "HS",
        avatarImage: "/images/top_student_rank2.jpg"
      },
      {
        id: "p1-3",
        rank: 3,
        name: "Vidun Wickramasinghe",
        school: "Sumedha College, Gampaha",
        indexNo: "53914473",
        part1Score: 39,
        part2Score: 59,
        totalScore: 98,
        grade: "A*",
        achievement: "Top in Gampaha District",
        avatarInitials: "VW",
        avatarImage: "/images/top_student_rank3.jpg"
      },
      {
        id: "p1-4",
        rank: 4,
        name: "Akithra Induwari",
        school: "Ananda Balika Vidyalaya, Colombo",
        indexNo: "53511450",
        part1Score: 39,
        part2Score: 58,
        totalScore: 97,
        grade: "A*",
        achievement: "Distinction Excellence",
        avatarInitials: "AI"
      },
      {
        id: "p1-5",
        rank: 5,
        name: "Tenushi Pamodya",
        school: "Sumedha College, Gampaha",
        indexNo: "53914864",
        part1Score: 40,
        part2Score: 57,
        totalScore: 97,
        grade: "A*",
        achievement: "Perfect MCQ 40/40",
        avatarInitials: "TP"
      },
      {
        id: "p1-6",
        rank: 6,
        name: "Senal Rajapakse",
        school: "Sussex College, Kiribathgoda",
        indexNo: "54054133",
        part1Score: 38,
        part2Score: 58,
        totalScore: 96,
        grade: "A*",
        achievement: "Outstanding Presentation",
        avatarInitials: "SR"
      },
      {
        id: "p1-7",
        rank: 7,
        name: "Shehan Rashmitha",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53884477",
        part1Score: 38,
        part2Score: 57,
        totalScore: 95,
        grade: "A*",
        achievement: "Top Tier Performer",
        avatarInitials: "SR"
      },
      {
        id: "p1-8",
        rank: 8,
        name: "Deneth Nimtharu",
        school: "Thurstan College, Colombo",
        indexNo: "53582012",
        part1Score: 37,
        part2Score: 57,
        totalScore: 94,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "DN"
      },
      {
        id: "p1-9",
        rank: 9,
        name: "Sethmi Thehasna",
        school: "Viharamahadevi Balika, Kiribathgoda",
        indexNo: "54068177",
        part1Score: 38,
        part2Score: 55,
        totalScore: 93,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "ST"
      },
      {
        id: "p1-10",
        rank: 10,
        name: "Linuka Damsanda",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53884191",
        part1Score: 37,
        part2Score: 55,
        totalScore: 92,
        grade: "A*",
        achievement: "Top 10 Finalist",
        avatarInitials: "LD"
      },
      {
        id: "p1-11",
        rank: 11,
        name: "Danuli De Silva",
        school: "Devi Balika Vidyalaya, Colombo",
        indexNo: "53560841",
        part1Score: 36,
        part2Score: 55,
        totalScore: 91,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "DD"
      },
      {
        id: "p1-12",
        rank: 12,
        name: "Kevin Adrian",
        school: "St. Joseph's College, Colombo",
        indexNo: "53494296",
        part1Score: 36,
        part2Score: 54,
        totalScore: 90,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "KA"
      }
    ]
  },
  {
    id: "paper-02",
    paperNumber: "Paper 02",
    paperCode: "EA-2025-P02",
    title: "Financial Statements & Balance Sheet Adjustment Master Test",
    batch: "2025 O/L Speed Revision",
    term: "Core Accounting Test",
    examDate: "September 2026",
    totalCandidates: 498,
    highestMark: 99,
    averageMark: 74.2,
    passPercentage: 98.4,
    durationMinutes: 150,
    topics: [
      "Depreciation (Straight Line & Reducing Balance)",
      "Bad Debts & Provision for Doubtful Debts",
      "Accrued Expenses & Prepaid Incomes",
      "Closing Stock Valuation",
      "Comprehensive Trading, Profit & Loss Account"
    ],
    topper: {
      name: "Senal Rajapakse",
      school: "Sussex College, Kiribathgoda",
      indexNo: "54054133",
      totalScore: 99,
      part1Score: 40,
      part2Score: 59,
      badge: "Highest Mark 99/100 • Paper Champion",
      quote: "The step-by-step adjustment table taught by Evon Sir made complex balance sheet adjustments effortless.",
      avatarImage: "/images/top_student_rank2.jpg"
    },
    scoreDistribution: {
      ninetyPlus: 72,
      eightyToEightyNine: 178,
      seventyToSeventyNine: 152,
      belowSeventy: 96
    },
    results: [
      {
        id: "p2-1",
        rank: 1,
        name: "Senal Rajapakse",
        school: "Sussex College, Kiribathgoda",
        indexNo: "54054133",
        part1Score: 40,
        part2Score: 59,
        totalScore: 99,
        grade: "A*",
        achievement: "Paper 1st • Highest Mark 99%",
        avatarInitials: "SR",
        avatarImage: "/images/top_student_rank2.jpg"
      },
      {
        id: "p2-2",
        rank: 2,
        name: "Tenushi Pamodya",
        school: "Sumedha College, Gampaha",
        indexNo: "53914864",
        part1Score: 39,
        part2Score: 59,
        totalScore: 98,
        grade: "A*",
        achievement: "Paper 2nd • Financial Statement Pro",
        avatarInitials: "TP",
        avatarImage: "/images/top_student_rank3.jpg"
      },
      {
        id: "p2-3",
        rank: 3,
        name: "Deneth Nimtharu",
        school: "Thurstan College, Colombo",
        indexNo: "53582012",
        part1Score: 39,
        part2Score: 58,
        totalScore: 97,
        grade: "A*",
        achievement: "Paper 3rd • Flawless Adjustments",
        avatarInitials: "DN",
        avatarImage: "/images/top_student_rank1.jpg"
      },
      {
        id: "p2-4",
        rank: 4,
        name: "Yashodhini Vihara",
        school: "Devi Balika Vidyalaya, Colombo",
        indexNo: "53560574",
        part1Score: 38,
        part2Score: 58,
        totalScore: 96,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "YV"
      },
      {
        id: "p2-5",
        rank: 5,
        name: "Kulitha Ranudaya",
        school: "Britishway International, Nittambuwa",
        indexNo: "54271010",
        part1Score: 38,
        part2Score: 57,
        totalScore: 95,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "KR"
      },
      {
        id: "p2-6",
        rank: 6,
        name: "Hasal Samaranayake",
        school: "Ananda College, Colombo",
        indexNo: "53519028",
        part1Score: 37,
        part2Score: 57,
        totalScore: 94,
        grade: "A*",
        achievement: "Top Tier Performer",
        avatarInitials: "HS"
      },
      {
        id: "p2-7",
        rank: 7,
        name: "Minradha Ranasinghe",
        school: "Viharamahadevi Balika, Kiribathgoda",
        indexNo: "54068231",
        part1Score: 37,
        part2Score: 56,
        totalScore: 93,
        grade: "A*",
        achievement: "Top Tier Performer",
        avatarInitials: "MR"
      },
      {
        id: "p2-8",
        rank: 8,
        name: "Kisal Weerakone",
        school: "St. Joseph's College, Colombo",
        indexNo: "53494644",
        part1Score: 36,
        part2Score: 56,
        totalScore: 92,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "KW"
      },
      {
        id: "p2-9",
        rank: 9,
        name: "Ovini Nithasha",
        school: "Mahamaya Girls College, Kadawatha",
        indexNo: "54052360",
        part1Score: 36,
        part2Score: 55,
        totalScore: 91,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "ON"
      },
      {
        id: "p2-10",
        rank: 10,
        name: "Chanuga Walpola",
        school: "Nalanda College, Colombo",
        indexNo: "53530357",
        part1Score: 36,
        part2Score: 54,
        totalScore: 90,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "CW"
      }
    ]
  },
  {
    id: "paper-03",
    paperNumber: "Paper 03",
    paperCode: "EA-2025-P03",
    title: "Manufacturing Accounts & Cost Accounting Mastery Paper",
    batch: "2025 O/L Speed Revision",
    term: "Specialized Accounting Paper",
    examDate: "August 2026",
    totalCandidates: 476,
    highestMark: 100,
    averageMark: 75.1,
    passPercentage: 97.9,
    durationMinutes: 150,
    topics: [
      "Direct Material, Direct Labour & Direct Expenses",
      "Prime Cost Calculation",
      "Factory Overheads Allocation & Apportionment",
      "Work-in-Progress & Production Cost of Finished Goods",
      "Costing Formulas & Past Paper Traps"
    ],
    topper: {
      name: "Sethmi Thehasna",
      school: "Viharamahadevi Balika, Kiribathgoda",
      indexNo: "54068177",
      totalScore: 100,
      part1Score: 40,
      part2Score: 60,
      badge: "Island 1st • Perfect Score 100/100",
      quote: "Manufacturing accounts used to be intimidating, but Evon Sir's flowcharts simplified everything so clearly!",
      avatarImage: "/images/top_student_rank3.jpg"
    },
    scoreDistribution: {
      ninetyPlus: 81,
      eightyToEightyNine: 165,
      seventyToSeventyNine: 142,
      belowSeventy: 88
    },
    results: [
      {
        id: "p3-1",
        rank: 1,
        name: "Sethmi Thehasna",
        school: "Viharamahadevi Balika, Kiribathgoda",
        indexNo: "54068177",
        part1Score: 40,
        part2Score: 60,
        totalScore: 100,
        grade: "A*",
        achievement: "Perfect Score 100% • Island 1st",
        avatarInitials: "ST",
        avatarImage: "/images/top_student_rank3.jpg"
      },
      {
        id: "p3-2",
        rank: 2,
        name: "Miyuru Vishwajith",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53883616",
        part1Score: 40,
        part2Score: 59,
        totalScore: 99,
        grade: "A*",
        achievement: "Class 2nd • Prime Cost Specialist",
        avatarInitials: "MV",
        avatarImage: "/images/top_student_rank1.jpg"
      },
      {
        id: "p3-3",
        rank: 3,
        name: "Ehansa Kurukulasuriya",
        school: "Bishops College, Colombo",
        indexNo: "53506189",
        part1Score: 39,
        part2Score: 59,
        totalScore: 98,
        grade: "A*",
        achievement: "Class 3rd • Exceptional Structure",
        avatarInitials: "EK",
        avatarImage: "/images/top_student_rank2.jpg"
      },
      {
        id: "p3-4",
        rank: 4,
        name: "Pesandu Lukdiw",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53883918",
        part1Score: 39,
        part2Score: 58,
        totalScore: 97,
        grade: "A*",
        achievement: "Top 5 Performer",
        avatarInitials: "PL"
      },
      {
        id: "p3-5",
        rank: 5,
        name: "Denith Manthuja",
        school: "St. Joseph's College, Colombo",
        indexNo: "25047936",
        part1Score: 38,
        part2Score: 58,
        totalScore: 96,
        grade: "A*",
        achievement: "Top 5 Performer",
        avatarInitials: "DM"
      },
      {
        id: "p3-6",
        rank: 6,
        name: "Hesali Alwis",
        school: "Musaeus College, Colombo",
        indexNo: "53554396",
        part1Score: 38,
        part2Score: 57,
        totalScore: 95,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "HA"
      },
      {
        id: "p3-7",
        rank: 7,
        name: "Duveesha Amarasinghe",
        school: "Gothami Balika Vidyalaya, Colombo",
        indexNo: "53524330",
        part1Score: 37,
        part2Score: 57,
        totalScore: 94,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "DA"
      },
      {
        id: "p3-8",
        rank: 8,
        name: "Kavi Rivisahan",
        school: "Mahanama College, Colombo",
        indexNo: "53586301",
        part1Score: 37,
        part2Score: 56,
        totalScore: 93,
        grade: "A*",
        achievement: "Top 10 Finalist",
        avatarInitials: "KR"
      },
      {
        id: "p3-9",
        rank: 9,
        name: "Chathuni Jayasinghe",
        school: "Holy Cross College, Gampaha",
        indexNo: "53891015",
        part1Score: 37,
        part2Score: 55,
        totalScore: 92,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "CJ"
      },
      {
        id: "p3-10",
        rank: 10,
        name: "Sandesh Ayodhya",
        school: "Karunarathna Buddhist College",
        indexNo: "54001650",
        part1Score: 36,
        part2Score: 55,
        totalScore: 91,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "SA"
      }
    ]
  },
  {
    id: "paper-04",
    paperNumber: "Paper 04",
    paperCode: "EA-2025-P04",
    title: "Bank Reconciliation, Cash Book & Trial Balance Error Rectification",
    batch: "2025 O/L Speed Revision",
    term: "Speed & Accuracy Challenge",
    examDate: "August 2026",
    totalCandidates: 512,
    highestMark: 98,
    averageMark: 72.9,
    passPercentage: 97.4,
    durationMinutes: 150,
    topics: [
      "Adjusted Cash Book & Bank Overdrafts",
      "Uncredited Cheques & Unpresented Cheques",
      "Direct Deposits & Standing Orders",
      "Suspense Account & Errors Not Affecting Trial Balance",
      "Errors Affecting Trial Balance & Rectification Journal Entries"
    ],
    topper: {
      name: "Disas Harshana",
      school: "Bandaranayake Central College, Veyangoda",
      indexNo: "53936671",
      totalScore: 98,
      part1Score: 39,
      part2Score: 59,
      badge: "Highest Mark 98/100 • Speed Champion",
      quote: "Bank reconciliation used to confuse me with debits and credits, but the 4-quadrant technique made it 100% foolproof!",
      avatarImage: "/images/top_student_rank2.jpg"
    },
    scoreDistribution: {
      ninetyPlus: 67,
      eightyToEightyNine: 182,
      seventyToSeventyNine: 161,
      belowSeventy: 102
    },
    results: [
      {
        id: "p4-1",
        rank: 1,
        name: "Disas Harshana",
        school: "Bandaranayake Central College, Veyangoda",
        indexNo: "53936671",
        part1Score: 39,
        part2Score: 59,
        totalScore: 98,
        grade: "A*",
        achievement: "Paper 1st • Highest Mark 98%",
        avatarInitials: "DH",
        avatarImage: "/images/top_student_rank2.jpg"
      },
      {
        id: "p4-2",
        rank: 2,
        name: "Damithu Thenujaya",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53883780",
        part1Score: 39,
        part2Score: 58,
        totalScore: 97,
        grade: "A*",
        achievement: "Paper 2nd • Error Rectification Ace",
        avatarInitials: "DT",
        avatarImage: "/images/top_student_rank1.jpg"
      },
      {
        id: "p4-3",
        rank: 3,
        name: "W.W.M. Panchanga",
        school: "Asoka College, Colombo 10",
        indexNo: "53523938",
        part1Score: 39,
        part2Score: 57,
        totalScore: 96,
        grade: "A*",
        achievement: "Paper 3rd • High Distinction",
        avatarInitials: "WP",
        avatarImage: "/images/top_student_rank3.jpg"
      },
      {
        id: "p4-4",
        rank: 4,
        name: "Desandi Thinara",
        school: "Bandaranayake Central College, Veyangoda",
        indexNo: "53936817",
        part1Score: 38,
        part2Score: 57,
        totalScore: 95,
        grade: "A*",
        achievement: "Top 5 Performer",
        avatarInitials: "DT"
      },
      {
        id: "p4-5",
        rank: 5,
        name: "Sawani Pamalya",
        school: "Viharamahadevi Balika Vidyalaya",
        indexNo: "54067928",
        part1Score: 38,
        part2Score: 56,
        totalScore: 94,
        grade: "A*",
        achievement: "Top 5 Performer",
        avatarInitials: "SP"
      },
      {
        id: "p4-6",
        rank: 6,
        name: "Yoshini Mihindi",
        school: "Viharamahadevi Balika Vidyalaya",
        indexNo: "54068363",
        part1Score: 37,
        part2Score: 56,
        totalScore: 93,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "YM"
      },
      {
        id: "p4-7",
        rank: 7,
        name: "Malki Nimthara",
        school: "Yasodara Devi Balika Vidyalaya",
        indexNo: "53912209",
        part1Score: 37,
        part2Score: 55,
        totalScore: 92,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "MN"
      },
      {
        id: "p4-8",
        rank: 8,
        name: "Inudi Hesansa",
        school: "Yasodara Devi Balika Vidyalaya",
        indexNo: "53912560",
        part1Score: 37,
        part2Score: 54,
        totalScore: 91,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "IH"
      },
      {
        id: "p4-9",
        rank: 9,
        name: "Geehara Anusari",
        school: "Sirimavo Bandaranaike Vidyalaya",
        indexNo: "53605900",
        part1Score: 36,
        part2Score: 54,
        totalScore: 90,
        grade: "A*",
        achievement: "Top 10 Finalist",
        avatarInitials: "GA"
      },
      {
        id: "p4-10",
        rank: 10,
        name: "Vinudi Dahamila",
        school: "Sumedha College, Gampaha",
        indexNo: "53914708",
        part1Score: 36,
        part2Score: 54,
        totalScore: 90,
        grade: "A*",
        achievement: "Top 10 Finalist",
        avatarInitials: "VD"
      }
    ]
  },
  {
    id: "paper-05",
    paperNumber: "Paper 05",
    paperCode: "EA-2026-P01",
    title: "Business Studies Section - Case Studies & Strategic Essay Writing",
    batch: "2026 O/L Paper Class",
    term: "Commerce Section Mastery",
    examDate: "July 2026",
    totalCandidates: 462,
    highestMark: 99,
    averageMark: 76.4,
    passPercentage: 98.8,
    durationMinutes: 150,
    topics: [
      "Sole Proprietorship, Partnership & Companies",
      "Money, Banking & Modern Digital Payments",
      "Trade (Domestic & International Export/Import)",
      "Government Regulation & Consumer Protection",
      "Case Study Keyword Highlighting & Mark Schemes"
    ],
    topper: {
      name: "Minradha Ranasinghe",
      school: "Viharamahadevi Balika Vidyalaya, Kiribathgoda",
      indexNo: "54068231",
      totalScore: 99,
      part1Score: 40,
      part2Score: 59,
      badge: "Highest Mark 99/100 • Business Studies Master",
      quote: "Sir's essay templates and government marking scheme analysis helped me write structured, high-scoring answers effortlessly.",
      avatarImage: "/images/top_student_rank1.jpg"
    },
    scoreDistribution: {
      ninetyPlus: 78,
      eightyToEightyNine: 172,
      seventyToSeventyNine: 138,
      belowSeventy: 74
    },
    results: [
      {
        id: "p5-1",
        rank: 1,
        name: "Minradha Ranasinghe",
        school: "Viharamahadevi Balika Vidyalaya",
        indexNo: "54068231",
        part1Score: 40,
        part2Score: 59,
        totalScore: 99,
        grade: "A*",
        achievement: "Paper 1st • Perfect MCQ 40/40",
        avatarInitials: "MR",
        avatarImage: "/images/top_student_rank1.jpg"
      },
      {
        id: "p5-2",
        rank: 2,
        name: "Vidath Damsara",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53884485",
        part1Score: 40,
        part2Score: 58,
        totalScore: 98,
        grade: "A*",
        achievement: "Paper 2nd • Case Study Expert",
        avatarInitials: "VD",
        avatarImage: "/images/top_student_rank2.jpg"
      },
      {
        id: "p5-3",
        rank: 3,
        name: "Devangi Amarasinghe",
        school: "Yasodara Devi Balika Vidyalaya",
        indexNo: "53912470",
        part1Score: 39,
        part2Score: 58,
        totalScore: 97,
        grade: "A*",
        achievement: "Paper 3rd • Distinction Excellence",
        avatarInitials: "DA",
        avatarImage: "/images/top_student_rank3.jpg"
      },
      {
        id: "p5-4",
        rank: 4,
        name: "Senuth Dinsara",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53884493",
        part1Score: 39,
        part2Score: 57,
        totalScore: 96,
        grade: "A*",
        achievement: "Top 5 Performer",
        avatarInitials: "SD"
      },
      {
        id: "p5-5",
        rank: 5,
        name: "Maheema Sithumini",
        school: "Rathnavali Balika Vidyalaya, Gampaha",
        indexNo: "53923324",
        part1Score: 38,
        part2Score: 57,
        totalScore: 95,
        grade: "A*",
        achievement: "Top 5 Performer",
        avatarInitials: "MS"
      },
      {
        id: "p5-6",
        rank: 6,
        name: "Gehara Dharmasri",
        school: "Rathnavali Balika Vidyalaya, Gampaha",
        indexNo: "53923383",
        part1Score: 38,
        part2Score: 56,
        totalScore: 94,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "GD"
      },
      {
        id: "p5-7",
        rank: 7,
        name: "Nethuki Lehansa",
        school: "Musaeus College, Colombo",
        indexNo: "53553250",
        part1Score: 37,
        part2Score: 56,
        totalScore: 93,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "NL"
      },
      {
        id: "p5-8",
        rank: 8,
        name: "Adhithi Alwis",
        school: "Holy Cross College, Gampaha",
        indexNo: "53890949",
        part1Score: 37,
        part2Score: 55,
        totalScore: 92,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "AA"
      },
      {
        id: "p5-9",
        rank: 9,
        name: "Nevinka Fernando",
        school: "Holy Cross College, Gampaha",
        indexNo: "53890744",
        part1Score: 36,
        part2Score: 55,
        totalScore: 91,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "NF"
      },
      {
        id: "p5-10",
        rank: 10,
        name: "Dulithi Nevithma",
        school: "Holy Cross College, Gampaha",
        indexNo: "53891040",
        part1Score: 36,
        part2Score: 54,
        totalScore: 90,
        grade: "A*",
        achievement: "Top 10 Finalist",
        avatarInitials: "DN"
      }
    ]
  },
  {
    id: "paper-06",
    paperNumber: "Paper 06",
    paperCode: "EA-2026-P02",
    title: "All-Island Grand Pre-O/L Mock Examination (Final Full Syllabus)",
    batch: "2026 O/L Paper Class",
    term: "All-Island Benchmark Exam",
    examDate: "June 2026",
    totalCandidates: 548,
    highestMark: 100,
    averageMark: 77.3,
    passPercentage: 99.4,
    durationMinutes: 180,
    topics: [
      "Complete Grade 10 & 11 Syllabus Coverage",
      "50 MCQ Precision Testing Under Time Limits",
      "Complete Structured Accounting Financial Accounts",
      "Commerce Case Analysis with Strict Marking Key",
      "Presentation, Underlining & Double Ruling Guidelines"
    ],
    topper: {
      name: "Linuka Damsanda",
      school: "Bandaranayake College, Gampaha",
      indexNo: "53884191",
      totalScore: 100,
      part1Score: 40,
      part2Score: 60,
      badge: "Island 1st • Perfect Score 100/100",
      quote: "Practicing 6 full timed papers before the exam gave me supreme confidence on real exam day.",
      avatarImage: "/images/top_student_rank2.jpg"
    },
    scoreDistribution: {
      ninetyPlus: 94,
      eightyToEightyNine: 204,
      seventyToSeventyNine: 162,
      belowSeventy: 88
    },
    results: [
      {
        id: "p6-1",
        rank: 1,
        name: "Linuka Damsanda",
        school: "Bandaranayake College, Gampaha",
        indexNo: "53884191",
        part1Score: 40,
        part2Score: 60,
        totalScore: 100,
        grade: "A*",
        achievement: "Perfect Score 100% • Island 1st",
        avatarInitials: "LD",
        avatarImage: "/images/top_student_rank2.jpg"
      },
      {
        id: "p6-2",
        rank: 2,
        name: "Kevin Adrian",
        school: "St. Joseph's College, Colombo",
        indexNo: "53494296",
        part1Score: 40,
        part2Score: 59,
        totalScore: 99,
        grade: "A*",
        achievement: "Class 2nd • Perfect MCQ 40/40",
        avatarInitials: "KA",
        avatarImage: "/images/top_student_rank1.jpg"
      },
      {
        id: "p6-3",
        rank: 3,
        name: "Yashodhini Vihara",
        school: "Devi Balika Vidyalaya, Colombo",
        indexNo: "53560574",
        part1Score: 40,
        part2Score: 59,
        totalScore: 99,
        grade: "A*",
        achievement: "Class 2nd • Consistency Champion",
        avatarInitials: "YV",
        avatarImage: "/images/top_student_rank3.jpg"
      },
      {
        id: "p6-4",
        rank: 4,
        name: "Hasal Samaranayake",
        school: "Ananda College, Colombo",
        indexNo: "53519028",
        part1Score: 39,
        part2Score: 59,
        totalScore: 98,
        grade: "A*",
        achievement: "Top 5 All-Island",
        avatarInitials: "HS"
      },
      {
        id: "p6-5",
        rank: 5,
        name: "Vidun Wickramasinghe",
        school: "Sumedha College, Gampaha",
        indexNo: "53914473",
        part1Score: 39,
        part2Score: 58,
        totalScore: 97,
        grade: "A*",
        achievement: "Top 5 All-Island",
        avatarInitials: "VW"
      },
      {
        id: "p6-6",
        rank: 6,
        name: "Kumali Herath",
        school: "Musaeus College, Colombo",
        indexNo: "53553290",
        part1Score: 39,
        part2Score: 57,
        totalScore: 96,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "KH"
      },
      {
        id: "p6-7",
        rank: 7,
        name: "Virajitha Nitheesh",
        school: "Negombo South International School",
        indexNo: "53961463",
        part1Score: 38,
        part2Score: 57,
        totalScore: 95,
        grade: "A*",
        achievement: "High Distinction",
        avatarInitials: "VN"
      },
      {
        id: "p6-8",
        rank: 8,
        name: "Buthsara Dinumuthu",
        school: "Gurukula College, Kelaniya",
        indexNo: "54085470",
        part1Score: 38,
        part2Score: 56,
        totalScore: 94,
        grade: "A*",
        achievement: "Top 10 Finalist",
        avatarInitials: "BD"
      },
      {
        id: "p6-9",
        rank: 9,
        name: "Kajini Kashmira",
        school: "Gurukula College, Kelaniya",
        indexNo: "54086736",
        part1Score: 37,
        part2Score: 56,
        totalScore: 93,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "KK"
      },
      {
        id: "p6-10",
        rank: 10,
        name: "Minoli Sadithma",
        school: "Negombo South International School",
        indexNo: "53961480",
        part1Score: 37,
        part2Score: 55,
        totalScore: 92,
        grade: "A*",
        achievement: "Distinction Award",
        avatarInitials: "MS"
      }
    ]
  }
];

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

export const paperSummaryStats: PaperSummaryStat[] = paperClassList.map((p) => ({
  paperNumber: p.paperNumber,
  paperCode: p.paperCode,
  title: p.title,
  highestMark: p.highestMark,
  highestScorerName: p.topper.name,
  highestScorerSchool: p.topper.school,
  averageMark: p.averageMark,
  totalStudents: p.totalCandidates,
}));
