/* eslint-disable */
const fs = require("fs");
const path = require("path");

const pData = require("../../temp_build/paperClassData.js");
const lData = require("../../temp_build/lmsData.js");
const rData = require("../../temp_build/resultsData.js");

function escapeSql(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return val;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (typeof val === "object") {
    val = JSON.stringify(val);
  }
  const str = String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  });
  return `'${str}'`;
}

// 1. Prepare Users
const users = [];
const seenUserUids = new Set();
const seenPhones = new Set();
const seenIndexNos = new Set();

// Add initial LMS users
for (const u of lData.initialLmsUsers) {
  if (!seenUserUids.has(u.id)) {
    seenUserUids.add(u.id);
    if (u.phone) seenPhones.add(u.phone);
    if (u.indexNo) seenIndexNos.add(u.indexNo);
    users.push({
      user_uid: u.id,
      full_name: u.fullName,
      phone: u.phone,
      password: u.password || "pass123",
      role: u.role,
      index_no: u.indexNo || null,
      batch: u.batch || "2026 O/L Speed Revision & Paper Class",
      school: u.school || "Commerce Faculty",
      parent_phone: u.parentPhone || null,
      avatar_url: u.avatarUrl || null,
      enrolled_date: u.enrolledDate || "2025-01-10",
      status: u.status || "active"
    });
  }
}

// Add demo accounts from paperClassData
if (pData.demoAccounts) {
  for (const da of pData.demoAccounts) {
    const u = da.user;
    if (u && !seenUserUids.has(u.id)) {
      seenUserUids.add(u.id);
      let phone = "071" + Math.floor(1000000 + Math.random() * 9000000);
      if (u.id === "superadmin-01") phone = "0710000000";
      if (u.indexNo && seenIndexNos.has(u.indexNo)) {
        // already handled
      } else {
        if (u.indexNo) seenIndexNos.add(u.indexNo);
        users.push({
          user_uid: u.id,
          full_name: u.name,
          phone: phone,
          password: "pass123",
          role: u.role === "superadmin" ? "admin" : u.role,
          index_no: u.indexNo || null,
          batch: u.batch || "2026 O/L Paper Class",
          school: u.school || "Commerce Faculty",
          parent_phone: null,
          avatar_url: null,
          enrolled_date: "2025-01-15",
          status: "active"
        });
      }
    }
  }
}

// 2. Prepare Papers & Results
const papers = [];
const paperResults = [];
const seenPaperUids = new Set();
const seenResultUids = new Set();

for (const p of pData.paperClassList) {
  if (!seenPaperUids.has(p.id)) {
    seenPaperUids.add(p.id);
    papers.push({
      paper_uid: p.id,
      paper_number: p.paperNumber || "Paper 01",
      paper_code: p.paperCode || `EA-${p.id}`,
      title: p.title,
      batch: p.batch || "2026 O/L Speed Revision & Paper Class",
      subject: "Business & Accounting Studies",
      term: p.term || "Final Pre-Exam Assessment",
      month: p.examDate || "May",
      year: 2026,
      exam_date: p.examDate || "September 2026",
      total_marks: 100,
      duration_minutes: p.durationMinutes || 120,
      total_candidates: p.totalCandidates || (p.results ? p.results.length : 0),
      highest_mark: p.highestMark || 100,
      average_mark: p.averageMark || 75.0,
      pass_percentage: p.passPercentage || 98.5,
      topics: p.topics ? JSON.stringify(p.topics) : null,
      topper_info: p.topper ? JSON.stringify(p.topper) : null,
      score_distribution: p.scoreDistribution ? JSON.stringify(p.scoreDistribution) : null,
      pdf_url: `/downloads/${p.id}-paper.pdf`,
      marking_scheme_url: `/downloads/${p.id}-marking-scheme.pdf`,
      status: "published"
    });

    if (p.results && Array.isArray(p.results)) {
      for (const r of p.results) {
        const resUid = `${p.id}-${r.id || r.indexNo}`;
        if (!seenResultUids.has(resUid)) {
          seenResultUids.add(resUid);
          paperResults.push({
            result_uid: resUid,
            paper_uid: p.id,
            rank_in_class: r.rank || 1,
            student_name: r.name,
            school: r.school || "",
            index_no: r.indexNo,
            part1_score: r.part1Score || 0,
            part2_score: r.part2Score || 0,
            total_score: r.totalScore || 0,
            grade: r.grade || "A",
            achievement: r.achievement || null,
            avatar_initials: r.avatarInitials || "ST",
            avatar_image: r.avatarImage || null
          });

          // Register student in users table
          if (r.indexNo && !seenIndexNos.has(r.indexNo)) {
            seenIndexNos.add(r.indexNo);
            const userPhone = "07" + Math.floor(10000000 + Math.random() * 90000000);
            users.push({
              user_uid: `std-${r.indexNo}`,
              full_name: r.name,
              phone: userPhone,
              password: "pass123",
              role: "student",
              index_no: r.indexNo,
              batch: p.batch || "2026 O/L Speed Revision & Paper Class",
              school: r.school || "",
              parent_phone: null,
              avatar_url: r.avatarImage || null,
              enrolled_date: "2025-01-10",
              status: "active"
            });
          }
        }
      }
    }
  }
}

