<?php
require_once 'config.php';

// Parse the request URI
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove /api prefix if present
$requestUri = preg_replace('/^\/api/', '', $requestUri);

// Route the request
try {
    switch (true) {
        // Auth routes
        case $requestUri === '/auth/register':
            $controller = new AuthController();
            $controller->register();
            break;
            
        case $requestUri === '/auth/login':
            $controller = new AuthController();
            $controller->login();
            break;
            
        case $requestUri === '/auth/check':
            $controller = new AuthController();
            $controller->check();
            break;
            
        case $requestUri === '/auth/logout':
            $controller = new AuthController();
            $controller->logout();
            break;
        
        // Album routes
        case $requestUri === '/albums' && $requestMethod === 'GET':
            $controller = new AlbumController();
            $controller->index();
            break;
            
        case $requestUri === '/albums' && $requestMethod === 'POST':
            $controller = new AlbumController();
            $controller->create();
            break;
            
        case preg_match('/^\/albums\/(\d+)\/images$/', $requestUri, $matches):
            $controller = new AlbumController();
            $controller->getImages($matches[1]);
            break;
            
        case preg_match('/^\/albums\/(\d+)\/visibility$/', $requestUri, $matches):
            $controller = new AlbumController();
            $controller->toggleVisibility($matches[1]);
            break;
        
        // Image routes
        case $requestUri === '/images/upload':
            $controller = new ImageController();
            $controller->upload();
            break;
            
        case $requestUri === '/images' && $requestMethod === 'GET':
            $controller = new ImageController();
            $controller->index();
            break;
            
        case preg_match('/^\/images\/(\d+)\/favorite$/', $requestUri, $matches):
            $controller = new ImageController();
            $controller->toggleFavorite($matches[1]);
            break;
        
        // Public routes
        case preg_match('/^\/public\/albums\/(\d+)$/', $requestUri, $matches):
            $controller = new PublicController();
            $controller->getPublicAlbum($matches[1]);
            break;
        
        // Health check
        case $requestUri === '/health':
            echo json_encode(['status' => 'ok', 'timestamp' => date('c')]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found: ' . $requestUri]);
            break;
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>