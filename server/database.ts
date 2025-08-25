import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';

interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

interface Album {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface Image {
  id: number;
  user_id: number;
  album_id: number | null;
  title: string;
  description: string | null;
  tags: string | null;
  original_filename: string;
  original_path: string;
  medium_path: string;
  thumbnail_path: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  views: number;
  created_at: string;
  updated_at: string;
}

interface Favorite {
  id: number;
  user_id: number;
  image_id: number;
  created_at: string;
}

interface Comment {
  id: number;
  image_id: number;
  user_name: string;
  user_email: string;
  comment: string;
  created_at: string;
}

interface DatabaseSchema {
  users: User;
  albums: Album;
  images: Image;
  favorites: Favorite;
  comments: Comment;
}

const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'database.sqlite');

const sqliteDb = new Database(dbPath);

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error'],
});

console.log('Database connected:', dbPath);