// 3. National Results from resultsData.ts
const nationalResults = [];
if (rData.resultsData) {
  for (const nr of rData.resultsData) {
    nationalResults.push({
      student_name: nr.name,
      school: nr.school,
      index_no: nr.indexNo,
      grade_badge: nr.gradeBadge,
      letter_grade: nr.letterGrade,
      is_top_champion: nr.isTopChampion ? 1 : 0
    });

    // Also register them into users if not already seen
    if (nr.indexNo && !seenIndexNos.has(nr.indexNo)) {
      seenIndexNos.add(nr.indexNo);
      const userPhone = "07" + Math.floor(10000000 + Math.random() * 90000000);
      users.push({
        user_uid: `std-${nr.indexNo}`,
        full_name: nr.name,
        phone: userPhone,
        password: "pass123",
        role: "student",
        index_no: nr.indexNo,
        batch: "National O/L Commerce Alumni",
        school: nr.school,
        parent_phone: null,
        avatar_url: null,
        enrolled_date: "2024-01-10",
        status: "active"
      });
    }
  }
}

// 4. Quizzes & Questions
const quizzes = [];
const quizQuestions = [];
const seenQuizUids = new Set();

for (const q of lData.initialLmsQuizzes) {
  if (!seenQuizUids.has(q.id)) {
    seenQuizUids.add(q.id);
    quizzes.push({
      quiz_uid: q.id,
      title: q.title,
      subject: q.subject,
      batch: q.batch,
      duration_minutes: q.durationMinutes || 15
    });

    if (q.questions && Array.isArray(q.questions)) {
      for (const qq of q.questions) {
        quizQuestions.push({
          quiz_uid: q.id,
          question_text: qq.question,
          options_json: JSON.stringify(qq.options),
          correct_answer: qq.correctAnswer,
          explanation: qq.explanation || ""
        });
      }
    }
  }
}

// 5. Evaluations
const evaluations = [];
for (const ev of lData.initialLmsEvaluations) {
  evaluations.push({
    evaluation_uid: ev.id,
    student_id: ev.studentId,
    paper_or_term: ev.paperOrTerm,
    evaluation_date: ev.date,
    attendance_rate: ev.attendanceRate,
    strengths: JSON.stringify(ev.strengths),
    weaknesses: JSON.stringify(ev.weaknesses),
    teacher_remarks: ev.teacherRemarks,
    recommended_action: ev.recommendedAction,
    performance_grade: ev.performanceGrade
  });
}

