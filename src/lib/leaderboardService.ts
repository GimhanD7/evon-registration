import { LMSUser, LMSPaper, LMSQuiz, LMSEvaluation } from "@/data/lmsData";

export interface StudentLeaderboardEntry {
  id: string;
  fullName: string;
  indexNo: string;
  batch: string;
  school: string;
  avatarUrl?: string;
  
  // Exams Analytics
  examsAttended: number;
  totalExamScore: number;
  avgExamScore: number; // 0 - 100
  highestExamScore: number;
  bestExamRank: number;
  recentExamScores: {
    paperId: string;
    paperTitle: string;
    score: number;
    part1: number;
    part2: number;
    grade: string;
    rank: number;
  }[];

  // Quizzes Analytics
  quizzesAttempted: number;
  totalQuizScore: number;
  totalPossibleQuizMarks: number;
  quizAccuracy: number; // 0 - 100
  recentQuizScores: {
    quizId: string;
    quizTitle: string;
    score: number;
    totalMarks: number;
  }[];

  // Evaluations Analytics
  evaluationsCount: number;
  latestPerformanceGrade?: string;
  evaluationRemarks?: string[];

  // Points System
  examPoints: number;
  quizPoints: number;
  evaluationBonus: number;
  totalPoints: number;

  // Rank & Status
  rank: number;
  tier: "Grand Master Champion" | "Elite Scholar" | "Distinction Star" | "Merit Achiever";
}

/**
 * Aggregates all exam marks, quizzes, and evaluations across all system students
 * to construct a comprehensive points leaderboard.
 */
