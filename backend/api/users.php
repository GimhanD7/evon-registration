<?php
// ========================================================
// User / Student Management API
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// GET: List all students or users
if ($method === 'GET') {
    try {
        $search = trim($_GET['search'] ?? '');
        $fields = "user_uid as id, full_name as fullName, phone, role, index_no as indexNo, batch, school, parent_phone as parentPhone, avatar_url as avatarUrl, status, SUBSTRING(created_at, 1, 10) as enrolledDate";
        if (!empty($search)) {
            $stmt = $pdo->prepare("SELECT {$fields} FROM users WHERE full_name LIKE :s1 OR phone LIKE :s2 OR index_no LIKE :s3 OR school LIKE :s4 ORDER BY id DESC");
            $sParam = "%{$search}%";
            $stmt->execute([
                's1' => $sParam,
                's2' => $sParam,
                's3' => $sParam,
                's4' => $sParam,
            ]);
        } else {
            $stmt = $pdo->query("SELECT {$fields} FROM users ORDER BY id DESC");
        }
        $users = $stmt->fetchAll();
        echo json_encode(["success" => true, "users" => $users]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// POST: Add or update student
if ($method === 'POST') {
    $data = get_json_payload();
    $action = trim($data['action'] ?? '');
    $userUid = trim($data['id'] ?? $data['user_uid'] ?? '');
    $name = trim($data['fullName'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $password = trim($data['password'] ?? '');
    $role = trim($data['role'] ?? 'student');
    $batch = trim($data['batch'] ?? '2026 O/L Speed Revision & Paper Class');
    $school = trim($data['school'] ?? '');
    $indexNo = trim($data['indexNo'] ?? '');
    $avatarUrl = trim($data['avatarUrl'] ?? $data['avatar_url'] ?? '');

    // Profile update
    if ($action === 'update' || (!empty($userUid) && !empty($name))) {
        try {
            $upSql = "UPDATE users SET full_name = :name, school = :school";
            $params = ['name' => $name, 'school' => $school, 'uid' => $userUid];
            if (!empty($phone)) {
                $upSql .= ", phone = :phone";
                $params['phone'] = $phone;
            }
            if (!empty($indexNo)) {
                $upSql .= ", index_no = :idx";
                $params['idx'] = $indexNo;
            }
            if (isset($data['avatarUrl']) || isset($data['avatar_url'])) {
                $upSql .= ", avatar_url = :avatar";
                $params['avatar'] = $avatarUrl;
            }
            if (!empty($password)) {
                $upSql .= ", password = :pass";
                $params['pass'] = $password;
            }
            $upSql .= " WHERE user_uid = :uid";
            $stmt = $pdo->prepare($upSql);
            $stmt->execute($params);

            echo json_encode(["success" => true, "message" => "User updated successfully."]);
            exit();
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Failed to update user: " . $e->getMessage()]);
            exit();
        }
    }

    if (empty($name) || empty($phone)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Student full name and WhatsApp phone number are required."]);
        exit();
    }

    if (strlen($name) < 3) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Student full name must be at least 3 characters long."]);
        exit();
    }

    // Normalize and validate WhatsApp mobile number
    $cleanPhone = preg_replace('/[\s\-\(\)\.]/', '', $phone);
    if (str_starts_with($cleanPhone, '+94')) {
        $cleanPhone = '0' . substr($cleanPhone, 3);
    } elseif (str_starts_with($cleanPhone, '94') && strlen($cleanPhone) === 11) {
        $cleanPhone = '0' . substr($cleanPhone, 2);
    } elseif (str_starts_with($cleanPhone, '0094')) {
        $cleanPhone = '0' . substr($cleanPhone, 4);
    }

    $isSlMobile = preg_match('/^07[01245678]\d{7}$/', $cleanPhone);
    $isGeneralValid = preg_match('/^\+?\d{9,15}$/', $cleanPhone);

    if (!$isSlMobile && !$isGeneralValid) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "error" => "Please enter a valid 10-digit Sri Lankan WhatsApp mobile number (e.g. 0771234567)."
        ]);
        exit();
    }
    $phone = $cleanPhone;

    if (strlen($pass) < 4) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "LMS Password must be at least 4 characters long."]);
        exit();
    }

    try {
        // 1. Check if phone already registered to prevent duplicates
        $phoneCheck = $pdo->prepare("SELECT user_uid, full_name, phone, index_no FROM users WHERE phone = :p LIMIT 1");
        $phoneCheck->execute(['p' => $phone]);
        $existingPhoneUser = $phoneCheck->fetch();
        if ($existingPhoneUser) {
            http_response_code(409);
            echo json_encode([
                "success" => false,
                "error" => "Phone number '{$phone}' is already registered to {$existingPhoneUser['full_name']}.",
                "existingIndexNo" => $existingPhoneUser['index_no']
            ]);
            exit();
        }

        // 2. Collect all existing index numbers to guarantee zero duplicates/repeats
        $existingIndices = [];
        try {
            $qUsers = $pdo->query("SELECT index_no FROM users WHERE index_no IS NOT NULL AND index_no != ''");
            while ($r = $qUsers->fetchColumn()) {
                $existingIndices[trim($r)] = true;
            }
        } catch (Exception $e) {}

        try {
            $qResults = $pdo->query("SELECT DISTINCT index_no FROM paper_results WHERE index_no IS NOT NULL AND index_no != ''");
            while ($r = $qResults->fetchColumn()) {
                $existingIndices[trim($r)] = true;
            }
        } catch (Exception $e) {}

        // Determine guaranteed unique index number
        $finalIndexNo = trim($indexNo);
        if (empty($finalIndexNo) || isset($existingIndices[$finalIndexNo])) {
            // Find highest existing 8-digit numeric index (base 54300000)
            $maxNum = 54300000;
            foreach (array_keys($existingIndices) as $idx) {
                if (preg_match('/^\d{7,10}$/', $idx)) {
                    $val = (int)$idx;
                    if ($val > $maxNum) {
                        $maxNum = $val;
                    }
                }
            }
            $candidate = $maxNum + 1;
            while (isset($existingIndices[(string)$candidate])) {
                $candidate++;
            }
            $finalIndexNo = (string)$candidate;
        }

        $user_uid = 'std-' . substr(time(), -4) . rand(10, 99);
        $passToSave = !empty($password) ? $password : 'pass123';
        $stmt = $pdo->prepare("INSERT INTO users (user_uid, full_name, phone, password, role, index_no, batch, school, avatar_url, status) VALUES (:uid, :name, :phone, :pass, :role, :indexNo, :batch, :school, :avatar, 'active')");
        $stmt->execute([
            'uid' => $user_uid,
            'name' => $name,
            'phone' => $phone,
            'pass' => $passToSave,
            'role' => $role,
            'indexNo' => $finalIndexNo,
            'batch' => $batch,
            'school' => $school,
            'avatar' => $avatarUrl,
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Student registered successfully",
            "user" => [
                "id" => $user_uid,
                "fullName" => $name,
                "phone" => $phone,
                "role" => $role,
                "batch" => $batch,
                "school" => $school,
                "indexNo" => $finalIndexNo,
                "status" => "active",
                "enrolledDate" => date('Y-m-d')
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to add user: " . $e->getMessage()]);
    }
    exit();
}

// DELETE: Remove student
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "User ID required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE user_uid = :id AND role != 'admin'");
        $stmt->execute(['id' => $id]);
        echo json_encode(["success" => true, "message" => "User deleted successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

