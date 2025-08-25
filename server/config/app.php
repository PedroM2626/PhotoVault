<?php
// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('UTC');

// CORS headers
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set JSON content type for API responses
if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
    header('Content-Type: application/json');
}

// Include autoloader or dependencies
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Album.php';
require_once __DIR__ . '/../models/Image.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/AlbumController.php';
require_once __DIR__ . '/../controllers/ImageController.php';
require_once __DIR__ . '/../controllers/PublicController.php';
require_once __DIR__ . '/../utils/ImageProcessor.php';
require_once __DIR__ . '/../utils/Auth.php';

// Create upload directories
$dataDir = getenv('DATA_DIRECTORY') ?: dirname(__DIR__, 2) . '/data';
$uploadsDir = $dataDir . '/uploads';
$thumbsDir = $uploadsDir . '/thumbs';
$mediumDir = $uploadsDir . '/medium';

foreach ([$dataDir, $uploadsDir, $thumbsDir, $mediumDir] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
        error_log("Created directory: $dir");
    }
}

echo "PhotoVault PHP Backend initialized successfully\n";
?>