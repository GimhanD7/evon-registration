<?php
// ========================================================
// Dynamic Physical & Online Timetable Management API
// Evon Aravinda Commerce Education LMS
// Backed by MySQL app_settings table
// ========================================================

// Explicit CORS headers
if (!headers_sent()) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: " . $origin);
        header("Vary: Origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    header("Content-Type: application/json; charset=UTF-8");
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// --------------------------------------------------------
// 1. GET: Retrieve current dynamic timetable
// --------------------------------------------------------
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'timetable_data' LIMIT 1");
        $stmt->execute();
        $raw = $stmt->fetchColumn();

        $institutes = [];
        if ($raw) {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                $institutes = $parsed;
            }
        }

        echo json_encode([
            "success" => true,
            "count" => count($institutes),
            "institutes" => $institutes,
            "has_custom_data" => !empty($institutes)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// --------------------------------------------------------
// 2. POST: Save / Update full timetable in MySQL database
// --------------------------------------------------------
if ($method === 'POST') {
    try {
        $data = get_json_payload();
        $institutes = $data['institutes'] ?? $data['timetable'] ?? $data;

        if (!is_array($institutes)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Invalid timetable data payload. Expected array of institutes."]);
            exit();
        }

        $jsonPayload = json_encode($institutes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = $pdo->prepare("
            INSERT INTO app_settings (`setting_key`, `setting_value`) 
            VALUES ('timetable_data', :val) 
            ON DUPLICATE KEY UPDATE `setting_value` = :val
        ");
        $stmt->execute(['val' => $jsonPayload]);

        // Audit Trail Log
        try {
            $logUid = 'log-' . time() . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
            $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $instCount = count($institutes);
            $slotCount = 0;
            foreach ($institutes as $inst) {
                if (isset($inst['slots']) && is_array($inst['slots'])) {
                    $slotCount += count($inst['slots']);
                }
            }
            $logStmt = $pdo->prepare("INSERT INTO activity_logs 
                (`log_uid`, `user_id`, `user_name`, `user_role`, `action`, `category`, `details`, `ip_address`, `device`, `status`, `created_at`)
                VALUES
                (:uid, 'admin-01', 'Evon Aravinda (Admin)', 'admin', 'Class Timetable Updated', 'system', :details, :ip, 'Admin Console', 'success', NOW())");
            $logStmt->execute([
                'uid' => $logUid,
                'details' => "Administrator updated the class timetable ({$instCount} institutes, {$slotCount} class slots) live across Home Page & LMS.",
                'ip' => $ip
            ]);
        } catch (Exception $e) {
            // Ignore log error
        }

        echo json_encode([
            "success" => true,
            "message" => "Timetable updated successfully in MySQL database.",
            "count" => count($institutes)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);
