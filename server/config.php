<?php
// Development configuration - SQLite
putenv('DB_TYPE=sqlite');
putenv('DATA_DIRECTORY=' . dirname(__DIR__) . '/data');
putenv('APP_ENV=development');

// Upload settings
ini_set('upload_max_filesize', '5M');
ini_set('post_max_size', '6M');
ini_set('max_execution_time', '300');
ini_set('memory_limit', '128M');

// Load application configuration
require_once __DIR__ . '/config/app.php';
?>