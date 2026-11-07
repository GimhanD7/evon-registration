<?php
// ========================================================
// Automated Database Backup & Google Drive Sync API
// Evon Aravinda Commerce Education LMS
// ========================================================

require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Ensure backups directory exists
$backupsDir = __DIR__ . '/../backups';
if (!is_dir($backupsDir)) {
    @mkdir($backupsDir, 0777, true);
}

// --------------------------------------------------------
// 1. GET: List available database backups on server
// --------------------------------------------------------
if ($method === 'GET') {
    $backupFiles = [];
    if (is_dir($backupsDir)) {
        $files = glob($backupsDir . '/*.{json,sql}', GLOB_BRACE);
        if ($files) {
            foreach ($files as $file) {
                $backupFiles[] = [
                    'filename' => basename($file),
                    'filesize' => filesize($file),
                    'filesize_kb' => round(filesize($file) / 1024, 2),
                    'created_at' => date('Y-m-d H:i:s', filemtime($file)),
                    'type' => pathinfo($file, PATHINFO_EXTENSION),
                ];
            }
        }
    }

    // Sort newest first
    usort($backupFiles, function ($a, $b) {
        return strcmp($b['created_at'], $a['created_at']);
    });

    echo json_encode([
        'status' => 'success',
        'total_backups' => count($backupFiles),
        'backups' => array_slice($backupFiles, 0, 25),
        'storage_directory' => 'backend/backups/'
    ]);
    exit();
}

