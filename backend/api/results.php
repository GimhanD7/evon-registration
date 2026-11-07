<?php
// ========================================================
// Paper Student Results & Leaderboard API
// - Auto-retrieves student profile (name, school, avatar) from users table
// - Enforces UNIQUE index numbers per paper: duplicate index numbers are detected,
//   reported, and ignored so they are never stored in the database!
// ========================================================

require_once __DIR__ . '/../config/db.php';
require_db_connection();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Dynamic detection of avatar_url column to safely prevent SQLSTATE[42S22]
$hasAvatarCol = false;
try {
    $cols = $pdo->query("SHOW COLUMNS FROM `users`")->fetchAll(PDO::FETCH_COLUMN);
    $hasAvatarCol = in_array('avatar_url', array_map('strtolower', $cols ?: []));
} catch (Exception $e) {
    $hasAvatarCol = false;
}

$avatarSelectExpr = $hasAvatarCol 
    ? "COALESCE(NULLIF(u.avatar_url, ''), r.avatar_image) as avatarImage" 
    : "r.avatar_image as avatarImage";
$userLookupCols = $hasAvatarCol ? "full_name, school, avatar_url" : "full_name, school";

// 1. GET: Fetch results
if ($method === 'GET') {
    $paperId = trim($_GET['paperId'] ?? $_GET['paper_uid'] ?? '');
    $indexNo = trim($_GET['indexNo'] ?? '');

    try {
        if (!empty($paperId)) {
            $stmt = $pdo->prepare("SELECT 
                r.result_uid as id, 
                r.paper_uid as paperId, 
                r.rank_in_class as `rank`, 
                COALESCE(NULLIF(u.full_name, ''), r.student_name) as `name`, 
                COALESCE(NULLIF(u.school, ''), r.school) as school, 
                r.index_no as indexNo, 
                r.part1_score as part1Score, 
                r.part2_score as part2Score, 
                r.total_score as totalScore, 
                r.grade, 
                r.achievement, 
                r.avatar_initials as avatarInitials, 
                {$avatarSelectExpr} 
                FROM paper_results r
                LEFT JOIN users u ON (r.index_no = u.index_no OR r.index_no = u.phone OR u.user_uid = CONCAT('std-', r.index_no))
                WHERE r.paper_uid = :pid 
                ORDER BY r.rank_in_class ASC, r.total_score DESC");
            $stmt->execute(['pid' => $paperId]);
            $results = $stmt->fetchAll();
            echo json_encode(["success" => true, "paperId" => $paperId, "results" => $results]);
            exit();
        }

        if (!empty($indexNo)) {
            $stmt = $pdo->prepare("SELECT 
                r.result_uid as id, 
                r.paper_uid as paperId, 
                p.title as paperTitle, 
                r.rank_in_class as `rank`, 
                COALESCE(NULLIF(u.full_name, ''), r.student_name) as `name`, 
                COALESCE(NULLIF(u.school, ''), r.school) as school, 
                r.index_no as indexNo, 
                r.part1_score as part1Score, 
                r.part2_score as part2Score, 
                r.total_score as totalScore, 
                r.grade, 
                r.achievement, 
                r.avatar_initials as avatarInitials, 
                {$avatarSelectExpr} 
                FROM paper_results r 
                LEFT JOIN papers p ON r.paper_uid = p.paper_uid 
                LEFT JOIN users u ON (r.index_no = u.index_no OR r.index_no = u.phone OR u.user_uid = CONCAT('std-', r.index_no))
                WHERE r.index_no = :idx 
                ORDER BY r.id DESC");
            $stmt->execute(['idx' => $indexNo]);
            $results = $stmt->fetchAll();
            echo json_encode(["success" => true, "indexNo" => $indexNo, "results" => $results]);
            exit();
        }

        // Return summary of all results
        $stmt = $pdo->query("SELECT 
            r.result_uid as id, 
            r.paper_uid as paperId, 
            r.rank_in_class as `rank`, 
            COALESCE(NULLIF(u.full_name, ''), r.student_name) as `name`, 
            COALESCE(NULLIF(u.school, ''), r.school) as school, 
            r.index_no as indexNo, 
            r.part1_score as part1Score, 
            r.part2_score as part2Score, 
            r.total_score as totalScore, 
            r.grade, 
            r.achievement, 
            r.avatar_initials as avatarInitials, 
            {$avatarSelectExpr} 
            FROM paper_results r
            LEFT JOIN users u ON (r.index_no = u.index_no OR r.index_no = u.phone OR u.user_uid = CONCAT('std-', r.index_no))
            ORDER BY r.id DESC LIMIT 200");
        $results = $stmt->fetchAll();
        echo json_encode(["success" => true, "results" => $results]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// 2. POST: Add single result or bulk results (only indexNo + part1 + part2 needed!)
if ($method === 'POST') {
    $data = get_json_payload();
    $paperId = trim($data['paperId'] ?? $data['paper_uid'] ?? '');
    $uploadMode = trim($data['mode'] ?? 'append'); // 'append' or 'replace'

    if (empty($paperId)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Paper ID is required."]);
        exit();
    }

    try {
        $userLookupStmt = $pdo->prepare("SELECT {$userLookupCols} FROM users WHERE index_no = :idx OR phone = :idx OR user_uid = :uid LIMIT 1");

        // Bulk upload: if 'results' array is passed
        if (isset($data['results']) && is_array($data['results'])) {
            $pdo->beginTransaction();

            if ($uploadMode === 'replace') {
                $delStmt = $pdo->prepare("DELETE FROM paper_results WHERE paper_uid = :pid");
                $delStmt->execute(['pid' => $paperId]);
                $existingIndexMap = [];
            } else {
                // Fetch already existing index numbers in this paper to detect duplicates
                $existStmt = $pdo->prepare("SELECT index_no FROM paper_results WHERE paper_uid = :pid");
                $existStmt->execute(['pid' => $paperId]);
                $existingRows = $existStmt->fetchAll(PDO::FETCH_COLUMN);
                $existingIndexMap = [];
                foreach ($existingRows as $ex) {
                    $existingIndexMap[trim(strtolower($ex))] = true;
                }
            }

            $stmtInsert = $pdo->prepare("INSERT INTO paper_results (result_uid, paper_uid, rank_in_class, student_name, school, index_no, part1_score, part2_score, total_score, grade, achievement, avatar_initials, avatar_image) 
                VALUES (:uid, :pid, :rnk, :sname, :school, :idx, :p1, :p2, :tot, :grd, :ach, :init, :img)
                ON DUPLICATE KEY UPDATE 
                rank_in_class=VALUES(rank_in_class),
                student_name=VALUES(student_name),
                school=VALUES(school),
                part1_score=VALUES(part1_score),
                part2_score=VALUES(part2_score),
                total_score=VALUES(total_score),
                grade=VALUES(grade),
                achievement=VALUES(achievement),
                avatar_initials=VALUES(avatar_initials),
                avatar_image=VALUES(avatar_image)");

            $seenInBatch = [];
            $ignoredDuplicates = [];
            $insertedCount = 0;

            foreach ($data['results'] as $r) {
                $indexNo = trim($r['indexNo'] ?? '');
                if (empty($indexNo)) continue;
                $cleanIdx = strtolower($indexNo);

                // 1. Check if index number repeated inside this uploaded batch
                if (isset($seenInBatch[$cleanIdx])) {
                    $ignoredDuplicates[] = $indexNo;
                    continue; // IGNORE duplicate within batch
                }
                $seenInBatch[$cleanIdx] = true;

                // 2. Check if index number already exists in this exam paper (in database)
                if ($uploadMode !== 'replace' && isset($existingIndexMap[$cleanIdx])) {
                    $ignoredDuplicates[] = $indexNo;
                    continue; // IGNORE duplicate already present in this paper
                }

                // Lookup student from users table in database by index number
                $userLookupStmt->execute(['idx' => $indexNo, 'uid' => "std-{$indexNo}"]);
                $userRow = $userLookupStmt->fetch();

                $studentName = $userRow ? $userRow['full_name'] : (!empty($r['name']) ? trim($r['name']) : "Candidate {$indexNo}");
                $school = $userRow && !empty($userRow['school']) ? $userRow['school'] : (!empty($r['school']) ? trim($r['school']) : "Commerce Faculty");
                $avatarImg = $userRow && !empty($userRow['avatar_url']) ? $userRow['avatar_url'] : (!empty($r['avatarImage']) ? trim($r['avatarImage']) : "");

                $p1 = (int)($r['part1Score'] ?? 0);
                $p2 = (int)($r['part2Score'] ?? 0);
                $total = (int)($r['totalScore'] ?? ($p1 + $p2));
                $grade = trim($r['grade'] ?? ($total >= 75 ? "A" : ($total >= 65 ? "B" : ($total >= 50 ? "C" : ($total >= 35 ? "S" : "F")))));
                $resUid = !empty($r['id']) ? $r['id'] : "res-{$paperId}-{$indexNo}";
                
                $initials = "ST";
                if (!empty($studentName)) {
                    $parts = explode(" ", $studentName);
                    $initials = strtoupper(substr($parts[0], 0, 1) . (count($parts) > 1 ? substr(end($parts), 0, 1) : ""));
                }

                $stmtInsert->execute([
                    'uid' => $resUid,
                    'pid' => $paperId,
                    'rnk' => (int)($r['rank'] ?? 1),
                    'sname' => $studentName,
                    'school' => $school,
                    'idx' => $indexNo,
                    'p1' => $p1,
                    'p2' => $p2,
                    'tot' => $total,
                    'grd' => $grade,
                    'ach' => trim($r['achievement'] ?? ''),
                    'init' => $initials,
                    'img' => $avatarImg
                ]);
                $insertedCount++;
            }

            // Recalculate ranks for this paper
            recalculatePaperRanks($pdo, $paperId);
            $pdo->commit();

            $msg = "Successfully saved {$insertedCount} unique student results into the database.";
            if (count($ignoredDuplicates) > 0) {
                $msg .= " " . count($ignoredDuplicates) . " duplicate index numbers were automatically ignored and not stored.";
            }

            echo json_encode([
                "success" => true, 
                "message" => $msg, 
                "count" => $insertedCount,
                "ignoredCount" => count($ignoredDuplicates),
                "ignoredIndexNumbers" => array_values(array_unique($ignoredDuplicates))
            ]);
            exit();
        }

        // Single result entry
        $indexNo = trim($data['indexNo'] ?? '');
        if (empty($indexNo)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Student Index number is required."]);
            exit();
        }

        // 3. Edit existing student marks
        $isEdit = (!empty($data['action']) && $data['action'] === 'edit') || !empty($data['isEdit']);
        if ($isEdit) {
            $part1 = min(40, max(0, (int)($data['part1Score'] ?? 0)));
            $part2 = min(60, max(0, (int)($data['part2Score'] ?? 0)));
            $total = (int)($data['totalScore'] ?? ($part1 + $part2));
            $grade = trim($data['grade'] ?? ($total >= 95 ? "A*" : ($total >= 75 ? "A" : ($total >= 65 ? "B" : ($total >= 50 ? "C" : ($total >= 35 ? "S" : "F"))))));
            $achievement = trim($data['achievement'] ?? '');
            $studentName = trim($data['name'] ?? '');
            $school = trim($data['school'] ?? '');
            $resultUid = trim($data['id'] ?? $data['resultId'] ?? '');

            $pdo->beginTransaction();
            $upSql = "UPDATE paper_results 
                SET part1_score = :p1, part2_score = :p2, total_score = :tot, grade = :grd, achievement = :ach";
            if (!empty($studentName)) $upSql .= ", student_name = :sname";
            if (!empty($school)) $upSql .= ", school = :school";
            $upSql .= " WHERE paper_uid = :pid AND (result_uid = :uid OR LOWER(index_no) = LOWER(:idx))";

            $upStmt = $pdo->prepare($upSql);
            $params = [
                'p1' => $part1,
                'p2' => $part2,
                'tot' => $total,
                'grd' => $grade,
                'ach' => $achievement,
                'pid' => $paperId,
                'uid' => $resultUid,
                'idx' => $indexNo,
            ];
            if (!empty($studentName)) $params['sname'] = $studentName;
            if (!empty($school)) $params['school'] = $school;

            $upStmt->execute($params);
            recalculatePaperRanks($pdo, $paperId);
            $pdo->commit();

            echo json_encode([
                "success" => true,
                "message" => "Student marks updated successfully for Index No {$indexNo}.",
                "totalScore" => $total,
                "grade" => $grade
            ]);
            exit();
        }

        // Enforce: index numbers cannot be duplicated in the same exam paper
        $checkStmt = $pdo->prepare("SELECT id, student_name FROM paper_results WHERE paper_uid = :pid AND LOWER(index_no) = LOWER(:idx) LIMIT 1");
        $checkStmt->execute(['pid' => $paperId, 'idx' => $indexNo]);
        $existingRecord = $checkStmt->fetch();
        if ($existingRecord) {
            echo json_encode([
                "success" => false,
                "error" => "Duplicate Index Number: Student with Index No '{$indexNo}' ({$existingRecord['student_name']}) is already recorded in this exam paper. Index numbers cannot be duplicated."
            ]);
            exit();
        }

        // Lookup student from users table in database
        $userLookupStmt->execute(['idx' => $indexNo, 'uid' => "std-{$indexNo}"]);
        $userRow = $userLookupStmt->fetch();

        $studentName = $userRow ? $userRow['full_name'] : (!empty($data['name']) ? trim($data['name']) : "Candidate {$indexNo}");
        $school = $userRow && !empty($userRow['school']) ? $userRow['school'] : (!empty($data['school']) ? trim($data['school']) : "Commerce Faculty");
        $avatarImg = $userRow && !empty($userRow['avatar_url']) ? $userRow['avatar_url'] : (!empty($data['avatarImage']) ? trim($data['avatarImage']) : "");

        $part1 = (int)($data['part1Score'] ?? 0);
        $part2 = (int)($data['part2Score'] ?? 0);
        $total = (int)($data['totalScore'] ?? ($part1 + $part2));
        $grade = trim($data['grade'] ?? ($total >= 75 ? "A" : ($total >= 65 ? "B" : ($total >= 50 ? "C" : ($total >= 35 ? "S" : "F")))));

        $resUid = !empty($data['id']) ? $data['id'] : "res-{$paperId}-{$indexNo}";
        $parts = explode(" ", $studentName);
        $initials = strtoupper(substr($parts[0], 0, 1) . (count($parts) > 1 ? substr(end($parts), 0, 1) : ""));

        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO paper_results (result_uid, paper_uid, rank_in_class, student_name, school, index_no, part1_score, part2_score, total_score, grade, achievement, avatar_initials, avatar_image) 
            VALUES (:uid, :pid, 1, :sname, :school, :idx, :p1, :p2, :tot, :grd, :ach, :init, :img)
            ON DUPLICATE KEY UPDATE 
            student_name=VALUES(student_name),
            school=VALUES(school),
            part1_score=VALUES(part1_score),
            part2_score=VALUES(part2_score),
            total_score=VALUES(total_score),
            grade=VALUES(grade),
            avatar_initials=VALUES(avatar_initials),
            avatar_image=VALUES(avatar_image)");

        $stmt->execute([
            'uid' => $resUid,
            'pid' => $paperId,
            'sname' => $studentName,
            'school' => $school,
            'idx' => $indexNo,
            'p1' => $part1,
            'p2' => $part2,
            'tot' => $total,
            'grd' => $grade,
            'ach' => trim($data['achievement'] ?? ''),
            'init' => $initials,
            'img' => $avatarImg
        ]);

        recalculatePaperRanks($pdo, $paperId);
        $pdo->commit();

        echo json_encode([
            "success" => true, 
            "message" => "Result saved for {$studentName} ({$school}).",
            "studentName" => $studentName,
            "school" => $school
        ]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

// 3. DELETE: Remove single result
if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? '');
    $paperId = trim($_GET['paperId'] ?? '');

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Result ID is required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM paper_results WHERE result_uid = :id OR id = :id_num");
        $stmt->execute(['id' => $id, 'id_num' => is_numeric($id) ? (int)$id : 0]);

        if (!empty($paperId)) {
            recalculatePaperRanks($pdo, $paperId);
        }

        echo json_encode(["success" => true, "message" => "Result deleted."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit();
}

function generate_auto_status($total, $part1, $part2, $rank = 1) {
    if ($rank === 1 && $total === 100) return "Island 1st • Perfect Score 100%";
    if ($rank === 1) return "Island 1st • High Distinction";
    if ($rank === 2) return "Class 2nd • High Distinction";
    if ($rank === 3) return "Class 3rd • Distinction Award";
    if ($rank <= 5) return "Top 5 Finalist";
    if ($rank <= 10) return "Top 10 Finalist";
    if ($part1 === 40 && $total >= 75) return "Distinction (A) • Perfect MCQ 40/40";
    if ($total >= 95) return "High Distinction (A*)";
    if ($total >= 75) return "Distinction Pass (A)";
    if ($total >= 65) return "Very Good Pass (B)";
    if ($total >= 50) return "Credit Pass (C)";
    if ($total >= 35) return "Ordinary Pass (S)";
    return "Needs Improvement (F)";
}

function recalculatePaperRanks($pdo, $paperId) {
    $stmt = $pdo->prepare("SELECT id, total_score, part1_score, part2_score, achievement FROM paper_results WHERE paper_uid = :pid ORDER BY total_score DESC, part2_score DESC, id ASC");
    $stmt->execute(['pid' => $paperId]);
    $rows = $stmt->fetchAll();

    $updateStmt = $pdo->prepare("UPDATE paper_results SET rank_in_class = :rnk, achievement = :ach WHERE id = :id");
    $rank = 1;
    foreach ($rows as $row) {
        $tot = (int)$row['total_score'];
        $p1 = (int)$row['part1_score'];
        $p2 = (int)$row['part2_score'];
        $autoStatus = generate_auto_status($tot, $p1, $p2, $rank);

        $updateStmt->execute([
            'rnk' => $rank++,
            'ach' => $autoStatus,
            'id' => $row['id']
        ]);
    }

    // Update candidate count, highest mark, average mark, and auto-set paper status to published
    $statStmt = $pdo->prepare("SELECT COUNT(*) as cnt, MAX(total_score) as hmark, AVG(total_score) as avgmark FROM paper_results WHERE paper_uid = :pid");
    $statStmt->execute(['pid' => $paperId]);
    $stats = $statStmt->fetch();

    if ($stats && (int)$stats['cnt'] > 0) {
        $upPaper = $pdo->prepare("UPDATE papers SET total_candidates = :cnt, highest_mark = :hmark, average_mark = :avgmark, status = 'published' WHERE paper_uid = :pid");
        $upPaper->execute([
            'cnt' => (int)$stats['cnt'],
            'hmark' => (int)($stats['hmark'] ?? 100),
            'avgmark' => round((float)($stats['avgmark'] ?? 75), 2),
            'pid' => $paperId
        ]);
    }
}
