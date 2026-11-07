<?php
// ========================================================
// Quizzes Management API (Database-Backed)
// Evon Aravinda Commerce Education LMS
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// --------------------------------------------------------
// 1. GET: List all quizzes with questions from MySQL
// --------------------------------------------------------
if ($method === 'GET') {
    try {
        $quizId = trim($_GET['id'] ?? '');

        if (!empty($quizId)) {
            $stmt = $pdo->prepare("SELECT quiz_uid as id, title, subject, batch, duration_minutes as durationMinutes FROM quizzes WHERE quiz_uid = :qid LIMIT 1");
            $stmt->execute(['qid' => $quizId]);
            $quiz = $stmt->fetch();

            if ($quiz) {
                $qStmt = $pdo->prepare("SELECT id, question_text as question, options_json, correct_answer as correctAnswer, explanation FROM quiz_questions WHERE quiz_uid = :qid ORDER BY id ASC");
                $qStmt->execute(['qid' => $quizId]);
                $questionsRaw = $qStmt->fetchAll();

                $quiz['questions'] = array_map(function($qn) {
                    return [
                        "id" => "qn-" . $qn['id'],
                        "question" => $qn['question'],
                        "options" => json_decode($qn['options_json'], true) ?? [],
                        "correctAnswer" => (int)$qn['correctAnswer'],
                        "explanation" => $qn['explanation'] ?? '',
                    ];
                }, $questionsRaw);

                echo json_encode(["success" => true, "quiz" => $quiz]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "Quiz not found."]);
            }
            exit();
        }

        // Fetch all quizzes
        $stmt = $pdo->query("SELECT quiz_uid as id, title, subject, batch, duration_minutes as durationMinutes FROM quizzes ORDER BY id DESC");
        $quizzes = $stmt->fetchAll();

        // Attach questions to each quiz
        foreach ($quizzes as &$quiz) {
            $qStmt = $pdo->prepare("SELECT id, question_text as question, options_json, correct_answer as correctAnswer, explanation FROM quiz_questions WHERE quiz_uid = :qid ORDER BY id ASC");
            $qStmt->execute(['qid' => $quiz['id']]);
            $questionsRaw = $qStmt->fetchAll();

            $quiz['questions'] = array_map(function($qn) {
                return [
                    "id" => "qn-" . $qn['id'],
                    "question" => $qn['question'],
                    "options" => json_decode($qn['options_json'], true) ?? [],
                    "correctAnswer" => (int)$qn['correctAnswer'],
                    "explanation" => $qn['explanation'] ?? '',
                ];
            }, $questionsRaw);
        }

        echo json_encode(["success" => true, "quizzes" => $quizzes]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database error: " . $e->getMessage()]);
    }
    exit();
}

// --------------------------------------------------------
// 2. POST: Create or Update Quiz in MySQL
// --------------------------------------------------------
if ($method === 'POST') {
    $data = get_json_payload();
    $quizUid = trim($data['id'] ?? ('quiz-' . time() . '-' . rand(100, 999)));
    $title = trim($data['title'] ?? '');
    $subject = trim($data['subject'] ?? 'Commerce');
    $batch = trim($data['batch'] ?? '2026/2027 O/L Commerce');
    $durationMinutes = (int)($data['durationMinutes'] ?? 15);
    $questions = $data['questions'] ?? [];

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Quiz title is required."]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Check if quiz already exists
        $checkStmt = $pdo->prepare("SELECT id FROM quizzes WHERE quiz_uid = :qid LIMIT 1");
        $checkStmt->execute(['qid' => $quizUid]);
        $exists = $checkStmt->fetch();

        if ($exists) {
            $upStmt = $pdo->prepare("UPDATE quizzes SET title = :t, subject = :s, batch = :b, duration_minutes = :d WHERE quiz_uid = :qid");
            $upStmt->execute([
                't' => $title,
                's' => $subject,
                'b' => $batch,
                'd' => $durationMinutes,
                'qid' => $quizUid
            ]);

            // Clear old questions to replace with updated list
            $delQ = $pdo->prepare("DELETE FROM quiz_questions WHERE quiz_uid = :qid");
            $delQ->execute(['qid' => $quizUid]);
        } else {
            $insStmt = $pdo->prepare("INSERT INTO quizzes (quiz_uid, title, subject, batch, duration_minutes) VALUES (:qid, :t, :s, :b, :d)");
            $insStmt->execute([
                'qid' => $quizUid,
                't' => $title,
                's' => $subject,
                'b' => $batch,
                'd' => $durationMinutes
            ]);
        }

        // Insert questions
        if (!empty($questions) && is_array($questions)) {
            $insQ = $pdo->prepare("INSERT INTO quiz_questions (quiz_uid, question_text, options_json, correct_answer, explanation) VALUES (:qid, :qtext, :opts, :correct, :expl)");
            foreach ($questions as $qn) {
                $qText = trim($qn['question'] ?? '');
                if (empty($qText)) continue;
                $opts = is_array($qn['options'] ?? null) ? $qn['options'] : [];
                $correct = (int)($qn['correctAnswer'] ?? 0);
                $expl = trim($qn['explanation'] ?? '');

                $insQ->execute([
                    'qid' => $quizUid,
                    'qtext' => $qText,
                    'opts' => json_encode($opts, JSON_UNESCAPED_UNICODE),
                    'correct' => $correct,
                    'expl' => $expl
                ]);
            }
        }

        $pdo->commit();

        echo json_encode([
            "success" => true,
            "message" => "Quiz saved to database successfully.",
            "quiz" => [
                "id" => $quizUid,
                "title" => $title,
                "subject" => $subject,
                "batch" => $batch,
                "durationMinutes" => $durationMinutes,
                "questions" => $questions
            ]
        ]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to save quiz: " . $e->getMessage()]);
    }
    exit();
}

// --------------------------------------------------------
// 3. DELETE: Remove Quiz from MySQL
// --------------------------------------------------------
if ($method === 'DELETE') {
    $quizId = trim($_GET['id'] ?? '');
    if (empty($quizId)) {
        $payload = get_json_payload();
        $quizId = trim($payload['id'] ?? '');
    }

    if (empty($quizId)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Quiz ID is required for deletion."]);
        exit();
    }

    try {
        $pdo->beginTransaction();
        $delQuestions = $pdo->prepare("DELETE FROM quiz_questions WHERE quiz_uid = :qid");
        $delQuestions->execute(['qid' => $quizId]);

        $delQuiz = $pdo->prepare("DELETE FROM quizzes WHERE quiz_uid = :qid");
        $delQuiz->execute(['qid' => $quizId]);
        $pdo->commit();

        echo json_encode(["success" => true, "message" => "Quiz deleted from database successfully."]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to delete quiz: " . $e->getMessage()]);
    }
    exit();
}
