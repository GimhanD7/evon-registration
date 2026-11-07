import * as XLSX from "xlsx";
import { LMSQuiz, QuizQuestion } from "@/data/lmsData";

export interface ParsedQuizItem extends Omit<LMSQuiz, "id"> {
  tempId: string;
}

export interface ParseExcelResult {
  quizzes: ParsedQuizItem[];
  totalQuestions: number;
  errors: string[];
}

function normalizeKey(key: string): string {
  return String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findColumnValue(row: Record<string, unknown>, candidateKeys: string[]): string {
  const rowKeys = Object.keys(row);
  for (const target of candidateKeys) {
    const targetNorm = normalizeKey(target);
    for (const key of rowKeys) {
      const keyNorm = normalizeKey(key);
      if (keyNorm === targetNorm) {
        const val = row[key];
        return val !== undefined && val !== null ? String(val).trim() : "";
      }
    }
  }
  // Loose matching if exact normalized match was not found
  for (const target of candidateKeys) {
    const targetNorm = normalizeKey(target);
    for (const key of rowKeys) {
      const keyNorm = normalizeKey(key);
      if (keyNorm.includes(targetNorm) && targetNorm.length >= 3) {
        const val = row[key];
        return val !== undefined && val !== null ? String(val).trim() : "";
      }
    }
  }
  return "";
}

function parseCorrectAnswer(rawVal: string, options: [string, string, string, string]): number {
  const clean = rawVal.trim().toUpperCase();
  if (clean === "A" || clean === "1" || clean === "OPTION A" || clean === "OPTION 1") return 0;
  if (clean === "B" || clean === "2" || clean === "OPTION B" || clean === "OPTION 2") return 1;
  if (clean === "C" || clean === "3" || clean === "OPTION C" || clean === "OPTION 3") return 2;
  if (clean === "D" || clean === "4" || clean === "OPTION D" || clean === "OPTION 4") return 3;
  if (clean === "0") return 0;

  // Try matching against option text
  const lower = rawVal.trim().toLowerCase();
  for (let i = 0; i < options.length; i++) {
    if (options[i].trim().toLowerCase() === lower && lower.length > 0) {
      return i;
    }
  }
  return 0;
}

/**
 * Parses an Excel (.xlsx / .xls) or CSV file and extracts quizzes with questions.
 */
export async function parseQuizExcelFile(
  file: File,
  defaultMeta?: {
    title?: string;
    subject?: string;
    batch?: string;
    durationMinutes?: number;
  }
): Promise<ParseExcelResult> {
  const errors: string[] = [];
  const buffer = await file.arrayBuffer();

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch (err) {
    return {
      quizzes: [],
      totalQuestions: 0,
      errors: [`Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return {
      quizzes: [],
      totalQuestions: 0,
      errors: ["The uploaded Excel file does not contain any sheets."],
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (!rows || rows.length === 0) {
    return {
      quizzes: [],
      totalQuestions: 0,
      errors: ["The Excel sheet is empty. Please add questions and try again."],
    };
  }

  // Group questions by Quiz Title
  const groupedQuizzes = new Map<
    string,
    {
      subject: string;
      batch: string;
      durationMinutes: number;
      questions: QuizQuestion[];
    }
  >();

  const fallbackTitle =
    defaultMeta?.title?.trim() ||
    file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") ||
    "Imported MCQ Quiz";

  let totalQuestionsCount = 0;

  rows.forEach((row, idx) => {
    // 1. Question Prompt
    const questionText = findColumnValue(row, [
      "question",
      "questionprompt",
      "questiontext",
      "prompt",
      "mcq",
      "q",
    ]);

    // Skip empty rows without question text
    if (!questionText) {
      return;
    }

    // 2. Options A, B, C, D
    const optA = findColumnValue(row, ["optiona", "opta", "option1", "choicea", "a"]);
    const optB = findColumnValue(row, ["optionb", "optb", "option2", "choiceb", "b"]);
    const optC = findColumnValue(row, ["optionc", "optc", "option3", "choicec", "c"]);
    const optD = findColumnValue(row, ["optiond", "optd", "option4", "choiced", "d"]);

    const options: [string, string, string, string] = [
      optA || "Option A",
      optB || "Option B",
      optC || "Option C",
      optD || "Option D",
    ];

    // 3. Correct Answer
    const rawCorrect = findColumnValue(row, [
      "correctanswer",
      "correct",
      "answer",
      "key",
      "ans",
      "correctoption",
    ]);
    const correctAnswer = parseCorrectAnswer(rawCorrect, options);

    // 4. Explanation
    const explanation = findColumnValue(row, [
      "explanation",
      "explain",
      "notes",
      "reason",
      "solution",
      "remarks",
    ]);

    // 5. Quiz metadata
    const rowTitle =
      findColumnValue(row, ["quiztitle", "quizname", "title", "quiz"]) || fallbackTitle;
    const rowSubject =
      findColumnValue(row, ["subject", "category"]) ||
      defaultMeta?.subject ||
      "Commerce";
    const rowBatch =
      findColumnValue(row, ["batch", "class", "grade"]) ||
      defaultMeta?.batch ||
      "2026/2027 O/L Commerce";
    const rawDuration = findColumnValue(row, [
      "durationminutes",
      "duration",
      "time",
      "minutes",
    ]);
    const rowDuration = parseInt(rawDuration, 10) || defaultMeta?.durationMinutes || 15;

    const quizKey = rowTitle.trim().toLowerCase();
    if (!groupedQuizzes.has(quizKey)) {
      groupedQuizzes.set(quizKey, {
        subject: rowSubject,
        batch: rowBatch,
        durationMinutes: rowDuration,
        questions: [],
      });
    }

    const currentQuiz = groupedQuizzes.get(quizKey)!;
    currentQuiz.questions.push({
      id: `q-excel-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
      question: questionText,
      options,
      correctAnswer,
      explanation: explanation || "",
    });

    totalQuestionsCount++;
  });

  if (groupedQuizzes.size === 0 || totalQuestionsCount === 0) {
    return {
      quizzes: [],
      totalQuestions: 0,
      errors: [
        "No valid questions could be detected. Please ensure your Excel sheet has columns for 'Question', 'Option A', 'Option B', 'Option C', 'Option D', and 'Correct Answer'.",
      ],
    };
  }

  // Convert map to array of quizzes
  const parsedQuizzes: ParsedQuizItem[] = [];
  groupedQuizzes.forEach((data, titleKey) => {
    // Recover proper case title
    const properTitle =
      titleKey === fallbackTitle.toLowerCase()
        ? fallbackTitle
        : titleKey
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

    parsedQuizzes.push({
      tempId: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: properTitle,
      subject: data.subject,
      batch: data.batch,
      durationMinutes: data.durationMinutes,
      questions: data.questions,
    });
  });

  return {
    quizzes: parsedQuizzes,
    totalQuestions: totalQuestionsCount,
    errors,
  };
}

