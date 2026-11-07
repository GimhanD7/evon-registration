<?php
// ========================================================
// Database Configuration (XAMPP MySQL)
// Evon Aravinda Commerce Education LMS
// ========================================================

// Set CORS and JSON response headers
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");
}

// Handle preflight OPTIONS requests
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Automatically populate $_GET from QUERY_STRING in CLI mode (when invoked by Next.js bridge)
if (php_sapi_name() === 'cli' && !empty($_SERVER['QUERY_STRING'] ?? '')) {
    parse_str($_SERVER['QUERY_STRING'], $cliGet);
    $_GET = array_merge($_GET ?? [], $cliGet);
}

$db_host = getenv('DB_HOST') ?: "127.0.0.1";
$db_port = getenv('DB_PORT') ?: "3306";
$db_name = getenv('DB_NAME') ?: "evon_lms";
$db_user = getenv('DB_USER') ?: "root";
$db_pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";

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

// Ensure newly added columns exist on existing tables
if ($pdo) {
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `users`")->fetchAll(PDO::FETCH_COLUMN);
        $colNames = array_map('strtolower', $cols ?: []);
        if (!in_array('avatar_url', $colNames)) {
            $pdo->exec("ALTER TABLE `users` ADD `avatar_url` VARCHAR(255) DEFAULT NULL");
        }
        if (!in_array('enrolled_date', $colNames)) {
            $pdo->exec("ALTER TABLE `users` ADD `enrolled_date` VARCHAR(30) DEFAULT NULL");
        }
    } catch (Exception $e) {
        // Ignore column check errors
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
    return json_decode($raw, true) ?? [];
}

