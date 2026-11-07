<?php
// ========================================================
// Role-Based Authentication API
// Automatically detects role from MySQL database
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed. Use POST."]);
    exit();
}

$data = get_json_payload();
$rawIdentifier = trim($data['phone'] ?? $data['identifier'] ?? $data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($rawIdentifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Mobile phone number (or Index Number) and password are required."]);
    exit();
}

// --------------------------------------------------------
// 1. Normalize Phone Number / Identifier Variations
// --------------------------------------------------------
$cleanPhone = preg_replace('/[\s\-\(\)\.]/', '', $rawIdentifier);
if (str_starts_with($cleanPhone, '+94')) {
    $cleanPhone = '0' . substr($cleanPhone, 3);
} elseif (str_starts_with($cleanPhone, '94') && strlen($cleanPhone) === 11) {
    $cleanPhone = '0' . substr($cleanPhone, 2);
} elseif (str_starts_with($cleanPhone, '0094')) {
    $cleanPhone = '0' . substr($cleanPhone, 4);
} elseif (strlen($cleanPhone) === 9 && str_starts_with($cleanPhone, '7')) {
    $cleanPhone = '0' . $cleanPhone;
}

$digitsOnly = preg_replace('/[^0-9]/', '', $rawIdentifier);

try {
    // --------------------------------------------------------
    // 2. Query MySQL users table across multiple identifier formats
    // --------------------------------------------------------
    $user = null;
    if ($pdo) {
        $stmt = $pdo->prepare("
            SELECT * FROM users 
            WHERE phone = :raw
               OR phone = :cleanPhone
               OR phone = :digitsOnly
               OR index_no = :raw
               OR index_no = :cleanPhone
               OR user_uid = :raw
               OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+94', '0') = :cleanPhone
            LIMIT 1
        ");
        $stmt->execute([
            'raw' => $rawIdentifier,
            'cleanPhone' => $cleanPhone,
            'digitsOnly' => $digitsOnly,
        ]);
        $user = $stmt->fetch();
    }

    // --------------------------------------------------------
    // 3. System Administrator Fallback (if database not seeded)
    // --------------------------------------------------------
    if (!$user) {
        $isAdminMatch = ($rawIdentifier === '0719998877' || $cleanPhone === '0719998877' || strtolower($rawIdentifier) === 'admin-01' || strtolower($rawIdentifier) === 'admin');
        if ($isAdminMatch && ($password === 'admin123')) {
            $user = [
                'user_uid' => 'admin-01',
                'full_name' => 'Evon Aravinda (Lead Educator & Admin)',
                'phone' => '0719998877',
                'password' => 'admin123',
                'role' => 'admin',
                'index_no' => null,
                'batch' => 'All Batches',
                'school' => 'Main Faculty',
                'parent_phone' => null,
                'avatar_url' => '/images/educator.jpg',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
            ];
        }

        // Demo Student Account Fallback
        $isDemoStudent = ($rawIdentifier === '0771234567' || $cleanPhone === '0771234567' || $rawIdentifier === '53914864' || strtolower($rawIdentifier) === 'std-001');
        if ($isDemoStudent && ($password === 'pass123' || $password === 'student123')) {
            $user = [
                'user_uid' => 'std-001',
                'full_name' => 'Kasun Perera (Sample Student)',
                'phone' => '0771234567',
                'password' => $password,
                'role' => 'student',
                'index_no' => '53914864',
                'batch' => '2026 O/L Speed Revision & Paper Class',
                'school' => 'Royal College, Colombo 07',
                'parent_phone' => '0777654321',
                'avatar_url' => '/images/top_student_rank1.jpg',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
            ];
        }
    }

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "error" => "No account found matching this mobile phone number or Index Number. If you are a new student, please click 'Register for 2026 / 2027 Batches' to enroll."
        ]);
        exit();
    }

    // --------------------------------------------------------
    // 4. Verify Password (handles plaintext, trimmed, MD5, and password_hash)
    // --------------------------------------------------------
    $dbPass = trim((string)($user['password'] ?? ''));
    $password_matches = (
        ($dbPass === $password) ||
        ($dbPass === trim($password)) ||
        (strcasecmp($dbPass, $password) === 0) ||
        (!empty($dbPass) && password_verify($password, $dbPass)) ||
        ($dbPass === md5($password))
    );

    if (!$password_matches) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "error" => "Incorrect password. Please verify your credentials and try again."
        ]);
        exit();
    }

    if (($user['status'] ?? '') === 'inactive') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "error" => "This account is inactive. Please contact your class coordinator."
        ]);
        exit();
    }

    // --------------------------------------------------------
    // 5. Successful Authentication: Return user payload
    // --------------------------------------------------------
    $responseUser = [
        "id" => $user['user_uid'] ?? (string)$user['id'],
        "fullName" => $user['full_name'],
        "phone" => $user['phone'],
        "role" => $user['role'] ?? 'student',
        "indexNo" => $user['index_no'] ?? null,
        "batch" => $user['batch'] ?? '2026 O/L Speed Revision & Paper Class',
        "school" => $user['school'] ?? '',
        "parentPhone" => $user['parent_phone'] ?? null,
        "avatarUrl" => $user['avatar_url'] ?? null,
        "status" => $user['status'] ?? 'active',
        "enrolledDate" => substr($user['created_at'] ?? date('Y-m-d'), 0, 10),
    ];

    echo json_encode([
        "success" => true,
        "message" => "Authentication successful",
        "role" => $user['role'] ?? 'student',
        "user" => $responseUser
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database query failed: " . $e->getMessage()]);
}
