import express from 'express';
import { db } from '../database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Get user's albums
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.session.userId;

    const albums = await db
      .selectFrom('albums')
      .leftJoin('images', 'images.album_id', 'albums.id')
      .select([
        'albums.id',
        'albums.name',
        'albums.description',
        'albums.is_public',
        'albums.created_at',
        db.fn.count('images.id').as('image_count'),
        db.fn.min('images.thumbnail_path').as('cover_image'),
      ])
      .where('albums.user_id', '=', userId)
      .groupBy([
        'albums.id',
        'albums.name',
        'albums.description',
        'albums.is_public',
        'albums.created_at',
      ])
      .orderBy('albums.created_at', 'desc')
      .execute();

    res.json({ albums });
    return;
  } catch (error) {
    console.error('Failed to get albums:', error);
    res.status(500).json({ error: 'Failed to get albums' });
    return;
  }
});

// Create new album
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, is_public } = req.body;
    const userId = req.session.userId;

    if (!name) {
      res.status(400).json({ error: 'Album name is required' });
      return;
    }

    const result = await db
      .insertInto('albums')
      .values({
        user_id: userId,
        name,
        description: description || null,
        is_public: !!is_public,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .executeTakeFirstOrThrow();

    console.log('Album created successfully:', result.insertId);
    res.json({ message: 'Album created successfully', id: result.insertId });
    return;
  } catch (error) {
    console.error('Failed to create album:', error);
    res.status(500).json({ error: 'Failed to create album' });
    return;
  }
});

// Get images in album
router.get('/:id/images', async (req: express.Request, res: express.Response) => {
  try {
    const albumId = parseInt(req.params.id);
    const userId = req.session.userId;
    const { sort = 'date_desc' } = req.query;

    // Verify album ownership
    const album = await db
      .selectFrom('albums')
      .select(['id', 'user_id'])
      .where('id', '=', albumId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!album) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }

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
      .where('images.album_id', '=', albumId)
      .orderBy(orderBy[0], orderBy[1])
      .execute();

    const processedImages = images.map(image => ({
      ...image,
      is_favorite: image.is_favorite !== null,
    }));

    res.json({ images: processedImages });
    return;
  } catch (error) {
    console.error('Failed to get album images:', error);
    res.status(500).json({ error: 'Failed to get album images' });
    return;
  }
});

// Toggle album visibility
router.post('/:id/visibility', async (req: express.Request, res: express.Response) => {
  try {
    const albumId = parseInt(req.params.id);
    const userId = req.session.userId;

    // Get current album
    const album = await db
      .selectFrom('albums')
      .select(['id', 'is_public'])
      .where('id', '=', albumId)
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!album) {
      res.status(404).json({ error: 'Album not found' });
      return;
    }

    // Toggle visibility
    await db
      .updateTable('albums')
      .set({
        is_public: !album.is_public,
        updated_at: new Date().toISOString(),
      })
      .where('id', '=', albumId)
      .execute();

    res.json({ is_public: !album.is_public });
    return;
  } catch (error) {
    console.error('Failed to toggle album visibility:', error);
    res.status(500).json({ error: 'Failed to toggle album visibility' });
    return;
  }
});

export { router as albumRoutes };