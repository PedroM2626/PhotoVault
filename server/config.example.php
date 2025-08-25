<?php
// Copy this file to config.php and update with your settings

// Database configuration
// For SQLite (default for development)
putenv('DB_TYPE=sqlite');
putenv('DATA_DIRECTORY=/path/to/your/data/directory');

// For MySQL (recommended for production)
/*
putenv('DB_TYPE=mysql');
putenv('DB_HOST=localhost');
putenv('DB_NAME=photovault');
putenv('DB_USER=your_username');
putenv('DB_PASSWORD=your_password');
putenv('DATA_DIRECTORY=/path/to/your/data/directory');
*/

// Application settings
putenv('APP_ENV=development'); // development or production
putenv('SESSION_NAME=photovault_session');

// Upload settings
ini_set('upload_max_filesize', '5M');
ini_set('post_max_size', '6M');
ini_set('max_execution_time', '300');
ini_set('memory_limit', '128M');
?>