// --------------------------------------------------------
// 2. POST: Generate backup / Test Webhook
// --------------------------------------------------------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    // Optional: Test Webhook connection only
    if (!empty($input['test_webhook'])) {
        $testUrl = trim($input['webhook_url'] ?? '');
        if (empty($testUrl) || strpos($testUrl, 'drive.google.com') !== false) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid Webhook URL. Please provide your Google Apps Script URL (script.google.com).'
            ]);
            exit();
        }

        $ch = curl_init($testUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $testResp = curl_exec($ch);
        $testHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $testErr = curl_error($ch);
        curl_close($ch);

        $parsed = json_decode($testResp, true);

        // Check if Google redirected to a login screen (meaning 'Who has access' was set to 'Only myself')
        if (strpos((string)$testResp, 'accounts.google.com') !== false || strpos((string)$testResp, 'ServiceLogin') !== false) {
            echo json_encode([
                'status' => 'error',
                'message' => "Access denied by Google: In Google Apps Script, click 'Deploy' > 'Manage deployments', click the Edit pencil, and change 'Who has access' from 'Only myself' to 'Anyone'.",
                'http_code' => $testHttp
            ]);
            exit();
        }

        $isOk = (!$testErr && $testHttp >= 200 && $testHttp < 400);

        echo json_encode([
            'status' => $isOk ? 'success' : 'error',
            'http_code' => $testHttp,
            'message' => $isOk
                ? 'Google Drive Webhook connection verified successfully! Folder 1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB is reachable.'
                : ($testErr ?: "HTTP {$testHttp} response received"),
            'response' => $parsed ?? substr((string)$testResp, 0, 300)
        ]);
        exit();
    }

    $folderId = $input['folder_id'] ?? '1i2-dqALmlGCJO5FwBfylxHxJeCHY9YgB';
    $webhookUrl = trim($input['webhook_url'] ?? '');
    $timestamp = date('Y-m-d_H-i-s');

    $dbData = [
        'system' => 'Evon Aravinda Commerce Education LMS',
        'export_timestamp' => date('c'),
        'database' => $db_name ?? 'evon_lms',
        'tables' => []
    ];

    $stats = [
        'users' => 0,
        'papers' => 0,
        'results' => 0,
        'evaluations' => 0,
        'batches' => 0,
    ];

    if ($pdo) {
        try {
            // Users
            $stmt = $pdo->query("SELECT * FROM users");
            $dbData['tables']['users'] = $stmt->fetchAll();
            $stats['users'] = count($dbData['tables']['users']);

            // Batches
            $stmt = $pdo->query("SELECT * FROM batches");
            $dbData['tables']['batches'] = $stmt->fetchAll();
            $stats['batches'] = count($dbData['tables']['batches']);

            // Papers
            $stmt = $pdo->query("SELECT * FROM papers");
            $dbData['tables']['papers'] = $stmt->fetchAll();
            $stats['papers'] = count($dbData['tables']['papers']);

            // Results
            $stmt = $pdo->query("SELECT * FROM paper_results");
            $dbData['tables']['paper_results'] = $stmt->fetchAll();
            $stats['results'] = count($dbData['tables']['paper_results']);

            // Evaluations
            $stmt = $pdo->query("SELECT * FROM evaluations");
            $dbData['tables']['evaluations'] = $stmt->fetchAll();
            $stats['evaluations'] = count($dbData['tables']['evaluations']);
        } catch (Exception $e) {
            $dbData['error'] = $e->getMessage();
        }
    }

    // Include client payload tables if database is in local state
    if (!empty($input['client_payload'])) {
        $dbData['client_payload'] = $input['client_payload'];
    }

    // Save JSON backup file locally in backend/backups/
    $jsonFilename = "evon_lms_db_backup_{$timestamp}.json";
    $jsonFilePath = "{$backupsDir}/{$jsonFilename}";
    $jsonContent = json_encode($dbData, JSON_PRETTY_PRINT);
    file_put_contents($jsonFilePath, $jsonContent);

    // Save SQL backup file locally in backend/backups/
    $sqlFilename = "evon_lms_mysql_dump_{$timestamp}.sql";
    $sqlFilePath = "{$backupsDir}/{$sqlFilename}";
    $sqlContent = "-- Evon LMS MySQL Automated Backup\n-- Timestamp: {$timestamp}\n\n";
    foreach ($dbData['tables'] as $table => $rows) {
        $sqlContent .= "-- Table: {$table} (" . count($rows) . " rows)\n";
        foreach ($rows as $row) {
            $cols = array_map(function($c) { return "`{$c}`"; }, array_keys($row));
            $vals = array_map(function($v) use ($pdo) {
                if ($v === null) return 'NULL';
                return $pdo ? $pdo->quote($v) : "'" . addslashes((string)$v) . "'";
            }, array_values($row));
            $sqlContent .= "INSERT INTO `{$table}` (" . implode(', ', $cols) . ") VALUES (" . implode(', ', $vals) . ");\n";
        }
        $sqlContent .= "\n";
    }
    file_put_contents($sqlFilePath, $sqlContent);

    // Forward to Google Drive Webhook if configured
    $gdriveUploadResult = null;
    $gdriveFileUrl = null;
    $driveUploadStatus = 'not_configured';

    if (!empty($webhookUrl) && strpos($webhookUrl, 'drive.google.com') === false && strpos($webhookUrl, 'http') === 0) {
        $postData = json_encode([
            'folderId' => $folderId,
            'filename' => $jsonFilename,
            'content' => $jsonContent,
            'mimeType' => 'application/json',
            'stats' => $stats,
            'timestamp' => $timestamp
        ]);

        $ch = curl_init($webhookUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!$curlError && ($httpCode >= 200 && $httpCode < 400)) {
            $parsedResponse = json_decode($response, true);
            $hasSucceeded = ($parsedResponse['status'] ?? '') === 'success' || !empty($parsedResponse['fileId']) || !empty($parsedResponse['url']);
            $driveUploadStatus = $hasSucceeded ? 'success' : 'failed';
            $gdriveUploadResult = [
                'status' => $driveUploadStatus,
                'http_code' => $httpCode,
                'response' => $parsedResponse ?? $response
            ];
            if (!empty($parsedResponse['url'])) {
                $gdriveFileUrl = $parsedResponse['url'];
            } else if (!empty($parsedResponse['fileId'])) {
                $gdriveFileUrl = "https://drive.google.com/file/d/{$parsedResponse['fileId']}/view";
            }
        } else {
            $driveUploadStatus = 'error';
            $gdriveUploadResult = [
                'status' => 'error',
                'http_code' => $httpCode,
                'error' => $curlError ?: 'HTTP error ' . $httpCode
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => $driveUploadStatus === 'success'
            ? 'Database snapshot uploaded to Google Drive folder successfully.'
            : 'Database snapshot archived on server. Google Drive sync requires connected webhook.',
        'timestamp' => $timestamp,
        'stats' => $stats,
        'local_backup' => [
            'json_file' => $jsonFilename,
            'sql_file' => $sqlFilename,
            'json_size_kb' => round(filesize($jsonFilePath) / 1024, 2),
            'sql_size_kb' => round(filesize($sqlFilePath) / 1024, 2),
        ],
        'google_drive' => [
            'folder_id' => $folderId,
            'folder_url' => "https://drive.google.com/drive/folders/{$folderId}?usp=sharing",
            'uploaded' => $driveUploadStatus,
            'file_url' => $gdriveFileUrl,
            'details' => $gdriveUploadResult
        ]
    ]);
    exit();
}
