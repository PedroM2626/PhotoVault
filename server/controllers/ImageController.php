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
        
        try {
            $userId = Auth::requireAuth();
            
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['error' => 'No image file provided or upload error']);
                return;
            }
            
            $title = $_POST['title'] ?? '';
            $tags = $_POST['tags'] ?? null;
            $albumId = !empty($_POST['album_id']) ? (int)$_POST['album_id'] : null;
            
            // Validate album ownership if album_id is provided
            if ($albumId) {
                $albumModel = new Album();
                $album = $albumModel->findById($albumId, $userId);
                if (!$album) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid album selected']);
                    return;
                }
            }
            
            $imageId = ImageProcessor::processImage($_FILES['image'], $title, $tags, $albumId);
            echo json_encode(['message' => 'Image uploaded successfully', 'id' => $imageId]);
        } catch (Exception $e) {
            error_log('Image upload error: ' . $e->getMessage());
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
        
        try {
            $userId = Auth::requireAuth();
            $sortBy = $_GET['sort'] ?? 'date_desc';
            
            $images = $this->imageModel->getUserImages($userId, $sortBy);
            echo json_encode(['images' => $images]);
        } catch (Exception $e) {
            error_log('Get images error: ' . $e->getMessage());
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
        
        try {
            $userId = Auth::requireAuth();
            
            // Verify image ownership
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare("SELECT id FROM images WHERE id = ? AND user_id = ?");
            $stmt->execute([$imageId, $userId]);
            
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Image not found']);
                return;
            }
            
            $isFavorite = $this->imageModel->toggleFavorite($imageId, $userId);
            echo json_encode(['is_favorite' => $isFavorite]);
        } catch (Exception $e) {
            error_log('Toggle favorite error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to toggle favorite']);
        }
    }
}
?>