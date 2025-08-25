<?php
class ImageProcessor {
    public static function processImage($uploadedFile, $title, $tags = null, $albumId = null) {
        $dataDir = getenv('DATA_DIRECTORY') ?: dirname(__DIR__, 2) . '/data';
        $uploadsDir = $dataDir . '/uploads';
        $thumbsDir = $uploadsDir . '/thumbs';
        $mediumDir = $uploadsDir . '/medium';
        
        // Validate file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($uploadedFile['type'], $allowedTypes)) {
            throw new Exception('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        }
        
        if ($uploadedFile['size'] > 5 * 1024 * 1024) {
            throw new Exception('File size exceeds 5MB limit.');
        }
        
        // Generate unique filename
        $extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
        $uniqueName = time() . '_' . rand(100000, 999999) . '.' . $extension;
        
        $originalPath = $uploadsDir . '/' . $uniqueName;
        $mediumPath = $mediumDir . '/' . $uniqueName;
        $thumbnailPath = $thumbsDir . '/' . $uniqueName;
        
        // Move uploaded file
        if (!move_uploaded_file($uploadedFile['tmp_name'], $originalPath)) {
            throw new Exception('Failed to save uploaded file.');
        }
        
        // Get image dimensions
        $imageInfo = getimagesize($originalPath);
        $width = $imageInfo[0];
        $height = $imageInfo[1];
        
        // Create image resource
        $sourceImage = null;
        switch ($uploadedFile['type']) {
            case 'image/jpeg':
                $sourceImage = imagecreatefromjpeg($originalPath);
                break;
            case 'image/png':
                $sourceImage = imagecreatefrompng($originalPath);
                break;
            case 'image/gif':
                $sourceImage = imagecreatefromgif($originalPath);
                break;
        }
        
        if (!$sourceImage) {
            throw new Exception('Failed to process image.');
        }
        
        // Create medium version (max width 800px)
        $mediumWidth = 800;
        $mediumHeight = ($height / $width) * $mediumWidth;
        if ($width <= $mediumWidth) {
            copy($originalPath, $mediumPath);
        } else {
            $mediumImage = imagecreatetruecolor($mediumWidth, $mediumHeight);
            
            // Preserve transparency for PNG and GIF
            if ($uploadedFile['type'] === 'image/png' || $uploadedFile['type'] === 'image/gif') {
                imagecolortransparent($mediumImage, imagecolorallocatealpha($mediumImage, 0, 0, 0, 127));
                imagealphablending($mediumImage, false);
                imagesavealpha($mediumImage, true);
            }
            
            imagecopyresampled($mediumImage, $sourceImage, 0, 0, 0, 0, $mediumWidth, $mediumHeight, $width, $height);
            
            switch ($uploadedFile['type']) {
                case 'image/jpeg':
                    imagejpeg($mediumImage, $mediumPath, 85);
                    break;
                case 'image/png':
                    imagepng($mediumImage, $mediumPath, 8);
                    break;
                case 'image/gif':
                    imagegif($mediumImage, $mediumPath);
                    break;
            }
            
            imagedestroy($mediumImage);
        }
        
        // Create thumbnail (200x200px)
        $thumbSize = 200;
        $thumbnailImage = imagecreatetruecolor($thumbSize, $thumbSize);
        
        // Preserve transparency
        if ($uploadedFile['type'] === 'image/png' || $uploadedFile['type'] === 'image/gif') {
            imagecolortransparent($thumbnailImage, imagecolorallocatealpha($thumbnailImage, 0, 0, 0, 127));
            imagealphablending($thumbnailImage, false);
            imagesavealpha($thumbnailImage, true);
        }
        
        // Calculate crop dimensions for square thumbnail
        $cropSize = min($width, $height);
        $cropX = ($width - $cropSize) / 2;
        $cropY = ($height - $cropSize) / 2;
        
        imagecopyresampled($thumbnailImage, $sourceImage, 0, 0, $cropX, $cropY, $thumbSize, $thumbSize, $cropSize, $cropSize);
        
        switch ($uploadedFile['type']) {
            case 'image/jpeg':
                imagejpeg($thumbnailImage, $thumbnailPath, 80);
                break;
            case 'image/png':
                imagepng($thumbnailImage, $thumbnailPath, 8);
                break;
            case 'image/gif':
                imagegif($thumbnailImage, $thumbnailPath);
                break;
        }
        
        imagedestroy($thumbnailImage);
        imagedestroy($sourceImage);
        
        // Save to database
        $userId = $_SESSION['user_id'];
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            INSERT INTO images (
                user_id, album_id, title, tags, original_filename, 
                original_path, medium_path, thumbnail_path, file_size, 
                mime_type, width, height, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $now = date('Y-m-d H:i:s');
        $stmt->execute([
            $userId,
            $albumId,
            $title ?: pathinfo($uploadedFile['name'], PATHINFO_FILENAME),
            $tags,
            $uploadedFile['name'],
            '/uploads/' . $uniqueName,
            '/uploads/medium/' . $uniqueName,
            '/uploads/thumbs/' . $uniqueName,
            $uploadedFile['size'],
            $uploadedFile['type'],
            $width,
            $height,
            $now,
            $now
        ]);
        
        return $db->lastInsertId();
    }
}
?>