// Construct SQL string
let sql = `-- ========================================================
-- Evon Aravinda Commerce Education LMS Complete Database Seed
-- Database: evon_lms
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`evon_lms\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`evon_lms\`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS \`national_results\`, \`quiz_attempts\`, \`quiz_questions\`, \`evaluations\`, \`paper_results\`, \`quizzes\`, \`papers\`, \`users\`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`full_name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'student', 'superadmin') NOT NULL DEFAULT 'student',
  \`index_no\` VARCHAR(50) DEFAULT NULL,
  \`batch\` VARCHAR(150) DEFAULT '2026 O/L Speed Revision & Paper Class',
  \`school\` VARCHAR(150) DEFAULT NULL,
  \`parent_phone\` VARCHAR(20) DEFAULT NULL,
  \`avatar_url\` VARCHAR(255) DEFAULT NULL,
  \`enrolled_date\` VARCHAR(30) DEFAULT NULL,
  \`status\` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`phone\`),
  INDEX (\`role\`),
  INDEX (\`index_no\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`papers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`paper_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`paper_number\` VARCHAR(50) NOT NULL,
  \`paper_code\` VARCHAR(50) DEFAULT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`batch\` VARCHAR(150) NOT NULL,
  \`subject\` VARCHAR(150) DEFAULT 'Business & Accounting Studies',
  \`term\` VARCHAR(100) DEFAULT 'Final Pre-Exam Assessment',
  \`month\` VARCHAR(50) DEFAULT 'Monthly',
  \`year\` INT DEFAULT 2026,
  \`exam_date\` VARCHAR(50) DEFAULT '2026',
  \`total_marks\` INT DEFAULT 100,
  \`duration_minutes\` INT DEFAULT 120,
  \`total_candidates\` INT DEFAULT 0,
  \`highest_mark\` INT DEFAULT 100,
  \`average_mark\` DECIMAL(5,2) DEFAULT 75.00,
  \`pass_percentage\` DECIMAL(5,2) DEFAULT 95.00,
  \`topics\` TEXT DEFAULT NULL,
  \`topper_info\` TEXT DEFAULT NULL,
  \`score_distribution\` TEXT DEFAULT NULL,
  \`pdf_url\` VARCHAR(255) DEFAULT NULL,
  \`marking_scheme_url\` VARCHAR(255) DEFAULT NULL,
  \`status\` ENUM('published', 'upcoming', 'grading') NOT NULL DEFAULT 'published',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`paper_uid\`),
  INDEX (\`batch\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`paper_results\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`result_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`paper_uid\` VARCHAR(64) NOT NULL,
  \`rank_in_class\` INT DEFAULT 1,
  \`student_name\` VARCHAR(150) NOT NULL,
  \`school\` VARCHAR(150) DEFAULT NULL,
  \`index_no\` VARCHAR(50) NOT NULL,
  \`part1_score\` INT DEFAULT 0,
  \`part2_score\` INT DEFAULT 0,
  \`total_score\` INT DEFAULT 0,
  \`grade\` VARCHAR(10) DEFAULT 'A',
  \`achievement\` VARCHAR(255) DEFAULT NULL,
  \`avatar_initials\` VARCHAR(10) DEFAULT 'ST',
  \`avatar_image\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`paper_uid\`),
  INDEX (\`index_no\`),
  INDEX (\`total_score\`),
  INDEX (\`rank_in_class\`),
  UNIQUE KEY \`uq_paper_index\` (\`paper_uid\`, \`index_no\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`national_results\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_name\` VARCHAR(150) NOT NULL,
  \`school\` VARCHAR(150) NOT NULL,
  \`index_no\` VARCHAR(50) NOT NULL UNIQUE,
  \`grade_badge\` VARCHAR(10) NOT NULL,
  \`letter_grade\` VARCHAR(5) NOT NULL,
  \`is_top_champion\` TINYINT(1) DEFAULT 0,
  INDEX (\`index_no\`),
  INDEX (\`grade_badge\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`quizzes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quiz_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`title\` VARCHAR(255) NOT NULL,
  \`subject\` VARCHAR(120) DEFAULT 'Business Studies',
  \`batch\` VARCHAR(120) DEFAULT '2026/2027 O/L Commerce',
  \`duration_minutes\` INT DEFAULT 15,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`quiz_questions\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quiz_uid\` VARCHAR(64) NOT NULL,
  \`question_text\` TEXT NOT NULL,
  \`options_json\` TEXT NOT NULL,
  \`correct_answer\` TINYINT NOT NULL,
  \`explanation\` TEXT DEFAULT NULL,
  INDEX (\`quiz_uid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`quiz_attempts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`quiz_uid\` VARCHAR(64) NOT NULL,
  \`user_uid\` VARCHAR(64) NOT NULL,
  \`score\` INT NOT NULL,
  \`total_marks\` INT NOT NULL DEFAULT 100,
  \`attempted_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`quiz_uid\`),
  INDEX (\`user_uid\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`evaluations\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`evaluation_uid\` VARCHAR(64) NOT NULL UNIQUE,
  \`student_id\` VARCHAR(64) NOT NULL,
  \`paper_or_term\` VARCHAR(150) NOT NULL,
  \`evaluation_date\` DATE NOT NULL,
  \`attendance_rate\` INT DEFAULT 95,
  \`strengths\` TEXT DEFAULT NULL,
  \`weaknesses\` TEXT DEFAULT NULL,
  \`teacher_remarks\` TEXT NOT NULL,
  \`recommended_action\` TEXT NOT NULL,
  \`performance_grade\` VARCHAR(50) DEFAULT 'Outstanding',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`student_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- Insert Records
