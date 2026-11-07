<?php
// ========================================================
// System Settings & Security PIN API (Database-Backed)
// Evon Higher Education LMS
// ========================================================

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Helper to retrieve a setting value from MySQL
function get_setting_value($pdo, $key, $default = '') {
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = :k LIMIT 1");
        $stmt->execute(['k' => $key]);
        $val = $stmt->fetchColumn();
        return ($val !== false && $val !== null) ? $val : $default;
    } catch (Exception $e) {
        return $default;
    }
}

// Helper to save a setting value to MySQL
function set_setting_value($pdo, $key, $value) {
    $stmt = $pdo->prepare("INSERT INTO app_settings (`setting_key`, `setting_value`) 
        VALUES (:k, :v) 
        ON DUPLICATE KEY UPDATE `setting_value` = :v");
    return $stmt->execute(['k' => $key, 'v' => (string)$value]);
}

// --------------------------------------------------------
// 1. GET: Fetch setting or verify PIN
// --------------------------------------------------------
if ($method === 'GET') {
    $action = trim($_GET['action'] ?? '');
    $key = trim($_GET['key'] ?? '');

    // Quick verification endpoint
    if ($action === 'verify_pin') {
        $testPin = trim($_GET['pin'] ?? '');
        $currentPin = get_setting_value($pdo, 'security_pin', '1234');
        $valid = ($testPin !== '' && $testPin === $currentPin);
        echo json_encode(["success" => true, "valid" => $valid]);
        exit();
    }

    if (empty($key) || $key === 'security_pin' || $action === 'get_pin') {
        $pin = get_setting_value($pdo, 'security_pin', '1234');
        echo json_encode([
            "success" => true,
            "key" => "security_pin",
            "pin" => $pin,
            "value" => $pin
        ]);
        exit();
    }

    // Generic setting query
    $val = get_setting_value($pdo, $key, '');
    echo json_encode(["success" => true, "key" => $key, "value" => $val]);
    exit();
}

// --------------------------------------------------------
// 2. POST: Verify PIN or update Security PIN in database
// --------------------------------------------------------
if ($method === 'POST') {
    try {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: $_POST;

        $action = trim($data['action'] ?? '');
        $key = trim($data['key'] ?? '');

        // A. Verify PIN Action
        if ($action === 'verify_pin' || isset($data['verifyPin'])) {
            $testPin = trim($data['pin'] ?? $data['verifyPin'] ?? '');
            $currentPin = get_setting_value($pdo, 'security_pin', '1234');
            $valid = ($testPin !== '' && $testPin === $currentPin);
            echo json_encode(["success" => true, "valid" => $valid]);
            exit();
        }

        // B. Update Security PIN in Database
        if ($action === 'update_pin' || $key === 'security_pin' || isset($data['newPin'])) {
            $newPin = trim($data['newPin'] ?? $data['value'] ?? $data['pin'] ?? '');
            $currentPinInput = trim($data['currentPin'] ?? '');

            // Validate new PIN format (4 to 6 digits)
            if (!preg_match('/^\d{4,6}$/', $newPin)) {
                http_response_code(400);
                echo json_encode(["success" => false, "error" => "Security PIN must be 4 to 6 numeric digits."]);
                exit();
            }

            // If current PIN is supplied for verification, check it
            if (!empty($currentPinInput)) {
                $actualCurrentPin = get_setting_value($pdo, 'security_pin', '1234');
                if ($currentPinInput !== $actualCurrentPin) {
                    http_response_code(401);
                    echo json_encode(["success" => false, "error" => "Current Security PIN is incorrect."]);
                    exit();
                }
            }

            // Save new PIN to app_settings table in MySQL
            set_setting_value($pdo, 'security_pin', $newPin);

            // Also record in activity_logs
            try {
                $logUid = 'log-' . time() . '-' . substr(bin2hex(random_bytes(4)), 0, 6);
                $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
                $stmt = $pdo->prepare("INSERT INTO activity_logs 
                    (`log_uid`, `user_id`, `user_name`, `user_role`, `action`, `category`, `details`, `ip_address`, `device`, `status`, `created_at`)
                    VALUES
                    (:uid, 'admin-01', 'Evon Aravinda (Admin)', 'admin', 'Security PIN Updated', 'security', 'Administrator updated the database Security PIN', :ip, 'Admin Console', 'warning', NOW())");
                $stmt->execute(['uid' => $logUid, 'ip' => $ip]);
            } catch (Exception $e) {
                // Ignore log error
            }

            echo json_encode([
                "success" => true,
                "message" => "Security PIN successfully updated and saved in MySQL database.",
                "pin" => $newPin
            ]);
            exit();
        }

        // C. Generic Setting Update
        if (!empty($key)) {
            $val = $data['value'] ?? '';
            set_setting_value($pdo, $key, $val);
            echo json_encode(["success" => true, "key" => $key, "message" => "Setting updated."]);
            exit();
        }

        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Invalid setting parameters."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);
