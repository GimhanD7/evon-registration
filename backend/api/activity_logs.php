<?php
// ========================================================
// Activity Logs Management API (Database-Backed)
// Evon Higher Education LMS
// ========================================================

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// --------------------------------------------------------
// 1. GET: Fetch activity logs from MySQL database
// --------------------------------------------------------
if ($method === 'GET') {
    try {
        $limit = isset($_GET['limit']) && is_numeric($_GET['limit']) ? min((int)$_GET['limit'], 1000) : 250;
        $category = trim($_GET['category'] ?? '');
        $role = trim($_GET['role'] ?? '');
        $search = trim($_GET['search'] ?? '');

        $sql = "SELECT 
            log_uid as id,
            user_id as userId,
            user_name as userName,
            user_role as userRole,
            action,
            category,
            COALESCE(details, '') as details,
            DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') as `timestamp`,
            COALESCE(ip_address, '127.0.0.1') as ipAddress,
            COALESCE(device, 'Web Browser') as device,
            status
            FROM activity_logs WHERE 1=1";

        $params = [];

        if (!empty($category) && $category !== 'all') {
            $sql .= " AND category = :cat";
            $params['cat'] = $category;
        }

        if (!empty($role) && $role !== 'all') {
            $sql .= " AND user_role = :role";
            $params['role'] = $role;
        }

        if (!empty($search)) {
            $sql .= " AND (user_name LIKE :s OR action LIKE :s OR details LIKE :s OR ip_address LIKE :s)";
            $params['s'] = "%{$search}%";
        }

        $sql .= " ORDER BY created_at DESC, id DESC LIMIT " . (int)$limit;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $logs = $stmt->fetchAll();

        echo json_encode([
            "success" => true,
            "logs" => $logs,
            "count" => count($logs)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage(), "logs" => []]);
    }
    exit();
}

// --------------------------------------------------------
// 2. POST: Record a new activity log entry into database
// --------------------------------------------------------
if ($method === 'POST') {
    try {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?: $_POST;

        $action = trim($data['action'] ?? '');
        if (empty($action)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Action name is required."]);
            exit();
        }

        $logUid = trim($data['id'] ?? '');
        if (empty($logUid)) {
            $logUid = 'log-' . time() . '-' . substr(bin2hex(random_bytes(4)), 0, 6);
        }

        $userId = trim($data['userId'] ?? 'guest');
        $userName = trim($data['userName'] ?? 'Anonymous User');
        $userRole = trim($data['userRole'] ?? 'student');
        $category = trim($data['category'] ?? 'system');
        $details = trim($data['details'] ?? '');
        $status = in_array($data['status'] ?? '', ['success', 'warning', 'info']) ? $data['status'] : 'info';

        // Auto-detect client IP address
        $ipAddress = trim($data['ipAddress'] ?? '');
        if (empty($ipAddress) || strpos($ipAddress, '192.168.1.100') !== false) {
            $rawIp = $_SERVER['HTTP_CF_CONNECTING_IP'] 
                ?? $_SERVER['HTTP_X_FORWARDED_FOR'] 
                ?? $_SERVER['REMOTE_ADDR'] 
                ?? '127.0.0.1';
            if (strpos($rawIp, ',') !== false) {
                $rawIp = trim(explode(',', $rawIp)[0]);
            }
            $ipAddress = $rawIp;
        }

        // Auto-detect device
        $device = trim($data['device'] ?? '');
        if (empty($device)) {
            $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Web Browser';
            $device = substr($ua, 0, 100);
        }

        $stmt = $pdo->prepare("INSERT INTO activity_logs 
            (`log_uid`, `user_id`, `user_name`, `user_role`, `action`, `category`, `details`, `ip_address`, `device`, `status`, `created_at`)
            VALUES
            (:uid, :uid_user, :uname, :urole, :action, :cat, :details, :ip, :device, :status, NOW())");

        $stmt->execute([
            'uid' => $logUid,
            'uid_user' => $userId,
            'uname' => $userName,
            'urole' => $userRole,
            'action' => $action,
            'cat' => $category,
            'details' => $details,
            'ip' => $ipAddress,
            'device' => $device,
            'status' => $status,
        ]);

        echo json_encode([
            "success" => true,
            "id" => $logUid,
            "message" => "Activity log successfully saved to database."
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// --------------------------------------------------------
// 3. DELETE: Clear activity logs from database
// --------------------------------------------------------
if ($method === 'DELETE') {
    try {
        $pdo->exec("DELETE FROM activity_logs");
        echo json_encode([
            "success" => true,
            "message" => "All activity logs have been cleared from the database."
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "error" => "Method not allowed"]);
