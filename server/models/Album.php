<?php
class Album {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function create($userId, $name, $description = null, $isPublic = false) {
        $stmt = $this->db->prepare("
            INSERT INTO albums (user_id, name, description, is_public, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $now = date('Y-m-d H:i:s');
        $stmt->execute([$userId, $name, $description, $isPublic ? 1 : 0, $now, $now]);
        
        return $this->db->lastInsertId();
    }
    
    public function getUserAlbums($userId) {
        $stmt = $this->db->prepare("
            SELECT 
                a.id, a.name, a.description, a.is_public, a.created_at,
                COUNT(i.id) as image_count,
                MIN(i.thumbnail_path) as cover_image
            FROM albums a
            LEFT JOIN images i ON i.album_id = a.id
            WHERE a.user_id = ?
            GROUP BY a.id, a.name, a.description, a.is_public, a.created_at
            ORDER BY a.created_at DESC
        ");
        $stmt->execute([$userId]);
        
        $albums = $stmt->fetchAll();
        
        // Convert is_public to boolean
        foreach ($albums as &$album) {
            $album['is_public'] = (bool)$album['is_public'];
            $album['image_count'] = (int)$album['image_count'];
        }
        
        return $albums;
    }
    
    public function findById($id, $userId = null) {
        $sql = "SELECT * FROM albums WHERE id = ?";
        $params = [$id];
        
        if ($userId !== null) {
            $sql .= " AND user_id = ?";
            $params[] = $userId;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $album = $stmt->fetch();
        
        if ($album) {
            $album['is_public'] = (bool)$album['is_public'];
        }
        
        return $album;
    }
    
    public function findPublicById($id) {
        $stmt = $this->db->prepare("SELECT * FROM albums WHERE id = ? AND is_public = 1");
        $stmt->execute([$id]);
        $album = $stmt->fetch();
        
        if ($album) {
            $album['is_public'] = (bool)$album['is_public'];
        }
        
        return $album;
    }
    
    public function toggleVisibility($id, $userId) {
        $stmt = $this->db->prepare("
            UPDATE albums 
            SET is_public = CASE WHEN is_public = 1 THEN 0 ELSE 1 END, 
                updated_at = ?
            WHERE id = ? AND user_id = ?
        ");
        
        $now = date('Y-m-d H:i:s');
        $result = $stmt->execute([$now, $id, $userId]);
        
        if ($result && $stmt->rowCount() > 0) {
            // Return new visibility state
            $album = $this->findById($id, $userId);
            return $album['is_public'];
        }
        
        return false;
    }
}
?>