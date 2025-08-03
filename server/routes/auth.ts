import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from '../config/passport.js';
import { db } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate JWT
const generateToken = (user: any) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '7d' }
  );
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }

    // Check if user already exists
    const existingUser = await db
      .selectFrom('users')
      .select(['id', 'email'])
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst();

    if (existingUser) {
      res.status(400).json({ error: 'Email já está em uso' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await db
      .insertInto('users')
      .values({
        name: name.trim(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: 'USER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'name', 'email', 'role', 'avatar_url', 'created_at'])
      .executeTakeFirstOrThrow();

    // Create JWT token
    const token = generateToken(user);

    console.log(`New user registered: ${user.email} (ID: ${user.id})`);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    // Find user
    const user = await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'role', 'password_hash', 'avatar_url'])
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst();

    if (!user || !user.password_hash) {
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    // Create JWT token
    const token = generateToken(user);

    console.log(`User logged in: ${user.email} (ID: ${user.id}, Role: ${user.role})`);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'role', 'location_lat', 'location_lng', 'avatar_url', 'created_at'])
      .where('id', '=', req.user!.id)
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location_lat: user.location_lat,
        location_lng: user.location_lng,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Google OAuth routes - only if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?token=${token}`);
    }
  );
} else {
  router.get('/google', (req, res) => {
    res.status(400).json({ error: 'Google OAuth não configurado' });
  });
  
  router.get('/google/callback', (req, res) => {
    res.status(400).json({ error: 'Google OAuth não configurado' });
  });
}

// Facebook OAuth routes - only if configured
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);
      
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?token=${token}`);
    }
  );
} else {
  router.get('/facebook', (req, res) => {
    res.status(400).json({ error: 'Facebook OAuth não configurado' });
  });
  
  router.get('/facebook/callback', (req, res) => {
    res.status(400).json({ error: 'Facebook OAuth não configurado' });
  });
}

// GitHub OAuth routes - only if configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  router.get('/github/callback',
    passport.authenticate('github', { session: false }),
    (req, res) => {
      const user = req.user as any;
      const token = generateToken(user);
      
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}?token=${token}`);
    }
  );
} else {
  router.get('/github', (req, res) => {
    res.status(400).json({ error: 'GitHub OAuth não configurado' });
  });
  
  router.get('/github/callback', (req, res) => {
    res.status(400).json({ error: 'GitHub OAuth não configurado' });
  });
}

export default router;
