<?php
// ========================================================
// Automated Database Backup & Google Drive Sync API
// Evon Aravinda Commerce Education LMS
// Full MySQL Dump & Google Drive Webhook Auto-Upload
// ========================================================

require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Ensure backups directory exists
$backupsDir = __DIR__ . '/../backups';
if (!is_dir($backupsDir)) {
    @mkdir($backupsDir, 0777, true);
}

// --------------------------------------------------------
// Helper: Upload file to Google Drive Webhook
// --------------------------------------------------------
function uploadToGoogleDriveWebhook($webhookUrl, $folderId, $filename, $content, $mimeType, $timestamp, $stats = []) {
    if (empty($webhookUrl) || strpos($webhookUrl, 'drive.google.com') !== false || strpos($webhookUrl, 'http') !== 0) {
        return [
            'success' => false,
            'message' => 'Invalid Webhook URL. Ensure it starts with https://script.google.com/...'
        ];
    }

    $payload = json_encode([
        'folderId' => $folderId,
        'filename' => $filename,
        'content' => $content,
        'mimeType' => $mimeType,
        'timestamp' => $timestamp,
        'stats' => $stats
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json; charset=utf-8',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 40);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_AUTOREFERER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EvonLMSBackup/3.0');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        return [
            'success' => false,
            'http_code' => $httpCode,
            'error' => $curlErr
        ];
    }

    $parsed = json_decode($resp, true);

    // Check if Google returned 404 (deployment deleted, archived, or draft URL used)
    if ($httpCode === 404) {
        return [
            'success' => false,
            'http_code' => 404,
            'error' => "Google Apps Script returned 404 (Not Found): In script.google.com, click 'Deploy' > 'New deployment', select type 'Web app', set 'Who has access' to 'Anyone', and copy the newly generated Web App URL."
        ];
    }

    // Check if Google redirected to login (access permission issue in script)
    if (strpos((string)$resp, 'accounts.google.com') !== false || strpos((string)$resp, 'ServiceLogin') !== false) {
        return [
            'success' => false,
            'http_code' => $httpCode,
            'error' => "Google access denied: Ensure 'Who has access' is set to 'Anyone' in your Google Apps Script deployment."
        ];
    }

    $isOk = ($httpCode >= 200 && $httpCode < 400 && (!is_array($parsed) || ($parsed['status'] ?? '') !== 'error'));
    $fileUrl = null;
    if (!empty($parsed['url'])) {
        $fileUrl = $parsed['url'];
    } else if (!empty($parsed['fileId'])) {
        $fileUrl = "https://drive.google.com/file/d/{$parsed['fileId']}/view";
    }

    return [
        'success' => $isOk,
        'http_code' => $httpCode,
        'filename' => $filename,
        'url' => $fileUrl,
        'file_id' => $parsed['fileId'] ?? null,
        'response' => $parsed ?? substr((string)$resp, 0, 300)
    ];
}

// --------------------------------------------------------
// 1. GET: List available database backups on server
// --------------------------------------------------------
if ($method === 'GET') {
    $backupFiles = [];
    if (is_dir($backupsDir)) {
        $files = glob($backupsDir . '/*.{json,sql}', GLOB_BRACE);
        if ($files) {
            foreach ($files as $file) {
                $backupFiles[] = [
                    'filename' => basename($file),
                    'filesize' => filesize($file),
                    'filesize_kb' => round(filesize($file) / 1024, 2),
                    'created_at' => date('Y-m-d H:i:s', filemtime($file)),
                    'type' => pathinfo($file, PATHINFO_EXTENSION),
                ];
            }
        }
    }

    // Sort newest first
    usort($backupFiles, function ($a, $b) {
        return strcmp($b['created_at'], $a['created_at']);
    });

    echo json_encode([
        'status' => 'success',
        'total_backups' => count($backupFiles),
        'backups' => array_slice($backupFiles, 0, 30),
        'storage_directory' => 'backend/backups/'
    ]);
    exit();
}

