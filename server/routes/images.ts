import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.env.DATA_DIRECTORY || 'data', 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  },
});

// Apply auth middleware to all routes
router.use(requireAuth);

// Upload image endpoint
router.post('/upload', upload.single('image'), async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const { title, tags, album_id } = req.body;
    const userId = req.session.userId;
    const originalPath = req.file.path;
    const dataDir = process.env.DATA_DIRECTORY || 'data';

    // Generate medium and thumbnail versions
    const filename = path.parse(req.file.filename).name;
    const ext = path.parse(req.file.filename).ext;

    const mediumPath = path.join(dataDir, 'uploads', 'medium', `${filename}${ext}`);
    const thumbnailPath = path.join(dataDir, 'uploads', 'thumbs', `${filename}${ext}`);

    // Get image metadata
    const metadata = await sharp(originalPath).metadata();

    // Create medium version (max width 800px)
    await sharp(originalPath)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);

    // Create thumbnail (200x200px)
    await sharp(originalPath)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Save to database
    const result = await db
      .insertInto('images')
      .values({
        user_id: userId,
        album_id: album_id ? parseInt(album_id) : null,
        title: title || path.parse(req.file.originalname).name,
        tags: tags || null,
        original_filename: req.file.originalname,
        original_path: `/uploads/${req.file.filename}`,
        medium_path: `/uploads/medium/${filename}${ext}`,
        thumbnail_path: `/uploads/thumbs/${filename}${ext}`,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        width: metadata.width || null,
        height: metadata.height || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .executeTakeFirstOrThrow();

    console.log('Image uploaded successfully:', result.insertId);
    res.json({ message: 'Image uploaded successfully', id: result.insertId });
    return;
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
    return;
  }
});

// Get user's images
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId;
    const { sort = 'date_desc' } = req.query;

    let orderBy: [string, 'asc' | 'desc'];
    
    switch (sort) {
      case 'date_asc':
        orderBy = ['created_at', 'asc'];
        break;
      case 'name_asc':
        orderBy = ['title', 'asc'];
        break;
      case 'name_desc':
        orderBy = ['title', 'desc'];
        break;
      case 'views_desc':
        orderBy = ['views', 'desc'];
        break;
      case 'size_desc':
        orderBy = ['file_size', 'desc'];
        break;
      default:
        orderBy = ['created_at', 'desc'];
    }

    const images = await db
      .selectFrom('images')
      .leftJoin('favorites', (join) =>
        join
          .onRef('favorites.image_id', '=', 'images.id')
          .on('favorites.user_id', '=', userId)
      )
      .select([
        'images.id',
        'images.title',
        'images.thumbnail_path',
        'images.medium_path',
        'images.original_path',
        'images.tags',
        'images.views',
        'images.created_at',
        db.fn.coalesce('favorites.id', null).as('is_favorite'),
      ])
      .where('images.user_id', '=', userId)
      .orderBy(orderBy[0], orderBy[1])
      .execute();

    const processedImages = images.map(image => ({
      ...image,
      is_favorite: image.is_favorite !== null,
    }));

    res.json({ images: processedImages });
    return;
  } catch (error) {
    console.error('Failed to get images:', error);
    res.status(500).json({ error: 'Failed to get images' });
    return;
  }
});

// Toggle favorite
router.post('/:id/favorite', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId;
    const imageId = parseInt(req.params.id);

    // Check if already favorited
    const existing = await db
      .selectFrom('favorites')
      .select(['id'])
      .where('user_id', '=', userId)
      .where('image_id', '=', imageId)
      .executeTakeFirst();

    if (existing) {
      // Remove favorite
      await db
        .deleteFrom('favorites')
        .where('id', '=', existing.id)
        .execute();
      
      res.json({ is_favorite: false });
    } else {
      // Add favorite
      await db
        .insertInto('favorites')
        .values({
          user_id: userId,
          image_id: imageId,
          created_at: new Date().toISOString(),
        })
        .execute();
      
      res.json({ is_favorite: true });
    }
    return;
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
    return;
  }
});

export { router as imageRoutes };