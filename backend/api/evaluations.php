<?php
// ========================================================
// Student Evaluations API
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// GET: Retrieve evaluations
if ($method === 'GET') {
    try {
        $studentId = trim($_GET['studentId'] ?? '');
        if (!empty($studentId)) {
            $stmt = $pdo->prepare("SELECT e.id, u.user_uid as studentId, e.paper_or_term as paperOrTerm, e.evaluation_date as date, e.attendance_rate as attendanceRate, e.strengths, e.weaknesses, e.teacher_remarks as teacherRemarks, e.recommended_action as recommendedAction, e.performance_grade as performanceGrade FROM evaluations e JOIN users u ON e.user_id = u.id WHERE u.user_uid = :sid OR u.phone = :sid ORDER BY e.id DESC");
            $stmt->execute(['sid' => $studentId]);
        } else {
            $stmt = $pdo->query("SELECT e.id, u.user_uid as studentId, e.paper_or_term as paperOrTerm, e.evaluation_date as date, e.attendance_rate as attendanceRate, e.strengths, e.weaknesses, e.teacher_remarks as teacherRemarks, e.recommended_action as recommendedAction, e.performance_grade as performanceGrade FROM evaluations e JOIN users u ON e.user_id = u.id ORDER BY e.id DESC");
        }
        $rows = $stmt->fetchAll();
        $evaluations = array_map(function($r) {
            return [
                "id" => "eval-" . $r['id'],
                "studentId" => $r['studentId'],
                "paperOrTerm" => $r['paperOrTerm'],
                "date" => $r['date'],
                "attendanceRate" => (int)$r['attendanceRate'],
                "strengths" => json_decode($r['strengths'], true) ?? [],
                "weaknesses" => json_decode($r['weaknesses'], true) ?? [],
                "teacherRemarks" => $r['teacherRemarks'],
                "recommendedAction" => $r['recommendedAction'],
                "performanceGrade" => $r['performanceGrade'],
            ];
        }, $rows);
        echo json_encode(["success" => true, "evaluations" => $evaluations]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// POST: Add new evaluation
if ($method === 'POST') {
    $data = get_json_payload();
    $studentUid = trim($data['studentId'] ?? '');
    $paperOrTerm = trim($data['paperOrTerm'] ?? 'Monthly Comprehensive Review');
    $date = trim($data['date'] ?? date('Y-m-d'));
    $attendanceRate = (int)($data['attendanceRate'] ?? 95);
    $strengths = $data['strengths'] ?? [];
    $weaknesses = $data['weaknesses'] ?? [];
    $teacherRemarks = trim($data['teacherRemarks'] ?? '');
    $recommendedAction = trim($data['recommendedAction'] ?? 'Focus on weekly revision worksheets.');
    $performanceGrade = trim($data['performanceGrade'] ?? 'Very Good');

    if (empty($studentUid) || empty($teacherRemarks)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Student and teacher remarks are required."]);
        exit();
    }

    try {
        $stmtUser = $pdo->prepare("SELECT id FROM users WHERE user_uid = :uid OR phone = :uid LIMIT 1");
        $stmtUser->execute(['uid' => $studentUid]);
        $userRow = $stmtUser->fetch();

        if (!$userRow) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Student not found in database."]);
            exit();
        }

        $userId = $userRow['id'];
        $stmt = $pdo->prepare("INSERT INTO evaluations (user_id, paper_or_term, evaluation_date, attendance_rate, strengths, weaknesses, teacher_remarks, recommended_action, performance_grade) VALUES (:uid, :term, :edate, :rate, :str, :weak, :rem, :rec, :grade)");
        $stmt->execute([
            'uid' => $userId,
            'term' => $paperOrTerm,
            'edate' => $date,
            'rate' => $attendanceRate,
            'str' => json_encode($strengths),
            'weak' => json_encode($weaknesses),
            'rem' => $teacherRemarks,
            'rec' => $recommendedAction,
            'grade' => $performanceGrade,
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Evaluation published successfully",
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to save evaluation: " . $e->getMessage()]);
    }
    exit();
}
