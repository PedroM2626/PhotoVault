<?php
class User {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function create($username, $email, $password) {
        // Check if user already exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$email, $username]);
        
        if ($stmt->fetch()) {
            throw new Exception('User already exists');
        }
        
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Create user
        $stmt = $this->db->prepare("
            INSERT INTO users (username, email, password_hash, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $now = date('Y-m-d H:i:s');
        $stmt->execute([$username, $email, $passwordHash, $now, $now]);
        
        return $this->db->lastInsertId();
    }
    
    public function authenticate($email, $password) {
        $stmt = $this->db->prepare("
            SELECT id, username, email, password_hash 
            FROM users WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            return false;
        }
        
        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ];
    }
    
    public function findById($id) {
        $stmt = $this->db->prepare("SELECT id, username, email FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}
?>