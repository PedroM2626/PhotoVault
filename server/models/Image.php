<?php
class Image {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function getUserImages($userId, $sortBy = 'date_desc') {
        $orderBy = $this->getOrderByClause($sortBy);
        
        $stmt = $this->db->prepare("
            SELECT 
                i.id, i.title, i.thumbnail_path, i.medium_path, i.original_path,
                i.tags, i.views, i.created_at,
                CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
            FROM images i
            LEFT JOIN favorites f ON f.image_id = i.id AND f.user_id = ?
            WHERE i.user_id = ?
            ORDER BY $orderBy
        ");
        
        $stmt->execute([$userId, $userId]);
        $images = $stmt->fetchAll();
        
        // Convert is_favorite to boolean
        foreach ($images as &$image) {
            $image['is_favorite'] = (bool)$image['is_favorite'];
            $image['views'] = (int)$image['views'];
        }
        
        return $images;
    }
    
    public function getAlbumImages($albumId, $userId, $sortBy = 'date_desc') {
        $orderBy = $this->getOrderByClause($sortBy);
        
        $stmt = $this->db->prepare("
            SELECT 
                i.id, i.title, i.thumbnail_path, i.medium_path, i.original_path,
                i.tags, i.views, i.created_at,
                CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
            FROM images i
            LEFT JOIN favorites f ON f.image_id = i.id AND f.user_id = ?
            WHERE i.album_id = ? AND i.user_id = ?
            ORDER BY $orderBy
        ");
        
        $stmt->execute([$userId, $albumId, $userId]);
        $images = $stmt->fetchAll();
        
        foreach ($images as &$image) {
            $image['is_favorite'] = (bool)$image['is_favorite'];
            $image['views'] = (int)$image['views'];
        }
        
        return $images;
    }
    
    public function getPublicAlbumImages($albumId, $sortBy = 'date_desc') {
        $orderBy = $this->getOrderByClause($sortBy);
        
        $stmt = $this->db->prepare("
            SELECT 
                i.id, i.title, i.thumbnail_path, i.medium_path, i.original_path,
                i.tags, i.views, i.created_at
            FROM images i
            INNER JOIN albums a ON a.id = i.album_id
            WHERE i.album_id = ? AND a.is_public = 1
            ORDER BY $orderBy
        ");
        
        $stmt->execute([$albumId]);
        $images = $stmt->fetchAll();
        
        foreach ($images as &$image) {
            $image['views'] = (int)$image['views'];
        }
        
        return $images;
    }
    
    public function toggleFavorite($imageId, $userId) {
        // Check if already favorited
        $stmt = $this->db->prepare("SELECT id FROM favorites WHERE user_id = ? AND image_id = ?");
        $stmt->execute([$userId, $imageId]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Remove favorite
            $stmt = $this->db->prepare("DELETE FROM favorites WHERE user_id = ? AND image_id = ?");
            $stmt->execute([$userId, $imageId]);
            return false;
        } else {
            // Add favorite
            $stmt = $this->db->prepare("
                INSERT INTO favorites (user_id, image_id, created_at) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$userId, $imageId, date('Y-m-d H:i:s')]);
            return true;
        }
    }
    
    public function incrementViews($imageIds) {
        if (empty($imageIds)) return;
        
        $placeholders = str_repeat('?,', count($imageIds) - 1) . '?';
        $stmt = $this->db->prepare("UPDATE images SET views = views + 1 WHERE id IN ($placeholders)");
        $stmt->execute($imageIds);
    }
    
    private function getOrderByClause($sortBy) {
        switch ($sortBy) {
            case 'date_asc':
                return 'i.created_at ASC';
            case 'name_asc':
                return 'i.title ASC';
            case 'name_desc':
                return 'i.title DESC';
            case 'views_desc':
                return 'i.views DESC';
            case 'size_desc':
                return 'i.file_size DESC';
            default:
                return 'i.created_at DESC';
        }
    }
}
?>