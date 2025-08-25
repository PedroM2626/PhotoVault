<?php
class AlbumController {
    private $albumModel;
    
    public function __construct() {
        $this->albumModel = new Album();
    }
    
    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $userId = Auth::requireAuth();
        
        try {
            $albums = $this->albumModel->getUserAlbums($userId);
            echo json_encode(['albums' => $albums]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get albums']);
        }
    }
    
    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $userId = Auth::requireAuth();
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        $name = $input['name'] ?? '';
        $description = $input['description'] ?? null;
        $isPublic = $input['is_public'] ?? false;
        
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Album name is required']);
            return;
        }
        
        try {
            $albumId = $this->albumModel->create($userId, $name, $description, $isPublic);
            echo json_encode(['message' => 'Album created successfully', 'id' => $albumId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create album']);
        }
    }
    
    public function getImages($albumId) {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $userId = Auth::requireAuth();
        $sortBy = $_GET['sort'] ?? 'date_desc';
        
        // Verify album ownership
        $album = $this->albumModel->findById($albumId, $userId);
        if (!$album) {
            http_response_code(404);
            echo json_encode(['error' => 'Album not found']);
            return;
        }
        
        try {
            $imageModel = new Image();
            $images = $imageModel->getAlbumImages($albumId, $userId, $sortBy);
            echo json_encode(['images' => $images]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get album images']);
        }
    }
    
    public function toggleVisibility($albumId) {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $userId = Auth::requireAuth();
        
        try {
            $isPublic = $this->albumModel->toggleVisibility($albumId, $userId);
            
            if ($isPublic === false) {
                http_response_code(404);
                echo json_encode(['error' => 'Album not found']);
                return;
            }
            
            echo json_encode(['is_public' => $isPublic]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to toggle album visibility']);
        }
    }
}
?>