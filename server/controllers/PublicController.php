<?php
class PublicController {
    private $albumModel;
    private $imageModel;
    
    public function __construct() {
        $this->albumModel = new Album();
        $this->imageModel = new Image();
    }
    
    public function getPublicAlbum($albumId) {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        
        $sortBy = $_GET['sort'] ?? 'date_desc';
        
        try {
            $album = $this->albumModel->findPublicById($albumId);
            
            if (!$album) {
                http_response_code(404);
                echo json_encode(['error' => 'Public album not found']);
                return;
            }
            
            $images = $this->imageModel->getPublicAlbumImages($albumId, $sortBy);
            
            // Increment view count for images
            if (!empty($images)) {
                $imageIds = array_column($images, 'id');
                $this->imageModel->incrementViews($imageIds);
            }
            
            echo json_encode(['album' => $album, 'images' => $images]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to get public album']);
        }
    }
}
?>