-- ========================================================
`;

// Insert Users in batches
sql += `\n-- 2. Insert Users (${users.length} accounts)\n`;
for (let i = 0; i < users.length; i += 50) {
  const chunk = users.slice(i, i + 50);
  sql += `INSERT INTO \`users\` (\`user_uid\`, \`full_name\`, \`phone\`, \`password\`, \`role\`, \`index_no\`, \`batch\`, \`school\`, \`parent_phone\`, \`avatar_url\`, \`enrolled_date\`, \`status\`)\nVALUES\n`;
  const rows = chunk.map((u) => {
    return `(${escapeSql(u.user_uid)}, ${escapeSql(u.full_name)}, ${escapeSql(u.phone)}, ${escapeSql(u.password)}, ${escapeSql(u.role)}, ${escapeSql(u.index_no)}, ${escapeSql(u.batch)}, ${escapeSql(u.school)}, ${escapeSql(u.parent_phone)}, ${escapeSql(u.avatar_url)}, ${escapeSql(u.enrolled_date)}, ${escapeSql(u.status)})`;
  });
  sql += rows.join(",\n");
  sql += `\nON DUPLICATE KEY UPDATE \`full_name\`=VALUES(\`full_name\`), \`role\`=VALUES(\`role\`), \`index_no\`=VALUES(\`index_no\`), \`school\`=VALUES(\`school\`);\n`;
}

// Insert Papers
sql += `\n-- 3. Insert Papers (${papers.length} exams)\n`;
sql += `INSERT INTO \`papers\` (\`paper_uid\`, \`paper_number\`, \`paper_code\`, \`title\`, \`batch\`, \`subject\`, \`term\`, \`month\`, \`year\`, \`exam_date\`, \`total_marks\`, \`duration_minutes\`, \`total_candidates\`, \`highest_mark\`, \`average_mark\`, \`pass_percentage\`, \`topics\`, \`topper_info\`, \`score_distribution\`, \`pdf_url\`, \`marking_scheme_url\`, \`status\`)\nVALUES\n`;
const paperRows = papers.map((p) => {
  return `(${escapeSql(p.paper_uid)}, ${escapeSql(p.paper_number)}, ${escapeSql(p.paper_code)}, ${escapeSql(p.title)}, ${escapeSql(p.batch)}, ${escapeSql(p.subject)}, ${escapeSql(p.term)}, ${escapeSql(p.month)}, ${escapeSql(p.year)}, ${escapeSql(p.exam_date)}, ${escapeSql(p.total_marks)}, ${escapeSql(p.duration_minutes)}, ${escapeSql(p.total_candidates)}, ${escapeSql(p.highest_mark)}, ${escapeSql(p.average_mark)}, ${escapeSql(p.pass_percentage)}, ${escapeSql(p.topics)}, ${escapeSql(p.topper_info)}, ${escapeSql(p.score_distribution)}, ${escapeSql(p.pdf_url)}, ${escapeSql(p.marking_scheme_url)}, ${escapeSql(p.status)})`;
});
sql += paperRows.join(",\n");
sql += `\nON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`), \`total_candidates\`=VALUES(\`total_candidates\`), \`highest_mark\`=VALUES(\`highest_mark\`);\n`;

// Insert Paper Results in batches
sql += `\n-- 4. Insert Student Exam Results (${paperResults.length} records)\n`;
for (let i = 0; i < paperResults.length; i += 50) {
  const chunk = paperResults.slice(i, i + 50);
  sql += `INSERT INTO \`paper_results\` (\`result_uid\`, \`paper_uid\`, \`rank_in_class\`, \`student_name\`, \`school\`, \`index_no\`, \`part1_score\`, \`part2_score\`, \`total_score\`, \`grade\`, \`achievement\`, \`avatar_initials\`, \`avatar_image\`)\nVALUES\n`;
  const resultRows = chunk.map((r) => {
    return `(${escapeSql(r.result_uid)}, ${escapeSql(r.paper_uid)}, ${escapeSql(r.rank_in_class)}, ${escapeSql(r.student_name)}, ${escapeSql(r.school)}, ${escapeSql(r.index_no)}, ${escapeSql(r.part1_score)}, ${escapeSql(r.part2_score)}, ${escapeSql(r.total_score)}, ${escapeSql(r.grade)}, ${escapeSql(r.achievement)}, ${escapeSql(r.avatar_initials)}, ${escapeSql(r.avatar_image)})`;
  });
  sql += resultRows.join(",\n");
  sql += `\nON DUPLICATE KEY UPDATE \`total_score\`=VALUES(\`total_score\`), \`rank_in_class\`=VALUES(\`rank_in_class\`), \`grade\`=VALUES(\`grade\`);\n`;
}

