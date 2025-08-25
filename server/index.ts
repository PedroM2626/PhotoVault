import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { setupStaticServing } from './static-serve.js';
import { authRoutes } from './routes/auth.js';
import { imageRoutes } from './routes/images.js';
import { albumRoutes } from './routes/albums.js';
import { publicRoutes } from './routes/public.js';

dotenv.config();

const app = express();

// Ensure data and uploads directories exist
const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
const uploadsDir = path.join(dataDir, 'uploads');
const thumbsDir = path.join(uploadsDir, 'thumbs');
const mediumDir = path.join(uploadsDir, 'medium');

[dataDir, uploadsDir, thumbsDir, mediumDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created directory:', dir);
  }
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Serve uploads directory statically
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
  return;
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    
    app.listen(port, () => {
      console.log(`PhotoVault server running on port ${port}`);
      console.log(`Data directory: ${dataDir}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting PhotoVault server...');
  startServer(process.env.PORT || 3001);
}