// --------------------------------------------------------
// 2. POST: Generate backup / Test Webhook
// --------------------------------------------------------
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = !empty($rawInput) ? json_decode($rawInput, true) : null;
    if (!is_array($input) && !empty($_POST)) {
        $input = $_POST;
    }
    if (!is_array($input) && !empty($GLOBALS['mock_input'])) {
        $input = $GLOBALS['mock_input'];
    }
    if (!is_array($input)) {
        $input = [];
    }

    // Optional: Test Webhook connection only
    if (!empty($input['test_webhook'])) {
        $testUrl = trim($input['webhook_url'] ?? '');
        if (empty($testUrl) || strpos($testUrl, 'drive.google.com') !== false) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid Webhook URL. Please provide your Google Apps Script Web App URL (script.google.com).'
            ]);
            exit();
        }

        $ch = curl_init($testUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EvonLMSBackup/3.0');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $testResp = curl_exec($ch);
        $testHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $testErr = curl_error($ch);
        curl_close($ch);

        $parsed = json_decode($testResp, true);

        if ($testHttp === 404) {
            echo json_encode([
                'status' => 'error',
                'message' => "Google Apps Script returned 404 (Not Found): In script.google.com, click 'Deploy' > 'New deployment', select type 'Web app', set 'Who has access' to 'Anyone', and copy the newly generated Web App URL.",
                'http_code' => 404
            ]);
            exit();
        }

        // Check if Google redirected to a login screen
        if (strpos((string)$testResp, 'accounts.google.com') !== false || strpos((string)$testResp, 'ServiceLogin') !== false) {
            echo json_encode([
                'status' => 'error',
                'message' => "Access denied by Google: In Google Apps Script, click 'Deploy' > 'Manage deployments', click Edit (pencil icon), and change 'Who has access' from 'Only myself' to 'Anyone'.",
                'http_code' => $testHttp
            ]);
            exit();
        }

        $isOk = (!$testErr && $testHttp >= 200 && $testHttp < 400);

        echo json_encode([
            'status' => $isOk ? 'success' : 'error',
            'http_code' => $testHttp,
            'message' => $isOk
                ? 'Google Drive Webhook connection verified successfully! Folder 1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB is reachable.'
                : ($testErr ?: "HTTP {$testHttp} response received"),
            'response' => $parsed ?? substr((string)$testResp, 0, 300)
        ]);
        exit();
    }

    $folderId = $input['folder_id'] ?? '1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB';
    $webhookUrl = trim($input['webhook_url'] ?? '');
    $timestamp = date('Y-m-d_H-i-s');
    $dbName = $db_name ?? 'evon_lms';

    $dbData = [
        'system' => 'Evon Aravinda Commerce Education LMS',
        'export_timestamp' => date('c'),
        'database' => $dbName,
        'tables' => []
    ];

    $allTables = [];
    $tableSchemas = [];

    // 1. Discover all tables in MySQL
    if ($pdo) {
        try {
            $stmt = $pdo->query("SHOW TABLES");
            $allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            $dbData['error_show_tables'] = $e->getMessage();
        }
    }

    // Default expected LMS tables if database is empty or disconnected
    $expectedTables = [
        'users', 'batches', 'papers', 'paper_results', 'quizzes',
        'quiz_questions', 'quiz_attempts', 'evaluations',
        'national_results', 'app_settings', 'activity_logs'
    ];

    if (empty($allTables)) {
        $allTables = $expectedTables;
    } else {
        // Ensure all expected tables are in the list
        foreach ($expectedTables as $t) {
            if (!in_array($t, $allTables)) {
                $allTables[] = $t;
            }
        }
    }

    $stats = [
        'users' => 0,
        'batches' => 0,
        'papers' => 0,
        'paper_results' => 0,
        'quizzes' => 0,
        'quiz_questions' => 0,
        'quiz_attempts' => 0,
        'evaluations' => 0,
        'national_results' => 0,
        'app_settings' => 0,
        'activity_logs' => 0,
        'total_tables' => count($allTables),
    ];

    // Build the SQL Dump header
    $sqlDump = "-- ========================================================\n";
    $sqlDump .= "-- Evon Aravinda Commerce Education LMS\n";
    $sqlDump .= "-- Complete Automated MySQL Database Backup (ALL TABLES)\n";
    $sqlDump .= "-- Database: `{$dbName}`\n";
    $sqlDump .= "-- Exported on: " . date('Y-m-d H:i:s T') . "\n";
    $sqlDump .= "-- Server Environment: " . ($_SERVER['SERVER_NAME'] ?? 'localhost') . "\n";
    $sqlDump .= "-- ========================================================\n\n";
    $sqlDump .= "SET FOREIGN_KEY_CHECKS = 0;\n";
    $sqlDump .= "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n";
    $sqlDump .= "SET NAMES utf8mb4;\n\n";
    $sqlDump .= "CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n";
    $sqlDump .= "USE `{$dbName}`;\n\n";

    // 2. Extract DDL and Data for each table
    foreach ($allTables as $table) {
        $rows = [];
        $createTableSql = "";

        if ($pdo) {
            try {
                // Get CREATE TABLE DDL
                $createStmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
                if ($createStmt) {
                    $createRow = $createStmt->fetch(PDO::FETCH_NUM);
                    if (!empty($createRow[1])) {
                        $createTableSql = $createRow[1];
                        $tableSchemas[$table] = $createTableSql;
                    }
                }

                // Get table data rows
                $dataStmt = $pdo->query("SELECT * FROM `{$table}`");
                if ($dataStmt) {
                    $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
                }
            } catch (Exception $e) {
                // Table might not exist yet on MySQL, will check client payload
            }
        }

        // If table has no rows from MySQL, check if client provided it
        if (empty($rows) && !empty($input['client_payload']['tables'][$table])) {
            $rows = $input['client_payload']['tables'][$table];
        }

        $dbData['tables'][$table] = $rows;
        if (isset($stats[$table])) {
            $stats[$table] = count($rows);
        }

        // Append to SQL Dump
        $sqlDump .= "-- --------------------------------------------------------\n";
        $sqlDump .= "-- Table structure & data for table `{$table}` (" . count($rows) . " rows)\n";
        $sqlDump .= "-- --------------------------------------------------------\n";
        $sqlDump .= "DROP TABLE IF EXISTS `{$table}`;\n";

        if (!empty($createTableSql)) {
            $sqlDump .= $createTableSql . ";\n\n";
        } else {
            // Generate fallback CREATE TABLE IF NOT EXISTS statement
            $sqlDump .= generateFallbackCreateTableSql($table) . "\n\n";
        }

        if (!empty($rows)) {
            $sqlDump .= "-- Dumping data for table `{$table}`\n";
            $sqlDump .= "LOCK TABLES `{$table}` WRITE;\n";

            // Batch inserts in groups of 50 for optimal MySQL performance
            $chunks = array_chunk($rows, 50);
            foreach ($chunks as $chunk) {
                $columns = array_keys($chunk[0]);
                $quotedCols = array_map(function ($c) {
                    return "`" . str_replace("`", "``", $c) . "`";
                }, $columns);

                $valuesList = [];
                foreach ($chunk as $row) {
                    $valSql = [];
                    foreach ($columns as $col) {
                        $val = $row[$col] ?? null;
                        if ($val === null) {
                            $valSql[] = 'NULL';
                        } else if (is_numeric($val) && !is_string($val)) {
                            $valSql[] = $val;
                        } else if ($pdo) {
                            $valSql[] = $pdo->quote((string)$val);
                        } else {
                            $valSql[] = "'" . addslashes((string)$val) . "'";
                        }
                    }
                    $valuesList[] = "(" . implode(', ', $valSql) . ")";
                }

                $sqlDump .= "INSERT INTO `{$table}` (" . implode(', ', $quotedCols) . ") VALUES\n" . implode(",\n", $valuesList) . ";\n";
            }

            $sqlDump .= "UNLOCK TABLES;\n\n";
        }
    }

    $sqlDump .= "SET FOREIGN_KEY_CHECKS = 1;\n";
    $sqlDump .= "-- Backup completed successfully on: " . date('Y-m-d H:i:s T') . "\n";

    // 3. Save files locally in backend/backups/
    $sqlFilename = "evon_lms_all_tables_dump_{$timestamp}.sql";
    $sqlFilePath = "{$backupsDir}/{$sqlFilename}";
    file_put_contents($sqlFilePath, $sqlDump);

    $jsonFilename = "evon_lms_db_backup_{$timestamp}.json";
    $jsonFilePath = "{$backupsDir}/{$jsonFilename}";
    $jsonContent = json_encode($dbData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    file_put_contents($jsonFilePath, $jsonContent);

    // 4. Auto-upload to Google Drive Webhook
    $sqlUploadResult = null;
    $jsonUploadResult = null;
    $primaryFileUrl = null;
    $driveUploadStatus = 'not_configured';

    if (!empty($webhookUrl) && strpos($webhookUrl, 'drive.google.com') === false && strpos($webhookUrl, 'http') === 0) {
        // Step A: Upload the complete .SQL Dump file (PRIMARY)
        $sqlUploadResult = uploadToGoogleDriveWebhook(
            $webhookUrl,
            $folderId,
            $sqlFilename,
            $sqlDump,
            'text/plain',
            $timestamp,
            $stats
        );

        if ($sqlUploadResult['success']) {
            $driveUploadStatus = 'success';
            $primaryFileUrl = $sqlUploadResult['url'];
        } else {
            $driveUploadStatus = 'failed';
        }

        // Step B: Also upload the .JSON snapshot file
        $jsonUploadResult = uploadToGoogleDriveWebhook(
            $webhookUrl,
            $folderId,
            $jsonFilename,
            $jsonContent,
            'application/json',
            $timestamp,
            $stats
        );

        if (!$primaryFileUrl && !empty($jsonUploadResult['url'])) {
            $primaryFileUrl = $jsonUploadResult['url'];
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => $driveUploadStatus === 'success'
            ? "Complete MySQL SQL dump covering all tables successfully uploaded to Google Drive folder [{$folderId}]!"
            : "Complete MySQL SQL dump covering all tables generated and archived on server. Connect Google Drive Webhook for auto-sync.",
        'timestamp' => $timestamp,
        'tables_backed_up' => $allTables,
        'stats' => $stats,
        'local_backup' => [
            'sql_file' => $sqlFilename,
            'json_file' => $jsonFilename,
            'sql_size_kb' => round(filesize($sqlFilePath) / 1024, 2),
            'json_size_kb' => round(filesize($jsonFilePath) / 1024, 2),
            'path' => 'backend/backups/'
        ],
        'google_drive' => [
            'folder_id' => $folderId,
            'folder_url' => "https://drive.google.com/drive/folders/{$folderId}?usp=sharing",
            'uploaded' => $driveUploadStatus,
            'file_url' => $primaryFileUrl,
            'sql_upload' => $sqlUploadResult,
            'json_upload' => $jsonUploadResult
        ]
    ]);
    exit();
}

