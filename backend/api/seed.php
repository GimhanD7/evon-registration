<?php
// ========================================================
// One-Click Database Setup & Seeder for XAMPP
// URL: http://localhost/Evon-registration/backend/api/seed.php
// API: /api/backend/seed.php?format=json
// ========================================================

// Populate $_GET from QUERY_STRING in CLI mode (when invoked via Next.js route bridge)
if (php_sapi_name() === 'cli' && !empty($_SERVER['QUERY_STRING'] ?? '')) {
    parse_str($_SERVER['QUERY_STRING'], $cliGet);
    $_GET = array_merge($_GET ?? [], $cliGet);
}

$isJson = (($_GET['format'] ?? '') === 'json') || 
          (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
          (php_sapi_name() === 'cli' && isset($_SERVER['QUERY_STRING']));

if ($isJson) {
    header("Content-Type: application/json; charset=UTF-8");
} else {
    header("Content-Type: text/html; charset=UTF-8");
}

require_once __DIR__ . '/../config/db.php';

$results = [
    "success" => false,
    "message" => "",
    "counts" => []
];

try {
    // 1. Connect to MySQL server and ensure correct database is selected
    if (!$pdo) {
        $pdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::MYSQL_ATTR_MULTI_STATEMENTS => true,
        ]);
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec("DROP TABLE IF EXISTS `app_settings`, `activity_logs`, `national_results`, `quiz_attempts`, `quiz_questions`, `evaluations`, `paper_results`, `quizzes`, `papers`, `users`, `batches`;");
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // 2. Load seed_all_data.sql (which contains all CREATE TABLE definitions and initial records)
    $seedPath = __DIR__ . '/../database/seed_all_data.sql';
    if (file_exists($seedPath)) {
        $seedSql = file_get_contents($seedPath);
        $pdo->exec($seedSql);
    } else {
        throw new Exception("Seed file not found at: {$seedPath}");
    }

    // 3. Connect to target database specifically to count records
    $dbPdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $userCount = $dbPdo->query("SELECT COUNT(*) as c FROM users")->fetch()['c'] ?? 0;
    $paperCount = $dbPdo->query("SELECT COUNT(*) as c FROM papers")->fetch()['c'] ?? 0;
    $resultCount = $dbPdo->query("SELECT COUNT(*) as c FROM paper_results")->fetch()['c'] ?? 0;
    $nationalCount = $dbPdo->query("SELECT COUNT(*) as c FROM national_results")->fetch()['c'] ?? 0;
    $quizCount = $dbPdo->query("SELECT COUNT(*) as c FROM quizzes")->fetch()['c'] ?? 0;
    $evalCount = $dbPdo->query("SELECT COUNT(*) as c FROM evaluations")->fetch()['c'] ?? 0;

    $results["success"] = true;
    $results["message"] = "Database '{$db_name}' cleared of all sample data! Initialized with clean schema and root administrator.";
    $results["counts"] = [
        "users" => (int)$userCount,
        "papers" => (int)$paperCount,
        "paper_results" => (int)$resultCount,
        "national_results" => (int)$nationalCount,
        "quizzes" => (int)$quizCount,
        "evaluations" => (int)$evalCount,
    ];

    if ($isJson) {
        echo json_encode($results);
        exit();
    }

    // HTML Output for Browser View
    echo "<!DOCTYPE html><html><head><title>LMS Database Seed Status</title></head><body style='background:#edf2f3; margin:0; padding:40px 20px; font-family:system-ui, -apple-system, sans-serif;'>";
    echo "<div style='max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #d4e0e8; padding: 32px; box-shadow: 0 12px 30px rgba(16,44,69,0.08);'>";
    echo "<div style='display:flex; align-items:center; gap:12px; margin-bottom:20px;'>";
    echo "<div style='width:44px; height:44px; border-radius:12px; background:#102c45; display:flex; align-items:center; justify-content:center; color:#38d995; font-size:24px;'>✓</div>";
    echo "<div>";
    echo "<h2 style='margin:0; color:#102c45; font-size:20px; font-weight:800;'>Database Synchronized & Seeded</h2>";
    echo "<p style='margin:4px 0 0; color:#64748b; font-size:13px;'>Evon Aravinda Commerce Education LMS • MySQL (XAMPP)</p>";
    echo "</div>";
    echo "</div>";

    echo "<div style='background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:16px; border-radius:14px; font-size:14px; margin-bottom:24px; line-height:1.5;'>";
    echo "<strong>Clean State Initialized!</strong> All sample and mock data has been purged. The database is clean and ready for real production papers, students, and marks.";
    echo "</div>";

    echo "<h3 style='margin:0 0 12px; color:#102c45; font-size:14px; text-transform:uppercase; letter-spacing:0.05em;'>Current Database Records</h3>";
    echo "<div style='display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:24px;'>";
    echo "<div style='background:#f8fafc; border:1px solid #e2e8f0; padding:14px 16px; border-radius:12px;'><div style='color:#64748b; font-size:12px;'>Exam Papers</div><div style='color:#007fb8; font-size:22px; font-weight:800;'>{$paperCount}</div></div>";
    echo "<div style='background:#f8fafc; border:1px solid #e2e8f0; padding:14px 16px; border-radius:12px;'><div style='color:#64748b; font-size:12px;'>Student Results</div><div style='color:#159366; font-size:22px; font-weight:800;'>{$resultCount}</div></div>";
    echo "<div style='background:#f8fafc; border:1px solid #e2e8f0; padding:14px 16px; border-radius:12px;'><div style='color:#64748b; font-size:12px;'>Registered Accounts</div><div style='color:#102c45; font-size:22px; font-weight:800;'>{$userCount}</div></div>";
    echo "<div style='background:#f8fafc; border:1px solid #e2e8f0; padding:14px 16px; border-radius:12px;'><div style='color:#64748b; font-size:12px;'>Quizzes & Evaluations</div><div style='color:#8b5cf6; font-size:22px; font-weight:800;'>" . ($quizCount + $evalCount) . "</div></div>";
    echo "</div>";

    echo "<div style='background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:14px; font-size:13px; line-height:1.6; margin-bottom:24px;'>";
    echo "<strong style='color:#102c45;'>Root Administrator Access:</strong><br>";
    echo "• <strong>Admin Phone:</strong> <code>0719998877</code> | <strong>Password:</strong> <code>admin123</code><br>";
    echo "</div>";

    echo "<div style='display:flex; gap:12px;'>";
    echo "<a href='/lms/admin' style='flex:1; text-align:center; padding:12px 20px; background:#102c45; color:white; text-decoration:none; border-radius:12px; font-weight:700; font-size:13px;'>Open Admin LMS &rarr;</a>";
    echo "<a href='/paper-class' style='flex:1; text-align:center; padding:12px 20px; background:#007fb8; color:white; text-decoration:none; border-radius:12px; font-weight:700; font-size:13px;'>Open Paper Class &rarr;</a>";
    echo "</div>";

    echo "</div></body></html>";

} catch (Exception $e) {
    $results["success"] = false;
    $results["error"] = $e->getMessage();

    if ($isJson) {
        http_response_code(500);
        echo json_encode($results);
        exit();
    }

    echo "<!DOCTYPE html><html><head><title>Database Setup Notice</title></head><body style='background:#edf2f3; margin:0; padding:40px 20px; font-family:system-ui, -apple-system, sans-serif;'>";
    echo "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #fecaca; padding: 32px;'>";
    echo "<h2 style='color: #dc2626; margin-top:0;'>MySQL Connection Required</h2>";
    echo "<p style='color: #475569; font-size: 14px; line-height: 1.6;'>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<div style='background:#fef2f2; border:1px solid #fee2e2; padding:16px; border-radius:12px; color:#991b1b; font-size:13px; margin:20px 0;'>";
    echo "<strong>To connect:</strong><br>1. Open <strong>XAMPP Control Panel</strong>.<br>2. Click <strong>Start</strong> next to MySQL.<br>3. Refresh this page to run the database seeder.";
    echo "</div>";
    echo "<a href='javascript:location.reload()' style='display:inline-block; padding:10px 20px; background:#102c45; color:white; border-radius:10px; text-decoration:none; font-weight:700; font-size:13px;'>Retry Seeding &rarr;</a>";
    echo "</div></body></html>";
}
