import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user already exists
    const existingUser = await db
      .selectFrom('users')
      .select(['id'])
      .where('email', '=', email)
      .orWhere('username', '=', username)
      .executeTakeFirst();

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db
      .insertInto('users')
      .values({
        username,
        email,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .executeTakeFirstOrThrow();

    const userId = result.insertId as number;

    // Get user data
    const user = await db
      .selectFrom('users')
      .select(['id', 'username', 'email'])
      .where('id', '=', userId)
      .executeTakeFirstOrThrow();

    req.session.userId = user.id;
    res.json({ user });
    return;
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
    return;
  }
});

// Login endpoint
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await db
      .selectFrom('users')
      .select(['id', 'username', 'email', 'password_hash'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    req.session.userId = user.id;
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
    return;
  }
});

// Check authentication endpoint
router.get('/check', async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await db
      .selectFrom('users')
      .select(['id', 'username', 'email'])
      .where('id', '=', req.session.userId)
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
    return;
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Auth check failed' });
    return;
  }
});

// Logout endpoint
router.post('/logout', (req: express.Request, res: express.Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.json({ message: 'Logged out successfully' });
    return;
  });
});

export { router as authRoutes };