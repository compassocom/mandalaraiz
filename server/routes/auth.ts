import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';

const router = express.Router();

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'name', 'email', 'created_at'])
      .executeTakeFirstOrThrow();

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'development-secret',
      { expiresIn: '7d' }
    );

    console.log(`New user registered: ${user.email} (ID: ${user.id})`);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
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
      .select(['id', 'name', 'email', 'password_hash'])
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst();

    if (!user) {
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
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'development-secret',
      { expiresIn: '7d' }
    );

    console.log(`User logged in: ${user.email} (ID: ${user.id})`);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token de autorização necessário' });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret') as any;
      
      const user = await db
        .selectFrom('users')
        .select(['id', 'name', 'email', 'location_lat', 'location_lng', 'created_at'])
        .where('id', '=', decoded.userId)
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
          location_lat: user.location_lat,
          location_lng: user.location_lng,
          created_at: user.created_at,
        }
      });
    } catch (jwtError) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;