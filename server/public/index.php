<?php
// Main entry point for the PHP application

// Set error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load configuration
require_once '../config.php';

// Get the request URI
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Check if this is an API request
if (strpos($requestUri, '/api/') === 0) {
    // Remove /api prefix and route to API handler
    $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], 4);
    require_once '../api.php';
    exit;
}

// Check if requesting uploads
if (strpos($requestUri, '/uploads/') === 0) {
    $dataDir = getenv('DATA_DIRECTORY') ?: dirname(__DIR__, 2) . '/data';
    $filePath = $dataDir . $requestUri;
    
    if (file_exists($filePath) && is_file($filePath)) {
        // Determine content type
        $mimeType = mime_content_type($filePath);
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        
        // Set caching headers for images
        header('Cache-Control: public, max-age=31536000');
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
        
        readfile($filePath);
        exit;
    } else {
        http_response_code(404);
        echo "File not found";
        exit;
    }
}

// For all other routes, serve the React app
$indexPath = __DIR__ . '/index.html';

if (file_exists($indexPath)) {
    readfile($indexPath);
} else {
    // Fallback content if built files don't exist yet
    echo '<!DOCTYPE html>
<html>
<head>
    <title>PhotoVault</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
                <h1>PhotoVault</h1>
                <p>Application is starting...</p>
                <p>Please build the frontend first: <code>npm run build</code></p>
            </div>
        </div>
    </div>
</body>
</html>';
}
?>