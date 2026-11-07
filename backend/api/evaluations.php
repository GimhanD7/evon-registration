<?php
// ========================================================
// Student Evaluations API
// Evon Aravinda Commerce Education LMS
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1. Ensure `evaluations` table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `evaluations` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `evaluation_uid` VARCHAR(64) DEFAULT NULL,
        `student_id` VARCHAR(64) NOT NULL,
        `paper_or_term` VARCHAR(150) NOT NULL,
        `evaluation_date` DATE NOT NULL,
        `attendance_rate` INT DEFAULT 95,
        `strengths` TEXT DEFAULT NULL,
        `weaknesses` TEXT DEFAULT NULL,
        `teacher_remarks` TEXT NOT NULL,
        `recommended_action` TEXT NOT NULL,
        `performance_grade` VARCHAR(50) DEFAULT 'Outstanding',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (`student_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Exception $e) {
    // Handled gracefully
}

// 2. GET: Retrieve evaluations
if ($method === 'GET') {
    try {
        $studentId = trim($_GET['studentId'] ?? $_GET['student_id'] ?? '');

        // Inspect existing columns in evaluations table to build safe query
        $cols = [];
        try {
            $cols = $pdo->query("SHOW COLUMNS FROM `evaluations`")->fetchAll(PDO::FETCH_COLUMN) ?: [];
        } catch (Exception $e) {}

        $hasStudentIdCol = in_array('student_id', $cols);
        $hasUserIdCol = in_array('user_id', $cols);
        $hasUidCol = in_array('evaluation_uid', $cols);

        if (!empty($studentId)) {
            // Find student user_uid or numeric id
            $matchedUids = [$studentId];
            try {
                $uStmt = $pdo->prepare("SELECT id, user_uid, phone FROM users WHERE user_uid = :sid1 OR phone = :sid2 OR id = :sid3 LIMIT 1");
                $uStmt->execute(['sid1' => $studentId, 'sid2' => $studentId, 'sid3' => $studentId]);
                $uRow = $uStmt->fetch();
                if ($uRow) {
                    if (!empty($uRow['user_uid'])) $matchedUids[] = (string)$uRow['user_uid'];
                    if (!empty($uRow['id'])) $matchedUids[] = (string)$uRow['id'];
                    if (!empty($uRow['phone'])) $matchedUids[] = (string)$uRow['phone'];
                }
            } catch (Exception $e) {}

            $placeholders = implode(',', array_fill(0, count($matchedUids), '?'));

            $whereParts = [];
            if ($hasStudentIdCol) $whereParts[] = "student_id IN ($placeholders)";
            if ($hasUserIdCol) $whereParts[] = "user_id IN ($placeholders)";
            if ($hasUidCol) $whereParts[] = "evaluation_uid IN ($placeholders)";

            $whereClause = !empty($whereParts) ? ("WHERE " . implode(' OR ', $whereParts)) : "";

            // Repeat parameters for each active column check
            $params = [];
            for ($i = 0; $i < count($whereParts); $i++) {
                $params = array_merge($params, $matchedUids);
            }

            if (!empty($whereClause)) {
                $stmt = $pdo->prepare("SELECT * FROM `evaluations` {$whereClause} ORDER BY `id` DESC");
                $stmt->execute($params);
            } else {
                $stmt = $pdo->query("SELECT * FROM `evaluations` ORDER BY `id` DESC");
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM `evaluations` ORDER BY `id` DESC");
        }

        $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
        $evaluations = [];

        foreach ($rows as $r) {
            $strengths = [];
            if (!empty($r['strengths'])) {
                $decoded = json_decode($r['strengths'], true);
                $strengths = is_array($decoded) ? $decoded : [$r['strengths']];
            }

            $weaknesses = [];
            if (!empty($r['weaknesses'])) {
                $decoded = json_decode($r['weaknesses'], true);
                $weaknesses = is_array($decoded) ? $decoded : [$r['weaknesses']];
            }

            $evalId = !empty($r['evaluation_uid'])
                ? $r['evaluation_uid']
                : ("eval-" . ($r['id'] ?? uniqid()));

            $sId = !empty($r['student_id'])
                ? $r['student_id']
                : (!empty($r['user_id']) ? (string)$r['user_id'] : '');

            $evaluations[] = [
                "id" => $evalId,
                "studentId" => $sId,
                "paperOrTerm" => $r['paper_or_term'] ?? 'Monthly Comprehensive Review',
                "date" => $r['evaluation_date'] ?? date('Y-m-d'),
                "attendanceRate" => (int)($r['attendance_rate'] ?? 95),
                "strengths" => $strengths,
                "weaknesses" => $weaknesses,
                "teacherRemarks" => $r['teacher_remarks'] ?? '',
                "recommendedAction" => $r['recommended_action'] ?? 'Focus on weekly revision worksheets.',
                "performanceGrade" => $r['performance_grade'] ?? 'Very Good',
            ];
        }

        echo json_encode([
            "success" => true,
            "evaluations" => $evaluations,
            "count" => count($evaluations)
        ]);
        exit();
    } catch (Exception $e) {
        // Return clean empty evaluations array instead of 500 error to keep LMS running smoothly
        echo json_encode([
            "success" => true,
            "evaluations" => [],
            "error" => $e->getMessage()
        ]);
        exit();
    }
}

// 3. POST: Add new evaluation
if ($method === 'POST') {
    try {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true) ?? $_POST;

        $studentUid = trim($data['studentId'] ?? $data['student_id'] ?? '');
        $paperOrTerm = trim($data['paperOrTerm'] ?? $data['paper_or_term'] ?? 'Monthly Comprehensive Review');
        $date = trim($data['date'] ?? $data['evaluation_date'] ?? date('Y-m-d'));
        $attendanceRate = (int)($data['attendanceRate'] ?? $data['attendance_rate'] ?? 95);
        $strengths = $data['strengths'] ?? [];
        $weaknesses = $data['weaknesses'] ?? [];
        $teacherRemarks = trim($data['teacherRemarks'] ?? $data['teacher_remarks'] ?? '');
        $recommendedAction = trim($data['recommendedAction'] ?? $data['recommended_action'] ?? 'Focus on weekly revision worksheets.');
        $performanceGrade = trim($data['performanceGrade'] ?? $data['performance_grade'] ?? 'Very Good');

        if (empty($studentUid) || empty($teacherRemarks)) {
            echo json_encode(["success" => false, "error" => "Student ID and teacher remarks are required."]);
            exit();
        }

        $evalUid = 'eval-' . time() . '-' . rand(100, 999);

        // Find student user_uid if numeric id or phone was passed
        try {
            $stmtUser = $pdo->prepare("SELECT user_uid, id FROM users WHERE user_uid = :uid1 OR phone = :uid2 OR id = :uid3 LIMIT 1");
            $stmtUser->execute(['uid1' => $studentUid, 'uid2' => $studentUid, 'uid3' => $studentUid]);
            $uRow = $stmtUser->fetch();
            if ($uRow && !empty($uRow['user_uid'])) {
                $studentUid = $uRow['user_uid'];
            }
        } catch (Exception $e) {}

        // Inspect columns to build safe insert query
        $cols = [];
        try {
            $cols = $pdo->query("SHOW COLUMNS FROM `evaluations`")->fetchAll(PDO::FETCH_COLUMN) ?: [];
        } catch (Exception $e) {}

        $hasUidCol = in_array('evaluation_uid', $cols);
        $hasStudentIdCol = in_array('student_id', $cols);

        $insertCols = ['paper_or_term', 'evaluation_date', 'attendance_rate', 'strengths', 'weaknesses', 'teacher_remarks', 'recommended_action', 'performance_grade'];
        $insertVals = [':term', ':edate', ':rate', ':str', ':weak', ':rem', ':rec', ':grade'];
        $params = [
            'term' => $paperOrTerm,
            'edate' => $date,
            'rate' => $attendanceRate,
            'str' => is_array($strengths) ? json_encode($strengths) : (string)$strengths,
            'weak' => is_array($weaknesses) ? json_encode($weaknesses) : (string)$weaknesses,
            'rem' => $teacherRemarks,
            'rec' => $recommendedAction,
            'grade' => $performanceGrade,
        ];

        if ($hasUidCol) {
            $insertCols[] = 'evaluation_uid';
            $insertVals[] = ':euid';
            $params['euid'] = $evalUid;
        }

        if ($hasStudentIdCol) {
            $insertCols[] = 'student_id';
            $insertVals[] = ':sid';
            $params['sid'] = $studentUid;
        }

        $colList = implode(', ', array_map(function($c) { return "`$c`"; }, $insertCols));
        $valList = implode(', ', $insertVals);

        $stmt = $pdo->prepare("INSERT INTO `evaluations` ($colList) VALUES ($valList)");
        $stmt->execute($params);

        echo json_encode([
            "success" => true,
            "message" => "Evaluation published successfully.",
            "id" => $evalUid
        ]);
        exit();
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => "Failed to save evaluation: " . $e->getMessage()
        ]);
        exit();
    }
}

// 4. DELETE: Remove an evaluation
if ($method === 'DELETE') {
    try {
        $evalId = trim($_GET['id'] ?? '');
        if (!empty($evalId)) {
            $delStmt = $pdo->prepare("DELETE FROM `evaluations` WHERE `evaluation_uid` = :eid1 OR `id` = :eid2");
            $delStmt->execute(['eid1' => $evalId, 'eid2' => $evalId]);
        }
        echo json_encode(["success" => true, "message" => "Evaluation removed."]);
        exit();
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
        exit();
    }
}
