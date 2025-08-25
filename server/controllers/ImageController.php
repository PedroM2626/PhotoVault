<?php
class ImageController {
    private $imageModel;
    
    public function __construct() {
        $this->imageModel = new Image();
    }
    
    public function upload() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $userId = Auth::requireAuth();
        
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No image file provided']);
            return;
        }
        
        $title = $_POST['title'] ?? '';
        $tags = $_POST['tags'] ?? null;
        $albumId = !empty($_POST['album_id']) ? (int)$_POST['album_id'] : null;
        
        try {
            $imageId = ImageProcessor::processImage($_FILES['image'], $title, $tags, $albumId);
            echo json_encode(['message' => 'Image uploaded successfully', 'id' => $imageId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
    
    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $userId = Auth::requireAuth();
        $sortBy = $_GET['sort'] ?? 'date_desc';
        
        try {
            $images = $this->imageModel->getUserImages($userId, $sortBy);
            echo json_encode(['images' => $images]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get images']);
        }
    }
    
    public function toggleFavorite($imageId) {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $userId = Auth::requireAuth();
        
        try {
            $isFavorite = $this->imageModel->toggleFavorite($imageId, $userId);
            echo json_encode(['is_favorite' => $isFavorite]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to toggle favorite']);
        }
    }
}
?>