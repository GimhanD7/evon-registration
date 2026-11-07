<?php
// ========================================================
// System & Database Health Check API
// ========================================================

require_once __DIR__ . '/../config/db.php';

if (!$pdo) {
    echo json_encode([
        "success" => false,
        "api" => "ONLINE",
        "php_version" => PHP_VERSION,
        "database" => "OFFLINE",
        "error" => $pdo_error ?? "Unable to connect to MySQL",
        "hint" => "Start MySQL in XAMPP Control Panel. Once started, tables and seed data will be configured automatically.",
        "stats" => [
            "total_users" => 0,
            "total_papers" => 0,
            "total_results" => 0,
            "total_quizzes" => 0,
            "total_evaluations" => 0,
        ],
        "timestamp" => date('Y-m-d H:i:s'),
    ]);
    exit();
}

try {
    $userCount = $pdo->query("SELECT COUNT(*) as c FROM users")->fetch()['c'] ?? 0;
    $paperCount = $pdo->query("SELECT COUNT(*) as c FROM papers")->fetch()['c'] ?? 0;
    $resultCount = $pdo->query("SELECT COUNT(*) as c FROM paper_results")->fetch()['c'] ?? 0;
    $quizCount = $pdo->query("SELECT COUNT(*) as c FROM quizzes")->fetch()['c'] ?? 0;
    $evalCount = $pdo->query("SELECT COUNT(*) as c FROM evaluations")->fetch()['c'] ?? 0;

    echo json_encode([
        "success" => true,
        "api" => "ONLINE",
        "php_version" => PHP_VERSION,
        "database" => "CONNECTED",
        "database_name" => $db_name,
        "stats" => [
            "total_users" => (int)$userCount,
            "total_papers" => (int)$paperCount,
            "total_results" => (int)$resultCount,
            "total_quizzes" => (int)$quizCount,
            "total_evaluations" => (int)$evalCount,
        ],
        "timestamp" => date('Y-m-d H:i:s'),
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "api" => "ONLINE",
        "php_version" => PHP_VERSION,
        "database" => "ERROR",
        "error" => $e->getMessage(),
        "hint" => "Run backend/api/seed.php to initialize tables and records.",
        "stats" => [
            "total_users" => 0,
            "total_papers" => 0,
            "total_results" => 0,
            "total_quizzes" => 0,
            "total_evaluations" => 0,
        ],
        "timestamp" => date('Y-m-d H:i:s'),
    ]);
}
