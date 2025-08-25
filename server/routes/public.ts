import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get public album and its images
router.get('/albums/:id', async (req: express.Request, res: express.Response) => {
  try {
    const albumId = parseInt(req.params.id);
    const { sort = 'date_desc' } = req.query;

    // Get public album
    const album = await db
      .selectFrom('albums')
      .select(['id', 'name', 'description', 'is_public'])
      .where('id', '=', albumId)
      .where('is_public', '=', true)
      .executeTakeFirst();

    if (!album) {
      res.status(404).json({ error: 'Public album not found' });
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
      .select([
        'id',
        'title',
        'thumbnail_path',
        'medium_path',
        'original_path',
        'tags',
        'views',
        'created_at',
      ])
      .where('album_id', '=', albumId)
      .orderBy(orderBy[0], orderBy[1])
      .execute();

    // Increment view count for each image (basic analytics)
    if (images.length > 0) {
      const imageIds = images.map(img => img.id);
      await db
        .updateTable('images')
        .set((eb) => ({ views: eb('views', '+', 1) }))
        .where('id', 'in', imageIds)
        .execute();
    }

    res.json({ album, images });
    return;
  } catch (error) {
    console.error('Failed to get public album:', error);
    res.status(500).json({ error: 'Failed to get public album' });
    return;
  }
});

export { router as publicRoutes };