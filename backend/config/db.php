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
        PDO::ATTR_EMULATE_PREPARES => false,
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
}

/**
 * Check and ensure active DB connection, or exit with structured JSON
 */
function require_db_connection() {
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
function get_json_payload() {
    $raw = file_get_contents("php://input");
    return json_decode($raw, true) ?? [];
}

