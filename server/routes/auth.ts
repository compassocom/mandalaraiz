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

// Initialize admin users if they don't exist
const initializeAdminUsers = async () => {
  try {
    console.log('Checking and creating admin users...');
    
    // Check if admin exists
    const adminExists = await db
      .selectFrom('users')
      .select(['id', 'email'])
      .where('email', '=', 'admin@mandalaraiz.org')
      .executeTakeFirst();

    if (!adminExists) {
      const adminHash = await bcrypt.hash('admin123', 12);
      const adminUser = await db
        .insertInto('users')
        .values({
          email: 'admin@mandalaraiz.org',
          name: 'Administrador',
          password_hash: adminHash,
          role: 'ADMIN',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning(['id', 'email', 'role'])
        .executeTakeFirstOrThrow();
      
      console.log(`✅ Admin user created: ${adminUser.email} (ID: ${adminUser.id})`);
    } else {
      console.log(`✅ Admin user already exists: ${adminExists.email} (ID: ${adminExists.id})`);
    }

    // Check if moderator exists
    const moderatorExists = await db
      .selectFrom('users')
      .select(['id', 'email'])
      .where('email', '=', 'moderator@mandalaraiz.org')
      .executeTakeFirst();

    if (!moderatorExists) {
      const moderatorHash = await bcrypt.hash('moderator123', 12);
      const moderatorUser = await db
        .insertInto('users')
        .values({
          email: 'moderator@mandalaraiz.org',
          name: 'Moderador',
          password_hash: moderatorHash,
          role: 'MODERATOR',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning(['id', 'email', 'role'])
        .executeTakeFirstOrThrow();
      
      console.log(`✅ Moderator user created: ${moderatorUser.email} (ID: ${moderatorUser.id})`);
    } else {
      console.log(`✅ Moderator user already exists: ${moderatorExists.email} (ID: ${moderatorExists.id})`);
    }

    console.log('Admin users initialization completed.');
  } catch (error) {
    console.error('❌ Error initializing admin users:', error);
  }
};

// Initialize admin users on module load
initializeAdminUsers();

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

    console.log(`✅ New user registered: ${user.email} (ID: ${user.id})`);

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
    console.error('❌ Registration error:', error);
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

    console.log(`🔍 Login attempt for: ${email}`);

    // Find user
    const user = await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'role', 'password_hash', 'avatar_url'])
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst();

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    if (!user.password_hash) {
      console.log(`❌ No password hash for user: ${email}`);
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    console.log(`👤 User found: ${user.email} (Role: ${user.role})`);

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log(`❌ Invalid password for: ${email}`);
      res.status(401).json({ error: 'Email ou senha incorretos' });
      return;
    }

    // Create JWT token
    const token = generateToken(user);

    console.log(`✅ Login successful: ${user.email} (Role: ${user.role})`);

    const redirectTo = user.role === 'ADMIN' ? '/admin' : 
                      user.role === 'MODERATOR' ? '/admin' : '/dashboard';

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      token,
      redirectTo
    });
  } catch (error) {
    console.error('❌ Login error:', error);
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
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Google OAuth routes - only if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    (req, res) => {
      try {
        const user = req.user as any;
        const token = generateToken(user);
        
        const redirectTo = user.role === 'ADMIN' ? '/admin' : '/dashboard';
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}${redirectTo}?token=${token}`);
      } catch (error) {
        console.error('❌ Google OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_error`);
      }
    }
  );
} else {
  router.get('/google', (req, res) => {
    res.status(400).json({ error: 'Google OAuth não configurado' });
  });
  
  router.get('/google/callback', (req, res) => {
    console.log('⚠️ Google OAuth not configured, redirecting to login');
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  });
}

// Facebook OAuth routes - only if configured
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
      try {
        const user = req.user as any;
        const token = generateToken(user);
        
        const redirectTo = user.role === 'ADMIN' ? '/admin' : '/dashboard';
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}${redirectTo}?token=${token}`);
      } catch (error) {
        console.error('❌ Facebook OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_error`);
      }
    }
  );
} else {
  router.get('/facebook', (req, res) => {
    res.status(400).json({ error: 'Facebook OAuth não configurado' });
  });
  
  router.get('/facebook/callback', (req, res) => {
    console.log('⚠️ Facebook OAuth not configured, redirecting to login');
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  });
}

// GitHub OAuth routes - only if configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  router.get('/github/callback',
    passport.authenticate('github', { session: false }),
    (req, res) => {
      try {
        const user = req.user as any;
        const token = generateToken(user);
        
        const redirectTo = user.role === 'ADMIN' ? '/admin' : '/dashboard';
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}${redirectTo}?token=${token}`);
      } catch (error) {
        console.error('❌ GitHub OAuth callback error:', error);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_error`);
      }
    }
  );
} else {
  router.get('/github', (req, res) => {
    res.status(400).json({ error: 'GitHub OAuth não configurado' });
  });
  
  router.get('/github/callback', (req, res) => {
    console.log('⚠️ GitHub OAuth not configured, redirecting to login');
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  });
}

export default router;