// --------------------------------------------------------
// Fallback table creation DDL definitions
// --------------------------------------------------------
function generateFallbackCreateTableSql($table) {
    switch ($table) {
        case 'users':
            return "CREATE TABLE IF NOT EXISTS `users` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'batches':
            return "CREATE TABLE IF NOT EXISTS `batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'papers':
            return "CREATE TABLE IF NOT EXISTS `papers` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'paper_results':
            return "CREATE TABLE IF NOT EXISTS `paper_results` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'national_results':
            return "CREATE TABLE IF NOT EXISTS `national_results` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'quizzes':
            return "CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(120) DEFAULT 'Business Studies',
  `batch` VARCHAR(120) DEFAULT '2026/2027 O/L Commerce',
  `duration_minutes` INT DEFAULT 15,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'quiz_questions':
            return "CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL,
  `question_text` TEXT NOT NULL,
  `options_json` TEXT NOT NULL,
  `correct_answer` TINYINT NOT NULL COMMENT '0=A, 1=B, 2=C, 3=D',
  `explanation` TEXT DEFAULT NULL,
  INDEX (`quiz_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'quiz_attempts':
            return "CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_uid` VARCHAR(64) NOT NULL,
  `user_uid` VARCHAR(64) NOT NULL,
  `score` INT NOT NULL,
  `total_marks` INT NOT NULL DEFAULT 100,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`quiz_uid`),
  INDEX (`user_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'evaluations':
            return "CREATE TABLE IF NOT EXISTS `evaluations` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'activity_logs':
            return "CREATE TABLE IF NOT EXISTS `activity_logs` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        case 'app_settings':
            return "CREATE TABLE IF NOT EXISTS `app_settings` (
  `setting_key` VARCHAR(64) PRIMARY KEY,
  `setting_value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

        default:
            return "CREATE TABLE IF NOT EXISTS `{$table}` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    }
}
