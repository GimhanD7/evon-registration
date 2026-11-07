<?php
// ========================================================
// Database Configuration (XAMPP MySQL)
// Evon Aravinda Commerce Education LMS
// ========================================================

// Set CORS and JSON response headers
if (!headers_sent()) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Vary: Origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    header("Content-Type: application/json; charset=UTF-8");
}

// Handle preflight OPTIONS requests immediately
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Automatically populate $_GET from QUERY_STRING in CLI mode (when invoked by Next.js bridge)
if (php_sapi_name() === 'cli' && !empty($_SERVER['QUERY_STRING'] ?? '')) {
    parse_str($_SERVER['QUERY_STRING'], $cliGet);
    $_GET = array_merge($_GET ?? [], $cliGet);
}

// Determine environment: Local XAMPP vs Live Hosting Server
$serverHost = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
$is_local = false;

if (php_sapi_name() === 'cli') {
    // In CLI / Next.js bridge mode, check if running on Windows or XAMPP path
    $is_local = (PHP_OS_FAMILY === 'Windows' || stripos(__DIR__, 'xampp') !== false);
} else {
    // In web server mode, check hostname
    $is_local = (
        empty($serverHost) ||
        $serverHost === 'localhost' ||
        $serverHost === '127.0.0.1' ||
        $serverHost === '::1' ||
        strpos($serverHost, 'localhost:') === 0 ||
        strpos($serverHost, '127.0.0.1:') === 0
    );
}

if ($is_local) {
    // 1. Local Development Database (XAMPP MySQL)
    $db_host = getenv('DB_HOST') ?: "127.0.0.1";
    $db_port = getenv('DB_PORT') ?: "3306";
    $db_name = getenv('DB_NAME') ?: "evon_lms";
    $db_user = getenv('DB_USER') ?: "root";
    $db_pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";
} else {
    // 2. Live Hosting Production Database (cPanel / Live Server)
    $db_host = getenv('DB_HOST') ?: "localhost";
    $db_port = getenv('DB_PORT') ?: "3306";
    $db_name = getenv('DB_NAME') ?: "kasuormb_evon";
    $db_user = getenv('DB_USER') ?: "kasuormb_evonGimhana";
    $db_pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : 'l=I0!+GOm#S=GW=+';
}

$customConfigFile = __DIR__ . '/db_config.php';
if (file_exists($customConfigFile)) {
    $customConfig = include $customConfigFile;
    if (is_array($customConfig)) {
        $db_host = $customConfig['db_host'] ?? $customConfig['DB_HOST'] ?? $db_host;
        $db_port = $customConfig['db_port'] ?? $customConfig['DB_PORT'] ?? $db_port;
        $db_name = $customConfig['db_name'] ?? $customConfig['DB_NAME'] ?? $db_name;
        $db_user = $customConfig['db_user'] ?? $customConfig['DB_USER'] ?? $db_user;
        $db_pass = $customConfig['db_pass'] ?? $customConfig['DB_PASS'] ?? $db_pass;
    }
}

$pdo = null;
$pdo_error = null;

try {
    $pdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true,
    ]);
} catch (PDOException $e) {
    // If database does not exist, automatically create it and run schema.sql
    if ($e->getCode() == 1049 || strpos($e->getMessage(), 'Unknown database') !== false) {
        try {
            $rootPdo = new PDO("mysql:host={$db_host};port={$db_port};charset=utf8mb4", $db_user, $db_pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
            ]);
            $schemaFile = __DIR__ . '/../database/schema.sql';
            if (file_exists($schemaFile)) {
                $rootPdo->exec(file_get_contents($schemaFile));
                $pdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => true,
                ]);
            }
        } catch (Exception $inner) {
            $pdo_error = "Auto-creation failed: " . $inner->getMessage();
        }
    } else {
        $pdo_error = $e->getMessage();
    }
}

