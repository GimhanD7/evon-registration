<?php
// ========================================================
// Papers / Exams Management API
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1. GET: List all papers
if ($method === 'GET') {
    try {
        $paperId = trim($_GET['id'] ?? $_GET['paperId'] ?? '');
        $withResults = (($_GET['withResults'] ?? '') === '1' || ($_GET['withResults'] ?? '') === 'true');

        if (!empty($paperId)) {
            $stmt = $pdo->prepare("SELECT 
                paper_uid as id, 
                paper_number as paperNumber, 
                paper_code as paperCode, 
                title, 
                batch, 
                subject, 
                term,
                month, 
                year, 
                exam_date as examDate,
                total_marks as totalMarks, 
                duration_minutes as durationMinutes, 
                total_candidates as totalCandidates,
                highest_mark as highestMark,
                average_mark as averageMark,
                pass_percentage as passPercentage,
                topics,
                topper_info as topper,
                score_distribution as scoreDistribution,
                pdf_url as pdfUrl,
                marking_scheme_url as markingSchemeUrl,
                status 
                FROM papers WHERE paper_uid = :pid LIMIT 1");
            $stmt->execute(['pid' => $paperId]);
            $paper = $stmt->fetch();

            if ($paper) {
                $paper['topics'] = json_decode($paper['topics'] ?? '[]', true) ?? [];
                $paper['topper'] = json_decode($paper['topper'] ?? 'null', true);
                $paper['scoreDistribution'] = json_decode($paper['scoreDistribution'] ?? 'null', true);

                $resStmt = $pdo->prepare("SELECT result_uid as id, rank_in_class as `rank`, student_name as `name`, school, index_no as indexNo, part1_score as part1Score, part2_score as part2Score, total_score as totalScore, grade, achievement, avatar_initials as avatarInitials, avatar_image as avatarImage FROM paper_results WHERE paper_uid = :pid ORDER BY rank_in_class ASC, total_score DESC");
                $resStmt->execute(['pid' => $paperId]);
                $paper['results'] = $resStmt->fetchAll();

                echo json_encode(["success" => true, "paper" => $paper]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "error" => "Paper not found."]);
            }
            exit();
        }

        // List all papers
        $stmt = $pdo->query("SELECT 
            paper_uid as id, 
            paper_number as paperNumber, 
            paper_code as paperCode, 
            title, 
            batch, 
            subject, 
            term,
            month, 
            year, 
            exam_date as examDate,
            total_marks as totalMarks, 
            duration_minutes as durationMinutes, 
            total_candidates as totalCandidates,
            highest_mark as highestMark,
            average_mark as averageMark,
            pass_percentage as passPercentage,
            topics,
            topper_info as topper,
            score_distribution as scoreDistribution,
            pdf_url as pdfUrl,
            marking_scheme_url as markingSchemeUrl,
            status 
            FROM papers ORDER BY id ASC");
        $rawPapers = $stmt->fetchAll();

        $papers = array_map(function($p) use ($pdo, $withResults) {
            $p['totalMarks'] = (int)$p['totalMarks'];
            $p['durationMinutes'] = (int)$p['durationMinutes'];
            $p['totalCandidates'] = (int)$p['totalCandidates'];
            $p['highestMark'] = (int)$p['highestMark'];
            $p['averageMark'] = (float)$p['averageMark'];
            $p['passPercentage'] = (float)$p['passPercentage'];
            $p['topics'] = json_decode($p['topics'] ?? '[]', true) ?? [];
            $p['topper'] = json_decode($p['topper'] ?? 'null', true);
            $p['scoreDistribution'] = json_decode($p['scoreDistribution'] ?? 'null', true);

            if ($withResults) {
                $rStmt = $pdo->prepare("SELECT result_uid as id, rank_in_class as `rank`, student_name as `name`, school, index_no as indexNo, part1_score as part1Score, part2_score as part2Score, total_score as totalScore, grade, achievement, avatar_initials as avatarInitials, avatar_image as avatarImage FROM paper_results WHERE paper_uid = :pid ORDER BY rank_in_class ASC, total_score DESC");
                $rStmt->execute(['pid' => $p['id']]);
                $p['results'] = $rStmt->fetchAll();
            }

            return $p;
        }, $rawPapers);

        echo json_encode(["success" => true, "papers" => $papers]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// 2. POST: Add or update paper
if ($method === 'POST') {
    $data = get_json_payload();
    $title = trim($data['title'] ?? '');
    $paperUid = trim($data['id'] ?? $data['paper_uid'] ?? '');
    $paperNumber = trim($data['paperNumber'] ?? 'Paper 01');
    $paperCode = trim($data['paperCode'] ?? '');
    $batch = trim($data['batch'] ?? '2026 O/L Speed Revision & Paper Class');
    $subject = trim($data['subject'] ?? 'Business & Accounting Studies');
    $term = trim($data['term'] ?? 'Final Pre-Exam Assessment');
    $month = trim($data['month'] ?? 'Monthly');
    $year = (int)($data['year'] ?? 2026);
    $examDate = trim($data['examDate'] ?? "{$month} {$year}");
    $totalMarks = (int)($data['totalMarks'] ?? 100);
    $durationMinutes = (int)($data['durationMinutes'] ?? 120);

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Paper title is required."]);
        exit();
    }

    if (empty($paperUid)) {
        $paperUid = 'paper-' . substr(time(), -4) . rand(10, 99);
    }
    if (empty($paperCode)) {
        $paperCode = 'EA-' . strtoupper(str_replace(' ', '-', $paperNumber));
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO papers 
            (paper_uid, paper_number, paper_code, title, batch, subject, term, month, year, exam_date, total_marks, duration_minutes, status) 
            VALUES (:uid, :num, :code, :title, :batch, :subj, :term, :month, :yr, :edate, :marks, :dur, 'published')
            ON DUPLICATE KEY UPDATE 
            paper_number=VALUES(paper_number),
            title=VALUES(title),
            batch=VALUES(batch),
            subject=VALUES(subject),
            term=VALUES(term),
            month=VALUES(month),
            year=VALUES(year),
            exam_date=VALUES(exam_date),
            total_marks=VALUES(total_marks),
            duration_minutes=VALUES(duration_minutes)");

        $stmt->execute([
            'uid' => $paperUid,
            'num' => $paperNumber,
            'code' => $paperCode,
            'title' => $title,
            'batch' => $batch,
            'subj' => $subject,
            'term' => $term,
            'month' => $month,
            'yr' => $year,
            'edate' => $examDate,
            'marks' => $totalMarks,
            'dur' => $durationMinutes
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Paper published in database successfully",
            "paper" => [
                "id" => $paperUid,
                "paperNumber" => $paperNumber,
                "paperCode" => $paperCode,
                "title" => $title,
                "batch" => $batch,
                "subject" => $subject,
                "term" => $term,
                "month" => $month,
                "year" => $year,
                "examDate" => $examDate,
                "totalMarks" => $totalMarks,
                "durationMinutes" => $durationMinutes,
                "status" => "published",
                "results" => []
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to save paper: " . $e->getMessage()]);
    }
    exit();
}

// 3. DELETE: Remove paper and its results
if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? '');
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Paper ID required."]);
        exit();
    }

    try {
        $pdo->beginTransaction();
        $delRes = $pdo->prepare("DELETE FROM paper_results WHERE paper_uid = :id");
        $delRes->execute(['id' => $id]);

        $delPaper = $pdo->prepare("DELETE FROM papers WHERE paper_uid = :id OR id = :id_num");
        $delPaper->execute(['id' => $id, 'id_num' => is_numeric($id) ? (int)$id : 0]);
        $pdo->commit();

        echo json_encode(["success" => true, "message" => "Paper and all associated results deleted from database."]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}