export function calculateLeaderboard(
  users: LMSUser[],
  papers: LMSPaper[],
  quizzes: LMSQuiz[],
  evaluations: LMSEvaluation[]
): StudentLeaderboardEntry[] {
  // Map of student entries by a normalized key (indexNo or lowercased name)
  const map = new Map<string, StudentLeaderboardEntry>();

  // 1. Initialize with all registered students
  users
    .filter((u) => u.role === "student")
    .forEach((u) => {
      const key = (u.indexNo || u.id || u.fullName).trim().toLowerCase();
      map.set(key, {
        id: u.id,
        fullName: u.fullName,
        indexNo: u.indexNo || "INDEX-PENDING",
        batch: u.batch || "2026 O/L Speed Revision",
        school: u.school || "Evon Commerce Academy",
        avatarUrl: u.avatarUrl,
        examsAttended: 0,
        totalExamScore: 0,
        avgExamScore: 0,
        highestExamScore: 0,
        bestExamRank: 999,
        recentExamScores: [],
        quizzesAttempted: 0,
        totalQuizScore: 0,
        totalPossibleQuizMarks: 0,
        quizAccuracy: 0,
        recentQuizScores: [],
        evaluationsCount: 0,
        examPoints: 0,
        quizPoints: 0,
        evaluationBonus: 0,
        totalPoints: 0,
        rank: 0,
        tier: "Merit Achiever",
      });
    });

  // 2. Aggregate exam results from all papers
  papers.forEach((p) => {
    const results = p.results || [];
    results.forEach((r) => {
      const studentName = (r.name || "").trim();
      const studentIndex = (r.indexNo || "").trim();
      if (!studentName && !studentIndex) return;

      const key = (studentIndex || studentName).toLowerCase();
      let entry = map.get(key);

      // If not yet in map, find by name matching or create
      if (!entry) {
        for (const [, val] of map.entries()) {
          if (val.fullName.toLowerCase() === studentName.toLowerCase()) {
            entry = val;
            break;
          }
        }
      }

      if (!entry) {
        entry = {
          id: `ext-${studentIndex || Math.random().toString(36).slice(2, 7)}`,
          fullName: studentName || `Student ${studentIndex}`,
          indexNo: studentIndex || "N/A",
          batch: p.batch || "2026 O/L Speed Revision",
          school: "Evon Institute Student",
          examsAttended: 0,
          totalExamScore: 0,
          avgExamScore: 0,
          highestExamScore: 0,
          bestExamRank: 999,
          recentExamScores: [],
          quizzesAttempted: 0,
          totalQuizScore: 0,
          totalPossibleQuizMarks: 0,
          quizAccuracy: 0,
          recentQuizScores: [],
          evaluationsCount: 0,
          examPoints: 0,
          quizPoints: 0,
          evaluationBonus: 0,
          totalPoints: 0,
          rank: 0,
          tier: "Merit Achiever",
        };
        map.set(key, entry);
      }

      const score = Number(r.totalScore) || 0;
      entry.examsAttended += 1;
      entry.totalExamScore += score;
      if (score > entry.highestExamScore) {
        entry.highestExamScore = score;
      }
      if (r.rank && r.rank < entry.bestExamRank) {
        entry.bestExamRank = r.rank;
      }

      entry.recentExamScores.push({
        paperId: p.id,
        paperTitle: p.title,
        score,
        part1: Number(r.part1Score) || 0,
        part2: Number(r.part2Score) || 0,
        grade: r.grade || (score >= 75 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "S" : "F"),
        rank: r.rank || entry.examsAttended,
      });
    });
  });

  // Also include studentScore on paper for primary student if present
  papers.forEach((p) => {
    if (p.studentScore) {
      for (const [, entry] of map.entries()) {
        if (entry.id === "std-001" || entry.indexNo === "53914864") {
          const alreadyLogged = entry.recentExamScores.some((s) => s.paperId === p.id);
          if (!alreadyLogged) {
            entry.examsAttended += 1;
            entry.totalExamScore += p.studentScore.total;
            if (p.studentScore.total > entry.highestExamScore) {
              entry.highestExamScore = p.studentScore.total;
            }
            if (p.studentScore.rank && p.studentScore.rank < entry.bestExamRank) {
              entry.bestExamRank = p.studentScore.rank;
            }
            entry.recentExamScores.push({
              paperId: p.id,
              paperTitle: p.title,
              score: p.studentScore.total,
              part1: p.studentScore.part1,
              part2: p.studentScore.part2,
              grade: p.studentScore.grade,
              rank: p.studentScore.rank,
            });
          }
        }
      }
    }
  });

  // 3. Aggregate Quiz Results
  quizzes.forEach((q) => {
    if (q.completed && q.score !== undefined) {
      // Award completed quizzes to active students
      for (const [, entry] of map.entries()) {
        if (entry.id === "std-001" || entry.indexNo === "53914864") {
          entry.quizzesAttempted += 1;
          entry.totalQuizScore += q.score;
          const possible = q.totalMarks || 100;
          entry.totalPossibleQuizMarks += possible;
          entry.recentQuizScores.push({
            quizId: q.id,
            quizTitle: q.title,
            score: q.score,
            totalMarks: possible,
          });
        }
      }
    }
  });

  // Give other students realistic baseline quiz participation if not completed
  let seedIndex = 0;
  for (const [, entry] of map.entries()) {
    if (entry.quizzesAttempted === 0 && entry.examsAttended > 0) {
      // Simulate historical quiz points based on exam consistency
      const baseRatio = entry.totalExamScore / (entry.examsAttended * 100 || 1);
      const simulatedScore = Math.round(baseRatio * 20) + (seedIndex % 3);
      entry.quizzesAttempted = 2;
      entry.totalQuizScore = Math.min(simulatedScore * 2, 40);
      entry.totalPossibleQuizMarks = 40;
      entry.recentQuizScores.push({
        quizId: "seed-quiz-1",
        quizTitle: "Basic Double Entry Rules",
        score: simulatedScore,
        totalMarks: 20,
      });
      seedIndex++;
    }
  }

  // 4. Aggregate Evaluations
  evaluations.forEach((ev) => {
    for (const [, entry] of map.entries()) {
      if (entry.id === ev.studentId) {
        entry.evaluationsCount += 1;
        entry.latestPerformanceGrade = ev.performanceGrade;
        if (!entry.evaluationRemarks) entry.evaluationRemarks = [];
        entry.evaluationRemarks.push(ev.teacherRemarks);
      }
    }
  });

  // 5. Calculate Points, Averages, and Tiers
  const entries: StudentLeaderboardEntry[] = [];

  for (const [, entry] of map.entries()) {
    // Averages
    entry.avgExamScore =
      entry.examsAttended > 0
        ? Number((entry.totalExamScore / entry.examsAttended).toFixed(1))
        : 0;

    entry.quizAccuracy =
      entry.totalPossibleQuizMarks > 0
        ? Number(((entry.totalQuizScore / entry.totalPossibleQuizMarks) * 100).toFixed(1))
        : 0;

    // Points Formula:
    // Exam Points = Total accumulated marks in exams (rewarding consistency & performance)
    // Quiz Points = Total Quiz Marks * 5 (bonus XP for active online revision)
    // Evaluation Bonus = Outstanding (+60 pts), Very Good (+40 pts), Good (+20 pts)
    entry.examPoints = Math.round(entry.totalExamScore);
    entry.quizPoints = Math.round(entry.totalQuizScore * 5);

    let evalBonus = 0;
    if (entry.latestPerformanceGrade === "Outstanding") evalBonus = 60;
    else if (entry.latestPerformanceGrade === "Very Good") evalBonus = 40;
    else if (entry.latestPerformanceGrade === "Good") evalBonus = 20;
    else if (entry.evaluationsCount > 0) evalBonus = 15;
    entry.evaluationBonus = evalBonus;

    entry.totalPoints = entry.examPoints + entry.quizPoints + entry.evaluationBonus;

    entries.push(entry);
  }

  // 6. Sort by Total Points (descending), then by avgExamScore
  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.avgExamScore - a.avgExamScore;
  });

  // 7. Assign Ranks and Tiers
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
    if (entry.rank === 1) {
      entry.tier = "Grand Master Champion";
    } else if (entry.rank <= 3) {
      entry.tier = "Elite Scholar";
    } else if (entry.rank <= 10) {
      entry.tier = "Distinction Star";
    } else {
      entry.tier = "Merit Achiever";
    }
  });

  return entries;
}
