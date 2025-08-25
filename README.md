# PhotoVault - PHP Image Gallery

A modern image gallery application built with React frontend and PHP backend.

## Features

- 🔐 User authentication (register/login)
- 📂 Album organization with public/private settings
- 🖼️ Image upload with automatic resizing (thumbnail, medium, original)
- 🏷️ Image tagging and search
- ⭐ Favorite images
- 📊 View counter
- 🔗 Public album sharing
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- React Router for navigation

**Backend:**
- PHP 8.0+
- SQLite (development) / MySQL (production)
- GD extension for image processing
- Session-based authentication

## Prerequisites

- PHP 8.0 or higher with GD extension enabled
- Node.js 18+ and npm
- Web server (Apache/Nginx) or PHP built-in server

## Quick Start

1. **Clone and setup:**
```bash
git clone <repository-url>
cd photovault
npm install
```

2. **Start development servers:**
```bash
npm run dev
```

This starts:
- React frontend on http://localhost:3000
- PHP backend on http://localhost:3001

The application will automatically create the SQLite database and required directories.

## Detailed Installation

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **For development:**
```bash
npm run dev:frontend  # Vite dev server only
```

3. **For production build:**
```bash
npm run build
```

### Backend Setup

1. **Configure PHP (optional):**
```bash
cp server/config.example.php server/config.php
# Edit server/config.php for custom settings
```

2. **Start PHP server:**
```bash
npm run dev:backend  # PHP server only
# OR
php -S localhost:3001 -t server/public server/public/index.php
```

3. **Set up data directory (automatic):**
The application automatically creates:
- `data/` - Main data directory
- `data/database.sqlite` - SQLite database
- `data/uploads/` - Original images
- `data/uploads/thumbs/` - Thumbnails (200x200)
- `data/uploads/medium/` - Medium images (800px width)

## Configuration

### Development (Default)
- Uses SQLite database
- Stores files in local `data/` directory
- CORS enabled for localhost:3000

### Production Setup

1. **Database Configuration:**
```php
// In server/config.php
putenv('DB_TYPE=mysql');
putenv('DB_HOST=localhost');
putenv('DB_NAME=photovault');
putenv('DB_USER=your_username');
putenv('DB_PASSWORD=your_password');
putenv('DATA_DIRECTORY=/path/to/data');
```

2. **PHP Settings:**
```ini
upload_max_filesize = 5M
post_max_size = 6M
max_execution_time = 300
memory_limit = 128M
```

3. **Web Server Configuration:**

**Apache (.htaccess included):**
```apache
DocumentRoot /path/to/photovault/server/public
```

**Nginx:**
```nginx
server {
    root /path/to/photovault/server/public;
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location /api/ {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass php-fpm;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/logout` - Logout user

### Albums
- `GET /api/albums` - Get user albums
- `POST /api/albums` - Create new album
- `GET /api/albums/{id}/images` - Get album images
- `POST /api/albums/{id}/visibility` - Toggle album visibility

### Images  
- `POST /api/images/upload` - Upload image
- `GET /api/images` - Get user images
- `POST /api/images/{id}/favorite` - Toggle image favorite

### Public
- `GET /api/public/albums/{id}` - Get public album and images

## Development Scripts

```bash
# Start both frontend and backend
npm run dev

# Start only frontend (React + Vite)
npm run dev:frontend

# Start only backend (PHP server)
npm run dev:backend

# Build for production
npm run build

# Start production server
npm start
```

## File Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── contexts/      # React contexts
│   └── public/            # Static assets
├── server/                # PHP backend
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers  
│   ├── models/          # Data models
│   ├── utils/           # Utility classes
│   └── public/          # Web root & build output
└── data/                # Data directory (auto-created)
    ├── database.sqlite  # SQLite database
    └── uploads/         # Uploaded images
```

## Features in Detail

### Image Upload & Processing
- Supports JPEG, PNG, GIF (max 5MB)
- Automatic resizing creates three versions:
  - **Thumbnail:** 200x200px (cropped square)
  - **Medium:** 800px width (proportional)
  - **Original:** Unchanged
- Preserves transparency for PNG/GIF
- Secure file validation

### Album Management
- Create unlimited albums
- Public/private visibility toggle
- Album cover images (first uploaded image)
- Album descriptions and metadata
- Share public albums via direct URL

### User System
- Secure password hashing (PHP password_hash)
- Session-based authentication
- User isolation (users only see their content)
- Personal galleries and favorites

### Search & Organization
- Search by image title or tags
- Multiple sorting options (date, name, views, size)
- Tag-based categorization
- Favorite images system
- View counter for analytics

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check PHP PDO SQLite extension
   - Verify data directory permissions (755)

2. **Image upload failures:**
   - Check PHP upload settings
   - Verify GD extension is installed
   - Check data/uploads directory permissions

3. **CORS issues:**
   - Ensure frontend runs on localhost:3000
   - Check server/config/app.php CORS settings

4. **Missing images:**
   - Check data/uploads directory exists
   - Verify web server serves /uploads/ static files

### Development Tips

- Use browser dev tools to check API responses
- Check PHP error logs for backend issues
- Monitor network tab for failed requests
- SQLite database can be inspected with DB Browser

## License

MIT License - see LICENSE file for details.