/**
 * Downloads a pre-formatted Excel template (.xlsx) with sample Accounting & Commerce questions.
 */
export function downloadSampleQuizTemplate(): void {
  const headers = [
    "Quiz Title",
    "Subject",
    "Batch",
    "Duration (Mins)",
    "Question",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Answer (A/B/C/D)",
    "Explanation",
  ];

  const sampleRows = [
    [
      "Commerce Speed Revision MCQ 01",
      "Commerce",
      "2026/2027 O/L Commerce",
      15,
      "Which account is debited when cash is received from a trade debtor?",
      "Debtor's Account",
      "Cash Account",
      "Sales Account",
      "Discount Allowed Account",
      "B",
      "When cash increases, the Cash Account (an Asset) is debited under double-entry principles.",
    ],
    [
      "Commerce Speed Revision MCQ 01",
      "Commerce",
      "2026/2027 O/L Commerce",
      15,
      "What is the primary source document used to record credit sales in the Sales Journal?",
      "Sales Invoice (Copy)",
      "Purchase Invoice (Original)",
      "Cash Payment Receipt",
      "Credit Note Issued",
      "A",
      "A copy of the sales invoice issued to the buyer is entered in the sales journal.",
    ],
    [
      "Commerce Speed Revision MCQ 01",
      "Commerce",
      "2026/2027 O/L Commerce",
      15,
      "Which of the following errors will NOT prevent the trial balance debit and credit totals from agreeing?",
      "Single-sided posting omission",
      "Error of Complete Omission",
      "Mathematical calculation error in ledger",
      "Posting a debit balance to credit column",
      "B",
      "An error of complete omission leaves both debit and credit unrecorded, keeping the trial balance in balance.",
    ],
    [
      "Commerce Principles Speed Test 02",
      "Commerce",
      "2026/2027 O/L Commerce",
      20,
      "Which of the following is considered a primary human physiological need?",
      "Security / Protection",
      "Self-actualization",
      "Food, Water, and Shelter",
      "Social / Belonging",
      "C",
      "Physiological needs are the essential biological survival requirements at the base of human needs.",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Set friendly column widths for Excel
  ws["!cols"] = [
    { wch: 34 }, // Quiz Title
    { wch: 22 }, // Subject
    { wch: 26 }, // Batch
    { wch: 16 }, // Duration (Mins)
    { wch: 50 }, // Question
    { wch: 25 }, // Option A
    { wch: 25 }, // Option B
    { wch: 25 }, // Option C
    { wch: 25 }, // Option D
    { wch: 26 }, // Correct Answer
    { wch: 50 }, // Explanation
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Quizzes");
  XLSX.writeFile(wb, "Evon_LMS_Quiz_Template.xlsx");
}
