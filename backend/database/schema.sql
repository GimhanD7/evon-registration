-- ========================================================
-- Evon Aravinda Commerce Education LMS Database Schema
-- Database: evon_lms
-- XAMPP MySQL Configuration
-- ========================================================

CREATE DATABASE IF NOT EXISTS `evon_lms` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `evon_lms`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `national_results`, `quiz_attempts`, `quiz_questions`, `evaluations`, `paper_results`, `quizzes`, `papers`, `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table (Role-based: admin & student & superadmin)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_uid` VARCHAR(64) NOT NULL UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student', 'superadmin') NOT NULL DEFAULT 'student',
  `index_no` VARCHAR(50) DEFAULT NULL,
  `batch` VARCHAR(150) DEFAULT '2026 O/L Speed Revision & Paper Class',
  `school` VARCHAR(150) DEFAULT NULL,
  `parent_phone` VARCHAR(20) DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `enrolled_date` VARCHAR(30) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`phone`),
  INDEX (`role`),
  INDEX (`index_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Papers / Exams Table
CREATE TABLE IF NOT EXISTS `papers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `paper_uid` VARCHAR(64) NOT NULL UNIQUE,
  `paper_number` VARCHAR(50) NOT NULL,
  `paper_code` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `batch` VARCHAR(150) NOT NULL,
  `subject` VARCHAR(150) DEFAULT 'Business & Accounting Studies',
  `term` VARCHAR(100) DEFAULT 'Final Pre-Exam Assessment',
  `month` VARCHAR(50) DEFAULT 'Monthly',
  `year` INT DEFAULT 2026,
  `exam_date` VARCHAR(50) DEFAULT '2026',
  `total_marks` INT DEFAULT 100,
  `duration_minutes` INT DEFAULT 120,
  `total_candidates` INT DEFAULT 0,
  `highest_mark` INT DEFAULT 100,
  `average_mark` DECIMAL(5,2) DEFAULT 75.00,
  `pass_percentage` DECIMAL(5,2) DEFAULT 95.00,
  `topics` TEXT DEFAULT NULL,
  `topper_info` TEXT DEFAULT NULL,
  `score_distribution` TEXT DEFAULT NULL,
  `pdf_url` VARCHAR(255) DEFAULT NULL,
  `marking_scheme_url` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('published', 'upcoming', 'grading') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`paper_uid`),
  INDEX (`batch`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Paper Student Marks / Results Table
CREATE TABLE IF NOT EXISTS `paper_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `result_uid` VARCHAR(64) NOT NULL UNIQUE,
  `paper_uid` VARCHAR(64) NOT NULL,
  `rank_in_class` INT DEFAULT 1,
  `student_name` VARCHAR(150) NOT NULL,
  `school` VARCHAR(150) DEFAULT NULL,
  `index_no` VARCHAR(50) NOT NULL,
  `part1_score` INT DEFAULT 0,
  `part2_score` INT DEFAULT 0,
  `total_score` INT DEFAULT 0,
  `grade` VARCHAR(10) DEFAULT 'A',
  `achievement` VARCHAR(255) DEFAULT NULL,
  `avatar_initials` VARCHAR(10) DEFAULT 'ST',
  `avatar_image` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`paper_uid`),
  INDEX (`index_no`),
  INDEX (`total_score`),
  INDEX (`rank_in_class`),
  UNIQUE KEY `uq_paper_index` (`paper_uid`, `index_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. National Results Table (Island-wide O/L Top Ranks)
CREATE TABLE IF NOT EXISTS `national_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_name` VARCHAR(150) NOT NULL,
  `school` VARCHAR(150) NOT NULL,
  `index_no` VARCHAR(50) NOT NULL UNIQUE,
  `grade_badge` VARCHAR(10) NOT NULL,
  `letter_grade` VARCHAR(5) NOT NULL,
  `is_top_champion` TINYINT(1) DEFAULT 0,
  INDEX (`index_no`),
  INDEX (`grade_badge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Quizzes Table
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(120) DEFAULT 'Business Studies',
  `batch` VARCHAR(120) DEFAULT '2026/2027 O/L Commerce',
  `duration_minutes` INT DEFAULT 15,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Quiz Questions Table
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL,
  `question_text` TEXT NOT NULL,
  `options_json` TEXT NOT NULL,
  `correct_answer` TINYINT NOT NULL COMMENT '0=A, 1=B, 2=C, 3=D',
  `explanation` TEXT DEFAULT NULL,
  INDEX (`quiz_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL,
  `user_uid` VARCHAR(64) NOT NULL,
  `score` INT NOT NULL,
  `total_marks` INT NOT NULL DEFAULT 100,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`quiz_uid`),
  INDEX (`user_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Student Evaluations Table
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `evaluation_uid` VARCHAR(64) NOT NULL UNIQUE,
  `student_id` VARCHAR(64) NOT NULL,
  `paper_or_term` VARCHAR(150) NOT NULL,
  `evaluation_date` DATE NOT NULL,
  `attendance_rate` INT DEFAULT 95,
  `strengths` TEXT DEFAULT NULL,
  `weaknesses` TEXT DEFAULT NULL,
  `teacher_remarks` TEXT NOT NULL,
  `recommended_action` TEXT NOT NULL,
  `performance_grade` VARCHAR(50) DEFAULT 'Outstanding',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
