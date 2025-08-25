<?php
class Auth {
    public static function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit();
        }
        return $_SESSION['user_id'];
    }
    
    public static function getCurrentUser() {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, username, email FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch();
    }
    
    public static function login($userId, $user) {
        $_SESSION['user_id'] = $userId;
        $_SESSION['user'] = $user;
    }
    
    public static function logout() {
        session_destroy();
    }
    
    public static function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
}
?>