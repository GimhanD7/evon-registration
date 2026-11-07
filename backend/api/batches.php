<?php
// ========================================================
// Batches Management API
// Evon Aravinda Commerce Education LMS
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1. Ensure `batches` table exists in database
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `batches` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(150) NOT NULL UNIQUE,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (`name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Exception $e) {
    // Table creation handled gracefully
}

// 2. Default Seed Batches
$seedBatches = [
    '2026/2027 O/L Commerce',
    '2027 O/L Commerce Foundation (Grade 10)',
    '2026/2027 Grade 11 Theory',
    '2026 O/L Speed Revision & Paper Class',
    'All Batches (Commerce)'
];

try {
    $checkCount = $pdo->query("SELECT COUNT(*) FROM `batches`")->fetchColumn();
    if ($checkCount == 0) {
        $insertStmt = $pdo->prepare("INSERT IGNORE INTO `batches` (`name`) VALUES (:bname)");
        foreach ($seedBatches as $sb) {
            $insertStmt->execute(['bname' => $sb]);
        }
    }
} catch (Exception $e) {
    // Ignore seed errors
}

// 3. GET: Fetch all batches from the database
if ($method === 'GET') {
    try {
        $batches = [];

        // Fetch from dedicated `batches` table
        $stmt = $pdo->query("SELECT `name` FROM `batches` ORDER BY `id` ASC");
        while ($row = $stmt->fetch()) {
            $name = trim($row['name'] ?? '');
            if (!empty($name) && !in_array($name, $batches)) {
                $batches[] = $name;
            }
        }

        // Also harvest any existing distinct batches from `papers`, `quizzes`, and `users`
        $harvestQueries = [
            "SELECT DISTINCT `batch` FROM `papers` WHERE `batch` IS NOT NULL AND TRIM(`batch`) != ''",
            "SELECT DISTINCT `batch` FROM `quizzes` WHERE `batch` IS NOT NULL AND TRIM(`batch`) != ''",
            "SELECT DISTINCT `batch` FROM `users` WHERE `batch` IS NOT NULL AND TRIM(`batch`) != ''"
        ];

        foreach ($harvestQueries as $hq) {
            try {
                $hstmt = $pdo->query($hq);
                while ($hrow = $hstmt->fetch()) {
                    $val = trim($hrow['batch'] ?? '');
                    if (!empty($val) && !in_array($val, $batches)) {
                        $batches[] = $val;
                    }
                }
            } catch (Exception $ex) {
                // Ignore if table does not exist yet
            }
        }

        // If still empty, return default seeds
        if (empty($batches)) {
            $batches = $seedBatches;
        }

        echo json_encode([
            "success" => true,
            "batches" => $batches,
            "count" => count($batches),
            "source" => "database"
        ]);
        exit();
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => "Failed to fetch batches: " . $e->getMessage(),
            "batches" => $seedBatches
        ]);
        exit();
    }
}

// 4. POST: Add a new batch to the database
if ($method === 'POST') {
    try {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? $_POST;
        $batchName = trim($data['name'] ?? $data['batch'] ?? '');

        if (empty($batchName)) {
            echo json_encode([
                "success" => false,
                "error" => "Batch name cannot be empty."
            ]);
            exit();
        }

        // Insert into database
        $stmt = $pdo->prepare("INSERT INTO `batches` (`name`) VALUES (:name) ON DUPLICATE KEY UPDATE `name` = :name_update");
        $stmt->execute([
            'name' => $batchName,
            'name_update' => $batchName
        ]);

        // Return updated list of all batches
        $allStmt = $pdo->query("SELECT `name` FROM `batches` ORDER BY `id` ASC");
        $allBatches = $allStmt->fetchAll(PDO::FETCH_COLUMN) ?: [];

        echo json_encode([
            "success" => true,
            "message" => "Batch '{$batchName}' added to database successfully.",
            "batch" => $batchName,
            "batches" => $allBatches
        ]);
        exit();
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => "Failed to add batch to database: " . $e->getMessage()
        ]);
        exit();
    }
}

// 5. DELETE: Remove a batch from database
if ($method === 'DELETE') {
    try {
        $batchName = trim($_GET['name'] ?? '');
        if (!empty($batchName)) {
            $stmt = $pdo->prepare("DELETE FROM `batches` WHERE `name` = :name");
            $stmt->execute(['name' => $batchName]);
        }

        echo json_encode([
            "success" => true,
            "message" => "Batch removed."
        ]);
        exit();
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
        exit();
    }
}
