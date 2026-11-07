-- ========================================================
-- Evon Aravinda Commerce Education LMS Clean Database Setup
-- Database: evon_lms (Local) / kasuormb_evon (Hosting)
-- All mock/sample data removed - clean production state
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `app_settings`, `activity_logs`, `national_results`, `quiz_attempts`, `quiz_questions`, `evaluations`, `paper_results`, `quizzes`, `papers`, `users`, `batches`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
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
  `year` INT DEFAULT 2025,
  `grade_badge` VARCHAR(10) NOT NULL,
  `letter_grade` VARCHAR(5) NOT NULL,
  `is_top_champion` TINYINT(1) DEFAULT 0,
  `quote` TEXT DEFAULT NULL,
  `avatar_image` VARCHAR(255) DEFAULT NULL,
  INDEX (`index_no`),
  INDEX (`year`),
  INDEX (`grade_badge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Quizzes Table
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(120) DEFAULT 'Business Studies',
  `batch` VARCHAR(120) DEFAULT '2026/2027 O/L Commerce',
  `duration_minutes` INT DEFAULT 15,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Quiz Questions Table
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL,
  `question_text` TEXT NOT NULL,
  `options_json` TEXT NOT NULL,
  `correct_answer` TINYINT NOT NULL COMMENT '0=A, 1=B, 2=C, 3=D',
  `explanation` TEXT DEFAULT NULL,
  INDEX (`quiz_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Quiz Attempts Table
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

-- 8. Student Evaluations Table
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

-- 9. Batches Table
CREATE TABLE IF NOT EXISTS `batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Activity Logs Table
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `log_uid` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` VARCHAR(64) DEFAULT 'guest',
  `user_name` VARCHAR(150) NOT NULL DEFAULT 'Anonymous User',
  `user_role` VARCHAR(50) NOT NULL DEFAULT 'student',
  `action` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'system',
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(100) DEFAULT NULL,
  `device` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('success', 'warning', 'info') NOT NULL DEFAULT 'info',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`category`),
  INDEX (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. App Settings Table (Stores System Config & Security PIN)
CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_key` VARCHAR(64) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `app_settings` (`setting_key`, `setting_value`)
VALUES ('security_pin', '1234')
ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;

-- ========================================================
-- Root Educator / Admin & Sample Student Accounts
-- ========================================================
INSERT INTO `users` (`user_uid`, `full_name`, `phone`, `password`, `role`, `index_no`, `batch`, `school`, `parent_phone`, `avatar_url`, `enrolled_date`, `status`)
VALUES
('admin-01', 'Evon Aravinda (Lead Educator & Admin)', '0719998877', 'admin123', 'admin', NULL, 'All Batches', 'Main Faculty', NULL, '/images/educator.jpg', '2024-01-01', 'active'),
('std-001', 'Kasun Perera (Sample Student)', '0771234567', 'pass123', 'student', '53914864', '2026 O/L Speed Revision & Paper Class', 'Royal College, Colombo 07', '0777654321', '/images/top_student_rank1.jpg', '2026-01-15', 'active')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- Default Batches
INSERT IGNORE INTO `batches` (`name`) VALUES
('2025 O/L Speed Revision'),
('2026 O/L Paper Class'),
('2027 O/L Foundation Batch');




-- ========================================================
-- National Distinction Results (169+ Authenticated Achievers)
-- ========================================================
INSERT INTO `national_results` (`student_name`, `school`, `index_no`, `year`, `grade_badge`, `letter_grade`, `is_top_champion`, `quote`, `avatar_image`) VALUES
('Yashodhini Vihara', 'Devi Balika Vidyalaya, Colombo', '53560574', 2025, 'A9', 'A', 1, NULL, NULL),
('Akithra Induwari', 'Ananda Balika Vidyalaya, Colombo', '53511450', 2025, 'A9', 'A', 1, NULL, NULL),
('Hasal Samaranayake', 'Ananda College, Colombo', '53519028', 2025, 'A9', 'A', 1, NULL, NULL),
('Vidun Wickramasinghe', 'Sumedha College, Gampaha', '53914473', 2025, 'A9', 'A', 1, NULL, NULL),
('Tenushi Pamodya', 'Sumedha College, Gampaha', '53914864', 2025, 'A9', 'A', 1, NULL, NULL),
('Senal Rajapakse', 'Sussex College, Kiribathgoda', '54054133', 2025, 'A9', 'A', 1, NULL, NULL),
('W.W.M. Panchanga', 'Asoka College, Colombo 10', '53523938', 2025, 'A9', 'A', 1, NULL, NULL),
('Shehan Rashmitha', 'Bandaranayake College, Gampaha', '53884477', 2025, 'A9', 'A', 1, NULL, NULL),
('Desandi Thinara', 'Bandaranayake Central College, Veyangoda', '53936817', 2025, 'A9', 'A', 1, NULL, NULL),
('Deneth Nimtharu', 'Thurstan College, Colombo', '53582012', 2025, 'A9', 'A', 1, NULL, NULL),
('Sethmi Thehasna', 'Viharamahadevi Balika Vidyalaya, Kiribathgoda', '54068177', 2025, 'A9', 'A', 1, NULL, NULL),
('Minradha Ranasinghe', 'Viharamahadevi Balika Vidyalaya, Kiribathgoda', '54068231', 2025, 'A9', 'A', 1, NULL, NULL),
('Disas Harshana', 'Bandaranayake Central College, Veyangoda', '53936671', 2025, 'A9', 'A', 1, NULL, NULL),
('Linuka Damsanda', 'Bandaranayake College, Gampaha', '53884191', 2025, 'A9', 'A', 1, NULL, NULL),
('Damithu Thenujaya', 'Bandaranayake College, Gampaha', '53883780', 2025, 'A9', 'A', 1, NULL, NULL),
('Sawani Pamalya', 'Viharamahadevi Balika Vidyalaya', '54067928', 2025, 'A9', 'A', 1, NULL, NULL),
('Yoshini Mihindi', 'Viharamahadevi Balika Vidyalaya', '54068363', 2025, 'A9', 'A', 1, NULL, NULL),
('Vidath Damsara', 'Bandaranayake College, Gampaha', '53884485', 2025, 'A9', 'A', 1, NULL, NULL),
('Miyuru Vishwajith', 'Bandaranayake College, Gampaha', '53883616', 2025, 'A9', 'A', 1, NULL, NULL),
('Pesandu Lukdiw', 'Bandaranayake College, Gampaha', '53883918', 2025, 'A9', 'A', 1, NULL, NULL),
('Malki Nimthara', 'Yasodara Devi Balika Vidyalaya', '53912209', 2025, 'A9', 'A', 1, NULL, NULL),
('Inudi Hesansa', 'Yasodara Devi Balika Vidyalaya', '53912560', 2025, 'A9', 'A', 1, NULL, NULL),
('Devangi Amarasinghe', 'Yasodara Devi Balika Vidyalaya', '53912470', 2025, 'A9', 'A', 1, NULL, NULL),
('Senuth Dinsara', 'Bandaranayake College, Gampaha', '53884493', 2025, 'A9', 'A', 1, NULL, NULL),
('Ehansa Kurukulasuriya', 'Bishops College, Colombo', '53506189', 2025, 'A9', 'A', 1, NULL, NULL),
('Kulitha Ranudaya', 'Britishway International School, Nittambuwa', '54271010', 2025, 'A9', 'A', 1, NULL, NULL),
('Minoli Sadithma', 'Negombo South International School', '53961480', 2025, 'A9', 'A', 1, NULL, NULL),
('Danuli De Silva', 'Devi Balika Vidyalaya, Colombo', '53560841', 2025, 'A9', 'A', 1, NULL, NULL),
('Duveesha Amarasinghe', 'Gothami Balika Vidyalaya, Colombo', '53524330', 2025, 'A9', 'A', 1, NULL, NULL),
('Buthsara Dinumuthu', 'Gurukula College, Kelaniya', '54085470', 2025, 'A9', 'A', 1, NULL, NULL),
('Kajini Kashmira', 'Gurukula College, Kelaniya', '54086736', 2025, 'A9', 'A', 1, NULL, NULL),
('Adhithi Alwis', 'Holy Cross College, Gampaha', '53890949', 2025, 'A9', 'A', 1, NULL, NULL),
('Nevinka Fernando', 'Holy Cross College, Gampaha', '53890744', 2025, 'A9', 'A', 1, NULL, NULL),
('Chathuni Jayasinghe', 'Holy Cross College, Gampaha', '53891015', 2025, 'A9', 'A', 1, NULL, NULL),
('Dulithi Nevithma', 'Holy Cross College, Gampaha', '53891040', 2025, 'A9', 'A', 1, NULL, NULL),
('Sandesh Ayodhya', 'Karunarathna Buddhist College, Mathumagala', '54001650', 2025, 'A9', 'A', 1, NULL, NULL),
('Ovini Nithasha', 'Mahamaya Girls College, Kadawatha', '54052360', 2025, 'A9', 'A', 1, NULL, NULL),
('Kavi Rivisahan', 'Mahanama College, Colombo', '53586301', 2025, 'A9', 'A', 1, NULL, NULL),
('Hesali Alwis', 'Musaeus College, Colombo', '53554396', 2025, 'A9', 'A', 1, NULL, NULL),
('Nethuki Lehansa', 'Musaeus College, Colombo', '53553250', 2025, 'A9', 'A', 1, NULL, NULL),
('Kumali Herath', 'Musaeus College, Colombo', '53553290', 2025, 'A9', 'A', 1, NULL, NULL),
('Chanuga Walpola', 'Nalanda College, Colombo', '53530357', 2025, 'A9', 'A', 1, NULL, NULL),
('Virajitha Nitheesh', 'Negombo South International School', '53961463', 2025, 'A9', 'A', 1, NULL, NULL),
('Maheema Sithumini', 'Rathnavali Balika Vidyalaya, Gampaha', '53923324', 2025, 'A9', 'A', 1, NULL, NULL),
('Gehara Dharmasri', 'Rathnavali Balika Vidyalaya, Gampaha', '53923383', 2025, 'A9', 'A', 1, NULL, NULL),
('Geehara Anusari', 'Sirimavo Bandaranaike Vidyalaya, Colombo', '53605900', 2025, 'A9', 'A', 1, NULL, NULL),
('Kisal Weerakone', 'St. Joseph''s College, Colombo', '53494644', 2025, 'A9', 'A', 1, NULL, NULL),
('Denith Manthuja', 'St. Joseph''s College', '25047936', 2025, 'A9', 'A', 1, NULL, NULL),
('Kevin Adrian', 'St. Joseph''s College', '53494296', 2025, 'A9', 'A', 1, NULL, NULL),
('Vinudi Dahamila', 'Sumedha College, Gampaha', '53914708', 2025, 'A9', 'A', 1, NULL, NULL),
('Mihindi Dias', 'Yoshida Shokanji International', '53734017', 2025, 'A8', 'A', 0, NULL, NULL),
('Sasika Tharupathi', 'Gurukula College, Kelaniya', '54085411', 2025, 'A8', 'A', 0, NULL, NULL),
('Yasith Gunathilake', 'Ananda College, Colombo', '53518578', 2025, 'A8', 'A', 0, NULL, NULL),
('Sinura Vidun', 'Ananda College, Colombo', '53519930', 2025, 'A8', 'A', 0, NULL, NULL),
('Nethaka Vinsith', 'Asoka College, Colombo 10', '53523830', 2025, 'A8', 'A', 0, NULL, NULL),
('Dulmika Ransen', 'Gurukula College, Kelaniya', '54085519', 2025, 'A8', 'A', 0, NULL, NULL),
('Isindu Kethmin', 'Gurukula College, Kelaniya', '54085373', 2025, 'A8', 'A', 0, NULL, NULL),
('Amasha Fernando', 'Holy Cross College, Gampaha', '53890884', 2025, 'A8', 'A', 0, NULL, NULL),
('H.M.N. Ahasna', 'Lyceum International School', '54096332', 2025, 'A8', 'A', 0, NULL, NULL),
('Oneli Lithasha', 'Mahamaya Girls College, Kadawatha', '54052432', 2025, 'A8', 'A', 0, NULL, NULL),
('Jayith Sandira', 'Mahanama College, Colombo', '53586603', 2025, 'A8', 'A', 0, NULL, NULL),
('Nisira Nimsara', 'Mahanama College, Colombo', '53586638', 2025, 'A8', 'A', 0, NULL, NULL),
('Kusalya Indrawansa', 'Musaeus College, Colombo', '53554647', 2025, 'A8', 'A', 0, NULL, NULL),
('Piyumali Jayasinghe', 'Musaeus College, Colombo', '53554507', 2025, 'A8', 'A', 0, NULL, NULL),
('Shehara Dewwini', 'OKI International School', '54032075', 2025, 'A8', 'A', 0, NULL, NULL),
('Shwetha Amashi', 'Rathnavali Balika Vidyalaya, Gampaha', '53923057', 2025, 'A8', 'A', 0, NULL, NULL),
('Sanuka Devnija', 'S. Thomas'' Preparatory School, Kollupitiya', '54600541', 2025, 'A8', 'A', 0, NULL, NULL),
('Anushari Keshangi', 'Sapugaskanda Vishaka Balika Vidyalaya', '54074177', 2025, 'A8', 'A', 0, NULL, NULL),
('Kris Fernando', 'St. Joseph''s College', '53494954', 2025, 'A8', 'A', 0, NULL, NULL),
('Nadeeja Oshada', 'St. Joseph''s College', '54017343', 2025, 'A8', 'A', 0, NULL, NULL),
('Ramika Dharmawardana', 'Sumedha College, Gampaha', '53914589', 2025, 'A8', 'A', 0, NULL, NULL),
('Mahimi Theersha', 'Sumedha College, Gampaha', '53914775', 2025, 'A8', 'A', 0, NULL, NULL),
('Osanda Dinsara', 'Sumedha College, Gampaha', '53914554', 2025, 'A8', 'A', 0, NULL, NULL),
('Gihansa Ranumi', 'Sumedha College, Gampaha', '53914660', 2025, 'A8', 'A', 0, NULL, NULL),
('Sanuki Sanulya', 'Sumedha College, Gampaha', '53914805', 2025, 'A8', 'A', 0, NULL, NULL),
('Sajana Insara', 'Sumedha College, Gampaha', '53914546', 2025, 'A8', 'A', 0, NULL, NULL),
('Thehan Nimsara', 'Sussex College, Kiribathgoda', '54051525', 2025, 'A8', 'A', 0, NULL, NULL),
('Vihanga Bandara', 'Thurstan College, Colombo', '53581997', 2025, 'A8', 'A', 0, NULL, NULL),
('Senuthi Udhamsa', 'Viharamahadevi Balika Vidyalaya', '54067901', 2025, 'A8', 'A', 0, NULL, NULL),
('Siluni Himandee', 'Vishaka Balika Vidyalaya, Sapugaskanda', '54074452', 2025, 'A8', 'A', 0, NULL, NULL),
('Supipi Vidarshana', 'Yasodara Devi Balika Vidyalaya', '53912217', 2025, 'A8', 'A', 0, NULL, NULL),
('Ashvini Deeshana', 'Yasodara Devi Balika Vidyalaya', '53911172', 2025, 'A8', 'A', 0, NULL, NULL),
('Mahith Shervin', 'York International School', '54036330', 2025, 'A8', 'A', 0, NULL, NULL),
('Mathista Prabashwara', 'York International School', '54036283', 2025, 'A8', 'A', 0, NULL, NULL),
('Daham Iroshana', 'Yoshida Shokanji International', '54096731', 2025, 'A8', 'A', 0, NULL, NULL),
('Chithira Thilakaweera', 'D.S. Senanayake College, Colombo', '53556216', 2025, 'A7', 'A', 0, NULL, NULL),
('Adeesha Nimsarani', 'Yasodara Devi Balika Vidyalaya', '53912667', 2025, 'A7', 'A', 0, NULL, NULL),
('Nadinsa Wickramasingha', 'Holy Cross College, Gampaha', '53890922', 2025, 'A7', 'A', 0, NULL, NULL),
('Methushi Bopearatchy', 'Holy Family Convent, Bambalapitiya', '53603222', 2025, 'A7', 'A', 0, NULL, NULL),
('Mihin Gulawita', 'Lyceum International School', '53920538', 2025, 'A7', 'A', 0, NULL, NULL),
('Imira Sethmika', 'Mahanama College, Colombo', '53586565', 2025, 'A7', 'A', 0, NULL, NULL),
('Risindi Nethsandi', 'Musaeus College, Colombo', '53553810', 2025, 'A7', 'A', 0, NULL, NULL),
('Lohansa Natharie', 'Sapugaskanda Vishaka Balika Vidyalaya', '54074150', 2025, 'A7', 'A', 0, NULL, NULL),
('Kaveesha Ranindu', 'Sri Dharmaloka College, Kelaniya', '54091250', 2025, 'A7', 'A', 0, NULL, NULL),
('Sithuki Nelithma', 'Sri Sanghabodhi National School', '53951360', 2025, 'A7', 'A', 0, NULL, NULL),
('N.L.D. Thilakarathne', 'Sri Sanghabodhi National School', '53951280', 2025, 'A7', 'A', 0, NULL, NULL),
('Pawara Nethsilu', 'St. Joseph''s College', '5401731', 2025, 'A7', 'A', 0, NULL, NULL),
('Abheetha Basuru', 'St. Joseph''s College', '54017262', 2025, 'A7', 'A', 0, NULL, NULL),
('Kaveesha Manasith', 'Sumedha College, Gampaha', '53914228', 2025, 'A7', 'A', 0, NULL, NULL),
('Hiruka Randiew', 'Sumedha College, Gampaha', '53914961', 2025, 'A7', 'A', 0, NULL, NULL),
('Yehara Sinadi', 'Thakshila College, Gampaha', '53891791', 2025, 'A7', 'A', 0, NULL, NULL),
('Rusandu Thanuwara', 'Thakshila College, Gampaha', '53891554', 2025, 'A7', 'A', 0, NULL, NULL),
('Jayali Sandareka', 'Vishaka Balika Vidyalaya, Sapugaskanda', '54074363', 2025, 'A7', 'A', 0, NULL, NULL),
('Sanulya Ransadee', 'Vishaka Balika Vidyalaya, Sapugaskanda', '54074215', 2025, 'A7', 'A', 0, NULL, NULL),
('Thinuga Gunawardana', 'Wesley College, Colombo', '53547616', 2025, 'A7', 'A', 0, NULL, NULL),
('Nethuli Nuhansa', 'Yasodara Devi Balika Vidyalaya', '53912764', 2025, 'A7', 'A', 0, NULL, NULL),
('Dulansa Sayumdi', 'Vishaka Balika Vidyalaya, Sapugaskanda', '54074371', 2025, 'A7', 'A', 0, NULL, NULL),
('Thiseni Yohansa', 'Yasodara Devi Balika Vidyalaya', '53912233', 2025, 'A7', 'A', 0, NULL, NULL),
('Jethmi Sethumya', 'Vishaka Balika Vidyalaya, Sapugaskanda', '54074347', 2025, 'A7', 'A', 0, NULL, NULL),
('Shanuka Nethsara', 'Bandaranayake College, Gampaha', '53884531', 2025, 'A7', 'A', 0, NULL, NULL),
('Fahad Feroz', 'St. Anthony''s College, Wattala', '54012180', 2025, 'A7', 'A', 0, NULL, NULL),
('Sandabomi Bandara', 'Sri Dharmaloka College, Kelaniya', '24782', 2025, 'A', 'A', 0, NULL, NULL),
('Pratibha Kataria', 'Yoshida Shokanji International', '54096952', 2025, 'A', 'A', 0, NULL, NULL),
('Senuli U. Perera', 'Holy Cross College, Gampaha', '53889100', 2025, 'A', 'A', 0, NULL, NULL),
('Ganguni Thisarani', 'Galahitiyawa Central College', '53928300', 2025, 'A', 'A', 0, NULL, NULL),
('Akil Kameor', 'Sussex College, Kiribathgoda', '54053951', 2025, 'A', 'A', 0, NULL, NULL),
('Nisalnee Samarasingha', 'Yoshida Shokanji International', '54096987', 2025, 'A', 'A', 0, NULL, NULL),
('Janindu Wathsara', 'Thakshila College, Gampaha', '53891570', 2025, 'A', 'A', 0, NULL, NULL),
('Mihin Hewananyake', 'Sri Dharmaloka College, Kelaniya', '200938', 2025, 'A', 'A', 0, NULL, NULL),
('Lithiru Ravina', 'St. Mary''s College', '53941446', 2025, 'A', 'A', 0, NULL, NULL),
('Sachinth Himanga', 'Lyceum International School', '54054231', 2025, 'A', 'A', 0, NULL, NULL),
('Ninada Edirisinghe', 'Wesley College, Colombo', '53547659', 2025, 'A', 'A', 0, NULL, NULL),
('Leena Sadath', 'J.M.C International School', '54046394', 2025, 'A', 'A', 0, NULL, NULL),
('Methuni Sandesna', 'Sapugaskanda Maha Vidyalaya', '54072441', 2025, 'A', 'A', 0, NULL, NULL),
('Pansiu Reshan', 'Nalanda College, Colombo', '53530411', 2025, 'A', 'A', 0, NULL, NULL),
('Dinuli Kumarage', 'OKI International School', '54032040', 2025, 'A', 'A', 0, NULL, NULL),
('Vihara Diyamanti', 'St. Anne''s Balika Maha Vidyalaya', '54008808', 2025, 'A', 'A', 0, NULL, NULL),
('Esandi Bimansa', 'Viharamahadevi Balika Vidyalaya, Kiribathgoda', '54068266', 2025, 'A', 'A', 0, NULL, NULL),
('Mesandi Methma', 'Lyceum International School', '54195071', 2025, 'A', 'A', 0, NULL, NULL),
('Pathum Samuditha', 'Gurukula College, Kelaniya', '54085560', 2025, 'A', 'A', 0, NULL, NULL),
('Sanitha Sandil', 'Nalanda College, Colombo', '53530195', 2025, 'A', 'A', 0, NULL, NULL),
('Sayumi Maninsa', 'Private Candidate', '53995325', 2025, 'A', 'A', 0, NULL, NULL),
('Lishini Avishka', 'Sri Dharmaloka College, Kelaniya', '53961480', 2025, 'B', 'B', 0, NULL, NULL),
('Senula Randunu', 'St. Joseph''s College', '53494504', 2025, 'B', 'B', 0, NULL, NULL),
('Nethasha Methmali', 'Sumedha College, Gampaha', '53914880', 2025, 'B', 'B', 0, NULL, NULL),
('Dahamika Thisarani', 'Viharamahadevi Balika Vidyalaya', '54068010', 2025, 'B', 'B', 0, NULL, NULL),
('Dewandi Nuwangana', 'Sri Dharmaloka College, Kelaniya', '54091349', 2025, 'B', 'B', 0, NULL, NULL),
('Vishmie Konara', 'Sumedha College, Gampaha', '53915453', 2025, 'B', 'B', 0, NULL, NULL),
('Kavithma Vehangee', 'Sumedha College, Gampaha', '53914767', 2025, 'B', 'B', 0, NULL, NULL),
('Dewli Yuhansa', 'Sumedha College, Gampaha', '53914651', 2025, 'B', 'B', 0, NULL, NULL),
('Sethumi Rajapaksha', 'Yasodara Devi Balika Vidyalaya', '53912101', 2025, 'B', 'B', 0, NULL, NULL),
('Lineth Jayasinghe', 'St. Joseph''s College', '53494571', 2025, 'B', 'B', 0, NULL, NULL),
('Monish Dewmina', 'Gurukula College, Kelaniya', '54085438', 2025, 'B', 'B', 0, NULL, NULL),
('Sewmi Dahamsha', 'Yasodara Devi Balika Vidyalaya', '53565452', 2025, 'B', 'B', 0, NULL, NULL),
('Sethuli Wickramasinghe', 'Lyceum International School', '53947509', 2025, 'B', 'B', 0, NULL, NULL),
('Thinuka Sasvidu', 'Sumedha College, Gampaha', '53915712', 2025, 'B', 'B', 0, NULL, NULL),
('Jalani Bhashitha', 'Doranagoda National School', '54043042', 2025, 'B', 'B', 0, NULL, NULL),
('Savani Sithumini', 'St. Joseph''s College', '54008697', 2025, 'B', 'B', 0, NULL, NULL),
('Sethuni Thihansa', 'Yoshida Shokanji International', '54096944', 2025, 'B', 'B', 0, NULL, NULL),
('Imeth Pehesara', 'Ananda College, Colombo', '53518730', 2025, 'B', 'B', 0, NULL, NULL),
('Sanhith Koralagamage', 'St. Peter''s College, Colombo', '53615158', 2025, 'B', 'B', 0, NULL, NULL),
('Nethmitha Chanula', 'Lyceum International School', '54054362', 2025, 'B', 'B', 0, NULL, NULL),
('Niranjan Dhilusan', 'Sumedha College, Gampaha', '53914139', 2025, 'B', 'B', 0, NULL, NULL),
('Hasini Madushani', 'Vishaka Balika Vidyalaya, Sapugaskanda', '25100', 2025, 'B', 'B', 0, NULL, NULL),
('Dilru Thehansa', 'Negombo South International School', '53961520', 2025, 'B', 'B', 0, NULL, NULL),
('Rochelle Andrea', 'Holy Cross College, Gampaha', '53890302', 2025, 'B', 'B', 0, NULL, NULL),
('Sanketh Samarasinghe', 'Royal College, Colombo 7', '53521400', 2025, 'B', 'B', 0, NULL, NULL),
('Ranudi Nihansa', 'Sumedha College, Gampaha', '53914368', 2025, 'B', 'B', 0, NULL, NULL),
('Sanchitha Ranuga', 'St. Anthony''s College, Wattala', '54012155', 2025, 'B', 'B', 0, NULL, NULL),
('Lison Helitha', 'York International School', '54054214', 2025, 'B', 'B', 0, NULL, NULL),
('Vihansa Dinithi', 'Yasodara Devi Balika Vidyalaya', '53565304', 2025, 'B', 'B', 0, NULL, NULL),
('Sithum Nemsara', 'OKI International School', '54032105', 2025, 'B', 'B', 0, NULL, NULL),
('Sandali Sinelya', 'Viharamahadevi Balika Vidyalaya, Kiribathgoda', '54068240', 2025, 'C', 'C', 0, NULL, NULL),
('Sithmi Nethumika', 'Sumedha College, Gampaha', '53915585', 2025, 'C', 'C', 0, NULL, NULL),
('Tishara Senanayake', 'St. Anne''s Balika Maha Vidyalaya', '54008743', 2025, 'C', 'C', 0, NULL, NULL),
('Dulina Nethul', 'Sumedha College, Gampaha', '53915739', 2025, 'C', 'C', 0, NULL, NULL),
('Binori Thathsarani', 'Gurukula College, Kelaniya', '54086817', 2025, 'C', 'C', 0, NULL, NULL),
('Amanda Deshini', 'J.M.C International School', '54046378', 2025, 'C', 'C', 0, NULL, NULL),
('Pathumi Peries', 'Private Candidate', '54031907', 2025, 'C', 'C', 0, NULL, NULL)
ON DUPLICATE KEY UPDATE `student_name`=VALUES(`student_name`), `school`=VALUES(`school`), `grade_badge`=VALUES(`grade_badge`), `letter_grade`=VALUES(`letter_grade`), `is_top_champion`=VALUES(`is_top_champion`), `year`=VALUES(`year`);
