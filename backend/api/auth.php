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
$phone = trim($data['phone'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($phone) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Mobile phone number and password are required."]);
    exit();
}

try {
    // Check by phone number or index number
    $stmt = $pdo->prepare("SELECT * FROM users WHERE (phone = :phone OR index_no = :index_no) LIMIT 1");
    $stmt->execute(['phone' => $phone, 'index_no' => $phone]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "No account found matching this phone number."]);
        exit();
    }

    // Direct password check or password_verify if hashed
    $password_matches = ($user['password'] === $password) || password_verify($password, $user['password']);

    if (!$password_matches) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Incorrect password. Please verify your credentials."]);
        exit();
    }

    if ($user['status'] === 'inactive') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "This account is inactive. Please contact your coordinator."]);
        exit();
    }

    // Return formatted user payload (role is auto-detected directly from record)
    $responseUser = [
        "id" => $user['user_uid'] ?? (string)$user['id'],
        "fullName" => $user['full_name'],
        "phone" => $user['phone'],
        "role" => $user['role'], // 'admin' or 'student'
        "indexNo" => $user['index_no'],
        "batch" => $user['batch'],
        "school" => $user['school'],
        "parentPhone" => $user['parent_phone'],
        "status" => $user['status'],
        "enrolledDate" => substr($user['created_at'], 0, 10),
    ];

    echo json_encode([
        "success" => true,
        "message" => "Authentication successful",
        "role" => $user['role'],
        "user" => $responseUser
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database query failed: " . $e->getMessage()]);
}