// Insert National Results
if (nationalResults.length > 0) {
  sql += `\n-- 5. Insert National O/L Exam Results (${nationalResults.length} records)\n`;
  for (let i = 0; i < nationalResults.length; i += 50) {
    const chunk = nationalResults.slice(i, i + 50);
    sql += `INSERT INTO \`national_results\` (\`student_name\`, \`school\`, \`index_no\`, \`grade_badge\`, \`letter_grade\`, \`is_top_champion\`)\nVALUES\n`;
    const nrRows = chunk.map((nr) => {
      return `(${escapeSql(nr.student_name)}, ${escapeSql(nr.school)}, ${escapeSql(nr.index_no)}, ${escapeSql(nr.grade_badge)}, ${escapeSql(nr.letter_grade)}, ${nr.is_top_champion})`;
    });
    sql += nrRows.join(",\n");
    sql += `\nON DUPLICATE KEY UPDATE \`student_name\`=VALUES(\`student_name\`), \`school\`=VALUES(\`school\`), \`grade_badge\`=VALUES(\`grade_badge\`);\n`;
  }
}

// Insert Quizzes
if (quizzes.length > 0) {
  sql += `\n-- 6. Insert Quizzes (${quizzes.length} modules)\n`;
  sql += `INSERT INTO \`quizzes\` (\`quiz_uid\`, \`title\`, \`subject\`, \`batch\`, \`duration_minutes\`)\nVALUES\n`;
  const quizRows = quizzes.map((q) => {
    return `(${escapeSql(q.quiz_uid)}, ${escapeSql(q.title)}, ${escapeSql(q.subject)}, ${escapeSql(q.batch)}, ${escapeSql(q.duration_minutes)})`;
  });
  sql += quizRows.join(",\n");
  sql += `\nON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);\n`;
}

// Insert Quiz Questions
if (quizQuestions.length > 0) {
  sql += `\n-- 7. Insert Quiz Questions (${quizQuestions.length} questions)\n`;
  sql += `DELETE FROM \`quiz_questions\`;\n`;
  sql += `INSERT INTO \`quiz_questions\` (\`quiz_uid\`, \`question_text\`, \`options_json\`, \`correct_answer\`, \`explanation\`)\nVALUES\n`;
  const qqRows = quizQuestions.map((qq) => {
    return `(${escapeSql(qq.quiz_uid)}, ${escapeSql(qq.question_text)}, ${escapeSql(qq.options_json)}, ${escapeSql(qq.correct_answer)}, ${escapeSql(qq.explanation)})`;
  });
  sql += qqRows.join(",\n");
  sql += `;\n`;
}

// Insert Evaluations
if (evaluations.length > 0) {
  sql += `\n-- 8. Insert Evaluations (${evaluations.length} records)\n`;
  sql += `INSERT INTO \`evaluations\` (\`evaluation_uid\`, \`student_id\`, \`paper_or_term\`, \`evaluation_date\`, \`attendance_rate\`, \`strengths\`, \`weaknesses\`, \`teacher_remarks\`, \`recommended_action\`, \`performance_grade\`)\nVALUES\n`;
  const evalRows = evaluations.map((ev) => {
    return `(${escapeSql(ev.evaluation_uid)}, ${escapeSql(ev.student_id)}, ${escapeSql(ev.paper_or_term)}, ${escapeSql(ev.evaluation_date)}, ${escapeSql(ev.attendance_rate)}, ${escapeSql(ev.strengths)}, ${escapeSql(ev.weaknesses)}, ${escapeSql(ev.teacher_remarks)}, ${escapeSql(ev.recommended_action)}, ${escapeSql(ev.performance_grade)})`;
  });
  sql += evalRows.join(",\n");
  sql += `\nON DUPLICATE KEY UPDATE \`teacher_remarks\`=VALUES(\`teacher_remarks\`);\n`;
}

const outPath = path.resolve(__dirname, "../database/seed_all_data.sql");
fs.writeFileSync(outPath, sql, "utf8");
console.log(`Successfully generated ${outPath}!`);
console.log(`Stats: Users: ${users.length}, Papers: ${papers.length}, Paper Results: ${paperResults.length}, National Results: ${nationalResults.length}, Quizzes: ${quizzes.length}, Questions: ${quizQuestions.length}, Evaluations: ${evaluations.length}`);
