<?php
// Main entry point for the PHP application

// Set error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load configuration first
require_once dirname(__DIR__) . '/config.php';

// Get the request URI
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Check if this is an API request
if (strpos($requestUri, '/api/') === 0) {
    // Remove /api prefix and route to API handler
    $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], 4);
    require_once dirname(__DIR__) . '/api.php';
    exit;
}

// Check if requesting uploads
if (strpos($requestUri, '/uploads/') === 0) {
    $dataDir = getenv('DATA_DIRECTORY') ?: dirname(__DIR__, 2) . '/data';
    $filePath = $dataDir . $requestUri;
    
    if (file_exists($filePath) && is_file($filePath)) {
        // Security check - ensure file is within uploads directory
        $realPath = realpath($filePath);
        $realUploadsDir = realpath($dataDir . '/uploads');
        
        if ($realPath && $realUploadsDir && strpos($realPath, $realUploadsDir) === 0) {
            // Determine content type
            $mimeType = mime_content_type($filePath);
            if ($mimeType) {
                header('Content-Type: ' . $mimeType);
            }
            header('Content-Length: ' . filesize($filePath));
            
            // Set caching headers for images
            header('Cache-Control: public, max-age=31536000');
            header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
            
            readfile($filePath);
            exit;
        }
    }
    
    http_response_code(404);
    echo "File not found";
    exit;
}

// For all other routes, serve the React app
$indexPath = __DIR__ . '/index.html';

if (file_exists($indexPath)) {
    // Don't set content-type header for HTML as it's already set by the web server
    readfile($indexPath);
} else {
    // Fallback content if built files don't exist yet
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
<html>
<head>
    <title>PhotoVault</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 100px auto; text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.5; }
        code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>PhotoVault</h1>
        <p>Application is starting...</p>
        <p>Please build the frontend first:</p>
        <p><code>npm run build</code></p>
        <p>Then refresh this page.</p>
    </div>
</body>
</html>';
}
?>