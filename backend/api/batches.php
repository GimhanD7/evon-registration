<?php
// ========================================================
// Batches Management API
// Evon Aravinda Commerce Education LMS
// Stored in MySQL Database: `batches` table
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

header('Content-Type: application/json; charset=utf-8');

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
    // Handled gracefully
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

// Helper function to return all current batches from database
function getAllDatabaseBatches($pdo, $seedBatches) {
    $batches = [];
    try {
        $stmt = $pdo->query("SELECT `name` FROM `batches` ORDER BY `id` ASC");
        while ($row = $stmt->fetch()) {
            $name = trim($row['name'] ?? '');
            if (!empty($name) && !in_array($name, $batches)) {
                $batches[] = $name;
            }
        }
    } catch (Exception $e) {}

    if (empty($batches)) {
        $batches = $seedBatches;
    }
    return $batches;
}

// 3. GET: Fetch all batches from database
if ($method === 'GET') {
    try {
        $batches = getAllDatabaseBatches($pdo, $seedBatches);

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

// 4. POST: Add, Update (Rename), or Delete a batch
if ($method === 'POST') {
    try {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? $_POST;
        $action = trim($data['action'] ?? 'add');

        // ACTION: UPDATE / RENAME BATCH
        if ($action === 'update' || $action === 'rename' || $action === 'change') {
            $oldName = trim($data['oldName'] ?? $data['old_name'] ?? '');
            $newName = trim($data['newName'] ?? $data['new_name'] ?? $data['name'] ?? '');

            if (empty($oldName) || empty($newName)) {
                echo json_encode([
                    "success" => false,
                    "error" => "Both current batch name and new batch name are required."
                ]);
                exit();
            }

            // Update in batches table
            $upStmt = $pdo->prepare("UPDATE `batches` SET `name` = :newName WHERE `name` = :oldName");
            $upStmt->execute([
                'newName' => $newName,
                'oldName' => $oldName
            ]);

            // Cascade update to users enrolled in this batch
            try {
                $uStmt = $pdo->prepare("UPDATE `users` SET `batch` = :newName WHERE `batch` = :oldName");
                $uStmt->execute(['newName' => $newName, 'oldName' => $oldName]);
            } catch (Exception $ex) {}

            // Cascade update to papers assigned to this batch
            try {
                $pStmt = $pdo->prepare("UPDATE `papers` SET `batch` = :newName WHERE `batch` = :oldName");
                $pStmt->execute(['newName' => $newName, 'oldName' => $oldName]);
            } catch (Exception $ex) {}

            // Cascade update to quizzes assigned to this batch
            try {
                $qStmt = $pdo->prepare("UPDATE `quizzes` SET `batch` = :newName WHERE `batch` = :oldName");
                $qStmt->execute(['newName' => $newName, 'oldName' => $oldName]);
            } catch (Exception $ex) {}

            $allBatches = getAllDatabaseBatches($pdo, $seedBatches);

            echo json_encode([
                "success" => true,
                "message" => "Commerce Batch updated from '{$oldName}' to '{$newName}' successfully across all enrolled records.",
                "oldName" => $oldName,
                "newName" => $newName,
                "batches" => $allBatches
            ]);
            exit();
        }

        // ACTION: DELETE BATCH
        if ($action === 'delete' || $action === 'remove') {
            $batchName = trim($data['name'] ?? $data['batch'] ?? '');
            if (!empty($batchName)) {
                $delStmt = $pdo->prepare("DELETE FROM `batches` WHERE `name` = :name");
                $delStmt->execute(['name' => $batchName]);
            }

            $allBatches = getAllDatabaseBatches($pdo, $seedBatches);

            echo json_encode([
                "success" => true,
                "message" => "Batch '{$batchName}' removed from database successfully.",
                "batches" => $allBatches
            ]);
            exit();
        }

        // DEFAULT ACTION: ADD BATCH
        $batchName = trim($data['name'] ?? $data['batch'] ?? '');
        if (empty($batchName)) {
            echo json_encode([
                "success" => false,
                "error" => "Batch name cannot be empty."
            ]);
            exit();
        }

        // Insert into database
        $stmt = $pdo->prepare("INSERT INTO `batches` (`name`) VALUES (:name) ON DUPLICATE KEY UPDATE `name` = `name`");
        $stmt->execute(['name' => $batchName]);

        $allBatches = getAllDatabaseBatches($pdo, $seedBatches);

        echo json_encode([
            "success" => true,
            "message" => "Commerce Batch '{$batchName}' added to database successfully.",
            "batch" => $batchName,
            "batches" => $allBatches
        ]);
        exit();
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => "Failed to process batch request: " . $e->getMessage()
        ]);
        exit();
    }
}

// 5. DELETE: Remove a batch from database via DELETE method
if ($method === 'DELETE') {
    try {
        $batchName = trim($_GET['name'] ?? '');
        if (!empty($batchName)) {
            $stmt = $pdo->prepare("DELETE FROM `batches` WHERE `name` = :name");
            $stmt->execute(['name' => $batchName]);
        }

        $allBatches = getAllDatabaseBatches($pdo, $seedBatches);

        echo json_encode([
            "success" => true,
            "message" => "Batch removed from database.",
            "batches" => $allBatches
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