// Ensure core database tables exist automatically
if ($pdo) {
    try {
        $hasUsers = ($pdo->query("SHOW TABLES LIKE 'users'")->rowCount() > 0);
        if (!$hasUsers) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            // Seed root admin and sample student
            $pdo->exec("INSERT INTO `users` (`user_uid`, `full_name`, `phone`, `password`, `role`, `index_no`, `batch`, `school`, `avatar_url`, `status`)
            VALUES 
            ('admin-01', 'Evon Aravinda (Lead Educator & Admin)', '0719998877', 'admin123', 'admin', NULL, 'All Batches', 'Main Faculty', '/images/educator.jpg', 'active'),
            ('std-001', 'Kasun Perera (Sample Student)', '0771234567', 'pass123', 'student', '53914864', '2026 O/L Speed Revision & Paper Class', 'Royal College, Colombo 07', '/images/top_student_rank1.jpg', 'active')
            ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);");
        } else {
            // Ensure avatar_url and enrolled_date columns exist on users
            $cols = $pdo->query("SHOW COLUMNS FROM `users`")->fetchAll(PDO::FETCH_COLUMN) ?: [];
            $colNames = array_map('strtolower', $cols);
            if (!in_array('avatar_url', $colNames)) {
                $pdo->exec("ALTER TABLE `users` ADD `avatar_url` VARCHAR(255) DEFAULT NULL");
            }
            if (!in_array('enrolled_date', $colNames)) {
                $pdo->exec("ALTER TABLE `users` ADD `enrolled_date` VARCHAR(30) DEFAULT NULL");
            }
            // Ensure Lead Educator admin user exists
            $adminCount = $pdo->query("SELECT COUNT(*) FROM `users` WHERE `role` = 'admin' OR `phone` = '0719998877'")->fetchColumn();
            if ($adminCount == 0) {
                $pdo->exec("INSERT INTO `users` (`user_uid`, `full_name`, `phone`, `password`, `role`, `batch`, `school`, `status`)
                VALUES ('admin-01', 'Evon Aravinda (Lead Educator & Admin)', '0719998877', 'admin123', 'admin', 'All Batches', 'Main Faculty', 'active')
                ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);");
            }
        }
    } catch (Exception $e) {
        // Ignore table check errors
    }

    // Auto-create papers and paper_results tables if not exists
    try {
        $hasPapers = ($pdo->query("SHOW TABLES LIKE 'papers'")->rowCount() > 0);
        if (!$hasPapers) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `papers` (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        }

        $hasResults = ($pdo->query("SHOW TABLES LIKE 'paper_results'")->rowCount() > 0);
        if (!$hasResults) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `paper_results` (
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        }

        $hasQuizzes = ($pdo->query("SHOW TABLES LIKE 'quizzes'")->rowCount() > 0);
        if (!$hasQuizzes) {
            $pdo->exec("CREATE TABLE IF NOT EXISTS `quizzes` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `quiz_uid` VARCHAR(64) NOT NULL UNIQUE,
              `title` VARCHAR(255) NOT NULL,
              `subject` VARCHAR(120) DEFAULT 'Business Studies',
              `batch` VARCHAR(120) DEFAULT '2026/2027 O/L Commerce',
              `duration_minutes` INT DEFAULT 15,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $pdo->exec("CREATE TABLE IF NOT EXISTS `quiz_questions` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `quiz_uid` VARCHAR(64) NOT NULL,
              `question_text` TEXT NOT NULL,
              `options_json` TEXT NOT NULL,
              `correct_answer` TINYINT NOT NULL COMMENT '0=A, 1=B, 2=C, 3=D',
              `explanation` TEXT DEFAULT NULL,
              INDEX (`quiz_uid`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $pdo->exec("CREATE TABLE IF NOT EXISTS `quiz_attempts` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `quiz_uid` VARCHAR(64) NOT NULL,
              `user_uid` VARCHAR(64) NOT NULL,
              `score` INT NOT NULL,
              `total_marks` INT NOT NULL DEFAULT 100,
              `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX (`quiz_uid`),
              INDEX (`user_uid`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        }
    } catch (Exception $e) {
        // Ignore table check errors
    }

    try {
        $hasNr = $pdo->query("SHOW TABLES LIKE 'national_results'")->rowCount() > 0;
        if ($hasNr) {
            $nrCols = $pdo->query("SHOW COLUMNS FROM `national_results`")->fetchAll(PDO::FETCH_COLUMN);
            $nrColNames = array_map('strtolower', $nrCols ?: []);
            if (!in_array('year', $nrColNames)) {
                $pdo->exec("ALTER TABLE `national_results` ADD `year` INT DEFAULT 2025");
            }
            if (!in_array('quote', $nrColNames)) {
                $pdo->exec("ALTER TABLE `national_results` ADD `quote` TEXT DEFAULT NULL");
            }
            if (!in_array('avatar_image', $nrColNames)) {
                $pdo->exec("ALTER TABLE `national_results` ADD `avatar_image` VARCHAR(255) DEFAULT NULL");
            }
        }
    } catch (Exception $e) {
        // Ignore column check errors
    }

    // Auto-create activity_logs table if not exists
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `activity_logs` (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    } catch (Exception $e) {
        // Ignore table check errors
    }

    // Auto-create app_settings table and initialize security_pin
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `app_settings` (
            `setting_key` VARCHAR(64) PRIMARY KEY,
            `setting_value` TEXT NOT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $pdo->exec("INSERT INTO `app_settings` (`setting_key`, `setting_value`)
            VALUES ('security_pin', '1234')
            ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;");
    } catch (Exception $e) {
        // Ignore table check errors
    }

    // Auto-create batches table and initialize default batches
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `batches` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(150) NOT NULL UNIQUE,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (`name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $batchCount = $pdo->query("SELECT COUNT(*) FROM `batches`")->fetchColumn();
        if ($batchCount == 0) {
            $defaultBatches = [
                '2026/2027 O/L Commerce',
                '2027 O/L Commerce Foundation (Grade 10)',
                '2026/2027 Grade 11 Theory',
                '2026 O/L Speed Revision & Paper Class',
                'All Batches (Commerce)'
            ];
            $stmt = $pdo->prepare("INSERT IGNORE INTO `batches` (`name`) VALUES (:bname)");
            foreach ($defaultBatches as $db) {
                $stmt->execute(['bname' => $db]);
            }
        }
    } catch (Exception $e) {
        // Ignore table check errors
    }

    // Auto-create evaluations table if not exists
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `evaluations` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `evaluation_uid` VARCHAR(64) DEFAULT NULL,
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $evalCols = $pdo->query("SHOW COLUMNS FROM `evaluations`")->fetchAll(PDO::FETCH_COLUMN) ?: [];
        if (!in_array('evaluation_uid', $evalCols)) {
            $pdo->exec("ALTER TABLE `evaluations` ADD `evaluation_uid` VARCHAR(64) DEFAULT NULL");
        }
        if (!in_array('student_id', $evalCols)) {
            $pdo->exec("ALTER TABLE `evaluations` ADD `student_id` VARCHAR(64) DEFAULT NULL");
        }
    } catch (Exception $e) {
        // Ignore table check errors
    }
}

/**
 * Check and ensure active DB connection, or exit with structured JSON
 */
function require_db_connection()
{
    global $pdo, $pdo_error;
    if (!$pdo) {
        if (!headers_sent()) {
            http_response_code(200);
        }
        echo json_encode([
            "success" => false,
            "error" => "Database connection unavailable: " . ($pdo_error ?? "Cannot connect to MySQL"),
            "hint" => "Please start MySQL in the XAMPP Control Panel (or run backend/api/seed.php)."
        ]);
        exit();
    }
}

/**
 * Helper to get clean JSON request payload
 */
function get_json_payload()
{
    $raw = file_get_contents("php://input");
    if (!empty($raw)) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    if (!empty($_POST)) {
        return $_POST;
    }
    if (!empty($GLOBALS['mock_input']) && is_array($GLOBALS['mock_input'])) {
        return $GLOBALS['mock_input'];
    }
    return [];
}

